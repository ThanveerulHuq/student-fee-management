import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get("academicYear")
    const groupBy = searchParams.get("groupBy") || "day" // day, week, month
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!academicYearId) {
      return NextResponse.json({ error: "Academic year is required" }, { status: 400 })
    }

    // Validate groupBy parameter
    if (!["day", "week", "month"].includes(groupBy)) {
      return NextResponse.json({ error: "Invalid groupBy parameter" }, { status: 400 })
    }

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    // First get the academic year details
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId }
    })

    if (!academicYear) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }

    // Get all payments for the academic year
    const payments = await prisma.payment.findMany({
      where: {
        studentEnrollment: {
          academicYearId: academicYearId
        },
        ...(Object.keys(dateFilter).length > 0 && {
          paymentDate: dateFilter
        })
      },
      select: {
        id: true,
        paymentDate: true,
        totalAmount: true,
        paymentMethod: true,
        paymentItems: true,
        academicYear: true
      },
      orderBy: {
        paymentDate: 'asc'
      }
    })

    // Group payments by the specified period
    const groupedData = new Map<string, {
      period: string,
      totalAmount: number,
      paymentCount: number,
      methods: { [key: string]: number },
      feeTypes: { [key: string]: number }
    }>()

    payments.forEach(payment => {
      let periodKey: string

      const date = new Date(payment.paymentDate)
      
      switch (groupBy) {
        case "day":
          periodKey = date.toISOString().split('T')[0] // YYYY-MM-DD
          break
        case "week":
          // Get start of week (Monday)
          const startOfWeek = new Date(date)
          const day = startOfWeek.getDay()
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
          startOfWeek.setDate(diff)
          periodKey = startOfWeek.toISOString().split('T')[0]
          break
        case "month":
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          periodKey = date.toISOString().split('T')[0]
      }

      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          period: periodKey,
          totalAmount: 0,
          paymentCount: 0,
          methods: {},
          feeTypes: {}
        })
      }

      const group = groupedData.get(periodKey)!
      group.totalAmount += payment.totalAmount
      group.paymentCount += 1

      // Track payment methods
      group.methods[payment.paymentMethod] = (group.methods[payment.paymentMethod] || 0) + 1

      // Track fee types from payment items
      payment.paymentItems.forEach((paymentItem: any) => {
        group.feeTypes[paymentItem.feeTemplateName] = (group.feeTypes[paymentItem.feeTemplateName] || 0) + paymentItem.amount
      })
    })

    // Convert to array and sort
    const result = Array.from(groupedData.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    )

    // Format period labels for better display
    const formattedResult = result.map(item => {
      let formattedPeriod: string
      
      switch (groupBy) {
        case "day":
          formattedPeriod = new Date(item.period).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
          break
        case "week":
          const weekStart = new Date(item.period)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)
          formattedPeriod = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          break
        case "month":
          const [year, month] = item.period.split('-')
          formattedPeriod = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })
          break
        default:
          formattedPeriod = item.period
      }

      return {
        ...item,
        formattedPeriod
      }
    })

    // Calculate summary statistics
    const totalAmount = result.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalPayments = result.reduce((sum, item) => sum + item.paymentCount, 0)
    const averagePerPeriod = result.length > 0 ? totalAmount / result.length : 0

    return NextResponse.json({
      data: formattedResult,
      summary: {
        totalAmount,
        totalPayments,
        averagePerPeriod,
        periodCount: result.length,
        groupBy
      }
    })

  } catch (error) {
    console.error("Failed to fetch transaction analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction analytics" },
      { status: 500 }
    )
  }
}