import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current month and year
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get previous month for comparison
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Run all queries in parallel for better performance
    const [
      totalStudents,
      activeStudents,
      totalEnrollments,
      activeEnrollments,
      currentMonthTransactions,
      previousMonthTransactions,
      outstandingFeesData,
      recentTransactions,
      academicYearStats,
    ] = await Promise.all([
      // Total students
      prisma.student.count(),
      
      // Active students
      prisma.student.count({ where: { isActive: true } }),
      
      // Total enrollments
      prisma.studentYear.count(),
      
      // Active enrollments
      prisma.studentYear.count({ where: { isActive: true } }),
      
      // Current month transactions
      prisma.feeTxn.findMany({
        where: {
          paymentDate: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
      }),
      
      // Previous month transactions
      prisma.feeTxn.findMany({
        where: {
          paymentDate: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }),
      
      // Outstanding fees calculation
      prisma.studentYear.findMany({
        where: { isActive: true },
        include: {
          commonFee: true,
          paidFee: true,
        },
      }),
      
      // Recent transactions
      prisma.feeTxn.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          studentYear: {
            include: {
              student: true,
              academicYear: true,
              class: true,
            },
          },
        },
      }),
      
      // Academic year statistics
      prisma.academicYear.findMany({
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: { startDate: "desc" },
      }),
    ])

    // Calculate current month collection
    const currentMonthCollection = currentMonthTransactions.reduce(
      (sum, t) => sum + t.totalAmountPaid,
      0
    )
    
    // Calculate previous month collection
    const previousMonthCollection = previousMonthTransactions.reduce(
      (sum, t) => sum + t.totalAmountPaid,
      0
    )

    // Calculate collection growth
    const collectionGrowth = previousMonthCollection > 0 
      ? ((currentMonthCollection - previousMonthCollection) / previousMonthCollection) * 100 
      : 0

    // Calculate outstanding fees
    let totalOutstanding = 0
    let studentsWithOutstanding = 0

    outstandingFeesData.forEach(enrollment => {
      const totalFee = 
        enrollment.commonFee.schoolFee +
        enrollment.commonFee.bookFee +
        enrollment.uniformFee +
        enrollment.islamicStudies +
        enrollment.vanFee -
        enrollment.scholarship

      const totalPaid = enrollment.paidFee?.totalPaid || 0
      const outstanding = Math.max(0, totalFee - totalPaid)
      
      if (outstanding > 0) {
        totalOutstanding += outstanding
        studentsWithOutstanding++
      }
    })

    // Get class-wise enrollment distribution
    const classDistribution: Record<string, number> = {}
    const classWiseEnrollments = await prisma.studentYear.findMany({
      where: { isActive: true },
      include: { class: true },
    })

    classWiseEnrollments.forEach(enrollment => {
      const className = enrollment.class.className
      classDistribution[className] = (classDistribution[className] || 0) + 1
    })

    // Calculate payment method distribution for current month
    const paymentMethodDistribution: Record<string, number> = {}
    currentMonthTransactions.forEach(transaction => {
      const method = transaction.paymentMethod
      paymentMethodDistribution[method] = (paymentMethodDistribution[method] || 0) + transaction.totalAmountPaid
    })

    // Daily collection for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toDateString()
    }).reverse()

    const dailyCollections = await Promise.all(
      last7Days.map(async (dateStr) => {
        const date = new Date(dateStr)
        const nextDate = new Date(date)
        nextDate.setDate(date.getDate() + 1)
        
        const dayTransactions = await prisma.feeTxn.findMany({
          where: {
            paymentDate: {
              gte: date,
              lt: nextDate,
            },
          },
        })
        
        return {
          date: dateStr,
          amount: dayTransactions.reduce((sum, t) => sum + t.totalAmountPaid, 0),
          count: dayTransactions.length,
        }
      })
    )

    const dashboardStats = {
      overview: {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents,
        totalEnrollments,
        activeEnrollments,
        inactiveEnrollments: totalEnrollments - activeEnrollments,
      },
      
      financial: {
        currentMonthCollection,
        previousMonthCollection,
        collectionGrowth,
        totalOutstanding,
        studentsWithOutstanding,
        averageOutstanding: studentsWithOutstanding > 0 ? totalOutstanding / studentsWithOutstanding : 0,
      },
      
      distributions: {
        classDistribution,
        paymentMethodDistribution,
        academicYearStats: academicYearStats.map(year => ({
          year: year.year,
          enrollments: year._count.enrollments,
          isActive: year.isActive,
        })),
      },
      
      trends: {
        dailyCollections,
        monthlyTransactionCount: {
          current: currentMonthTransactions.length,
          previous: previousMonthTransactions.length,
          growth: previousMonthTransactions.length > 0 
            ? ((currentMonthTransactions.length - previousMonthTransactions.length) / previousMonthTransactions.length) * 100 
            : 0,
        },
      },
      
      recentActivity: {
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction.id,
          receiptNo: transaction.receiptNo,
          studentName: transaction.studentYear.student.name,
          amount: transaction.totalAmountPaid,
          paymentDate: transaction.paymentDate,
          paymentMethod: transaction.paymentMethod,
          academicYear: transaction.studentYear.academicYear.year,
          class: transaction.studentYear.class.className,
        })),
      },
      
      generatedAt: new Date(),
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error("Error generating dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}