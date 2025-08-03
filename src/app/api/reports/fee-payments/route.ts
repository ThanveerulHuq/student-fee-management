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

    // Build where conditions for payments
    const paymentWhere: {
      paymentDate?: {
        gte?: Date
        lte?: Date
      }
      studentEnrollmentId?: string
      receiptNo?: {
        contains?: string
        mode?: "insensitive"
      }
      status?: string
    } = {
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

    // Student filter (by enrollment ID)
    if (studentId) {
      paymentWhere.studentEnrollmentId = studentId
    }

    // Receipt number filter (partial match)
    if (receiptNo) {
      paymentWhere.receiptNo = {
        contains: receiptNo,
        mode: "insensitive"
      }
    }

    // Get all payments with the filters applied
    const payments = await prisma.payment.findMany({
      where: paymentWhere,
      orderBy: {
        paymentDate: "desc"
      }
    })

    // Process payments for the report
    const processedPayments = payments.map(payment => ({
      id: payment.id,
      receiptNo: payment.receiptNo,
      studentName: `${payment.student.name}`,
      studentAdmissionNo: payment.student.admissionNumber,
      studentPhone: payment.student.mobileNo,
      studentClass: payment.student.class,
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

    // Calculate summary statistics
    const totalPayments = processedPayments.length
    const totalAmount = processedPayments.reduce((sum, payment) => sum + payment.totalAmount, 0)

    // Group by payment method
    const paymentMethodBreakdown = processedPayments.reduce((acc, payment) => {
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

    // Group by date for daily summary
    const dailySummary = processedPayments.reduce((acc, payment) => {
      const date = payment.paymentDate.split('T')[0] // Get date part only
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

    // Group by collector
    const collectorSummary = processedPayments.reduce((acc, payment) => {
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

    return NextResponse.json({
      payments: processedPayments,
      summary,
      filters: {
        startDate,
        endDate,
        studentId,
        receiptNo,
        paymentMethod
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