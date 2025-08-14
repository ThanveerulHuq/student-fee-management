import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const studentId = searchParams.get("studentId")
    const receiptNo = searchParams.get("receiptNo")
    const paymentMethod = searchParams.get("paymentMethod")
    const academicYearId = searchParams.get("academicYearId")
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const sortBy = searchParams.get("sortBy") || "paymentDate"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build where conditions for payments
    const paymentWhere: any = {
      status: "COMPLETED" // Only completed payments
    }

    // Date range filter
    if (startDate || endDate) {
      paymentWhere.paymentDate = {}
      if (startDate) {
        paymentWhere.paymentDate.gte = new Date(startDate)
      }
      if (endDate) {
        // Add one day to include the end date
        const endDateTime = new Date(endDate)
        endDateTime.setDate(endDateTime.getDate() + 1)
        paymentWhere.paymentDate.lte = endDateTime
      }
    }

    // Academic year filter
    if (academicYearId && academicYearId !== "ALL") {
      paymentWhere.academicYearId = academicYearId
    }

    // Student filter (search in embedded student data)
    if (studentId && studentId.trim()) {
      if (!paymentWhere.OR) {
        paymentWhere.OR = []
      }
      paymentWhere.OR.push(
        { "student":  { is: { name: { contains: studentId.trim(), mode: "insensitive" } } } },
        { "student":  { is: { admissionNumber: { contains: studentId.trim(), mode: "insensitive" } } } },
        { "student":  { is: { fatherName: { contains: studentId.trim(), mode: "insensitive" } } } }
      )
    }

    // Receipt number filter (partial match)
    if (receiptNo) {
      paymentWhere.receiptNo = {
        contains: receiptNo,
        mode: "insensitive"
      }
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== "ALL") {
      paymentWhere.paymentMethod = paymentMethod as "CASH" | "ONLINE" | "CHEQUE"
    }

    // Build orderBy object
    const getOrderBy = (sortBy: string, sortOrder: string) => {
      switch (sortBy) {
        case "paymentDate":
          return { paymentDate: sortOrder as "asc" | "desc" }
        case "totalAmount":
          return { totalAmount: sortOrder as "asc" | "desc" }
        case "receiptNo":
          return { receiptNo: sortOrder as "asc" | "desc" }
        case "studentName":
          return { "student.name": sortOrder as "asc" | "desc" }
        default:
          return { paymentDate: "desc" as "desc" }
      }
    }

    // Calculate pagination values
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const totalCount = await prisma.payment.count({
      where: paymentWhere,
    })

    // Get all payments for summary calculations
    const allPayments = await prisma.payment.findMany({
      where: paymentWhere,
    })

    // Get paginated payments (no need to include enrollment - data is embedded)
    const payments = await prisma.payment.findMany({
      where: paymentWhere,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip,
      take: limit
    })

    // Process paginated payments using embedded data
    const processedPayments = payments.map(payment => ({
      id: payment.id,
      receiptNo: payment.receiptNo,
      studentName: payment.student.name,
      studentAdmissionNo: payment.student.admissionNumber,
      studentFatherName: payment.student.fatherName,
      studentPhone: payment.student.mobileNo,
      studentClass: payment.class.className,
      studentSection: payment.section,
      academicYear: payment.academicYear.year,
      totalAmount: payment.totalAmount,
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      remarks: payment.remarks,
      createdBy: payment.createdBy,
      paymentItems: payment.paymentItems.map(item => ({
        feeTemplateName: item.feeTemplateName,
        amount: item.amount,
        feeBalance: item.feeBalance
      }))
    }))

    // Calculate summary statistics from ALL filtered payments (not just current page)
    const totalPayments = allPayments.length
    const totalAmount = allPayments.reduce((sum, payment) => sum + payment.totalAmount, 0)

    // Group by payment method using ALL payments
    const paymentMethodBreakdown = allPayments.reduce((acc, payment) => {
      const existing = acc.find(item => item.method === payment.paymentMethod)
      if (existing) {
        existing.count += 1
        existing.amount += payment.totalAmount
      } else {
        acc.push({
          method: payment.paymentMethod,
          count: 1,
          amount: payment.totalAmount
        })
      }
      return acc
    }, [] as Array<{ method: string; count: number; amount: number }>)

    // Group by date for daily summary using ALL payments
    const dailySummary = allPayments.reduce((acc, payment) => {
      const date = payment.paymentDate.toISOString().split('T')[0] // Get date part only
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.count += 1
        existing.amount += payment.totalAmount
      } else {
        acc.push({
          date,
          count: 1,
          amount: payment.totalAmount
        })
      }
      return acc
    }, [] as Array<{ date: string; count: number; amount: number }>)
    .sort((a, b) => b.date.localeCompare(a.date)) // Sort by date descending

    // Group by collector using ALL payments
    const collectorSummary = allPayments.reduce((acc, payment) => {
      const existing = acc.find(item => item.collector === payment.createdBy)
      if (existing) {
        existing.count += 1
        existing.amount += payment.totalAmount
      } else {
        acc.push({
          collector: payment.createdBy,
          count: 1,
          amount: payment.totalAmount
        })
      }
      return acc
    }, [] as Array<{ collector: string; count: number; amount: number }>)

    const summary = {
      totalPayments,
      totalAmount,
      averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0,
      paymentMethodBreakdown: paymentMethodBreakdown.sort((a, b) => b.amount - a.amount),
      dailySummary: dailySummary.slice(0, 30), // Last 30 days
      collectorSummary: collectorSummary.sort((a, b) => b.amount - a.amount)
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      payments: processedPayments,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      },
      filters: {
        startDate,
        endDate,
        studentId,
        receiptNo,
        paymentMethod,
        academicYearId
      },
      generatedAt: new Date(),
      generatedBy: session.user.username
    })

  } catch (error) {
    console.error("Error generating fee payments report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 