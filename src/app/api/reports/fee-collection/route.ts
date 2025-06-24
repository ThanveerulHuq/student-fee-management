import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PaymentMethod } from "@/generated/prisma"
import type { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get("academicYearId")
    const classId = searchParams.get("classId")
    const paymentDateFrom = searchParams.get("paymentDateFrom")
    const paymentDateTo = searchParams.get("paymentDateTo")
    const paymentMethod = searchParams.get("paymentMethod")
    const createdBy = searchParams.get("createdBy")
    const format = searchParams.get("format") // 'json' or 'csv'

    // Validate required date range
    if (!paymentDateFrom || !paymentDateTo) {
      return NextResponse.json(
        { error: "Payment date range is required" },
        { status: 400 }
      )
    }

    // Build where conditions
    const where: {
      paymentDate: {
        gte: Date
        lte: Date
      }
      paymentMethod?: PaymentMethod
      createdBy?: string
      studentYear?: {
        academicYearId?: string
        classId?: string
      }
    } = {
      paymentDate: {
        gte: new Date(paymentDateFrom),
        lte: new Date(paymentDateTo + "T23:59:59.999Z"), // Include full day
      },
    }

    if (paymentMethod) where.paymentMethod = paymentMethod as PaymentMethod
    if (createdBy) where.createdBy = createdBy

    // Add enrollment filters if provided
    if (academicYearId || classId) {
      where.studentYear = {}
      if (academicYearId) where.studentYear.academicYearId = academicYearId
      if (classId) where.studentYear.classId = classId
    }

    // Get fee transactions
    const transactions = await prisma.feeTxn.findMany({
      where,
      include: {
        studentYear: {
          include: {
            student: true,
            academicYear: true,
            class: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    })

    // Calculate statistics
    const totalTransactions = transactions.length
    const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmountPaid, 0)
    const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0

    // Group by payment method
    const paymentMethodSummary: Record<string, { count: number; amount: number }> = {}
    transactions.forEach(transaction => {
      const method = transaction.paymentMethod
      if (!paymentMethodSummary[method]) {
        paymentMethodSummary[method] = { count: 0, amount: 0 }
      }
      paymentMethodSummary[method].count++
      paymentMethodSummary[method].amount += transaction.totalAmountPaid
    })

    // Group by day
    const dailySummary: Record<string, { count: number; amount: number }> = {}
    transactions.forEach(transaction => {
      const date = transaction.paymentDate.toDateString()
      if (!dailySummary[date]) {
        dailySummary[date] = { count: 0, amount: 0 }
      }
      dailySummary[date].count++
      dailySummary[date].amount += transaction.totalAmountPaid
    })

    // Group by class if filtering by academic year
    const classSummary: Record<string, { count: number; amount: number }> = {}
    transactions.forEach(transaction => {
      const className = transaction.studentYear.class.className
      if (!classSummary[className]) {
        classSummary[className] = { count: 0, amount: 0 }
      }
      classSummary[className].count++
      classSummary[className].amount += transaction.totalAmountPaid
    })

    // Group by collector
    const collectorSummary: Record<string, { count: number; amount: number }> = {}
    transactions.forEach(transaction => {
      const collector = transaction.createdBy
      if (!collectorSummary[collector]) {
        collectorSummary[collector] = { count: 0, amount: 0 }
      }
      collectorSummary[collector].count++
      collectorSummary[collector].amount += transaction.totalAmountPaid
    })

    // Fee breakdown
    const feeBreakdown = {
      schoolFee: transactions.reduce((sum, t) => sum + t.schoolFee, 0),
      bookFee: transactions.reduce((sum, t) => sum + t.bookFee, 0),
      uniformFee: transactions.reduce((sum, t) => sum + t.uniformFee, 0),
      islamicStudies: transactions.reduce((sum, t) => sum + t.islamicStudies, 0),
      vanFee: transactions.reduce((sum, t) => sum + t.vanFee, 0),
    }

    const reportData = {
      transactions,
      summary: {
        totalTransactions,
        totalAmount,
        avgTransaction,
        dateRange: {
          from: paymentDateFrom,
          to: paymentDateTo,
        },
        feeBreakdown,
        paymentMethodSummary,
        dailySummary,
        classSummary,
        collectorSummary,
      },
      filters: {
        academicYearId,
        classId,
        paymentDateFrom,
        paymentDateTo,
        paymentMethod,
        createdBy,
      },
      generatedAt: new Date(),
      generatedBy: session.user.username,
    }

    // Return CSV format if requested
    if (format === "csv") {
      const csvData = generateFeeCollectionCSV(transactions)
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=fee-collection-report.csv",
        },
      })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating fee collection report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

interface Transaction {
  receiptNo: string
  paymentDate: Date | string
  schoolFee: number
  bookFee: number
  uniformFee: number
  islamicStudies: number
  vanFee: number
  totalAmountPaid: number
  paymentMethod: string
  createdBy: string
  remarks: string | null
  studentYear: {
    student: {
      name: string
      admissionNo: string
    }
    academicYear: {
      year: string
    }
    class: {
      className: string
    }
  }
}

function generateFeeCollectionCSV(transactions: Transaction[]): string {
  const headers = [
    "Receipt No",
    "Payment Date",
    "Student Name",
    "Admission No",
    "Academic Year",
    "Class",
    "School Fee",
    "Book Fee",
    "Uniform Fee",
    "Islamic Studies",
    "Van Fee",
    "Total Amount",
    "Payment Method",
    "Collected By",
    "Remarks",
  ]

  const rows = transactions.map(transaction => [
    transaction.receiptNo,
    new Date(transaction.paymentDate).toLocaleDateString(),
    transaction.studentYear.student.name,
    transaction.studentYear.student.admissionNo,
    transaction.studentYear.academicYear.year,
    transaction.studentYear.class.className,
    transaction.schoolFee,
    transaction.bookFee,
    transaction.uniformFee,
    transaction.islamicStudies,
    transaction.vanFee,
    transaction.totalAmountPaid,
    transaction.paymentMethod,
    transaction.createdBy,
    transaction.remarks || "",
  ])

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n")
}