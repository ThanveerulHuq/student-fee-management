import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface DashboardStats {
  totalStudents: number
  activeStudents: number
  totalEnrollments: number
  activeEnrollments: number
  totalCollectedFees: number
  outstandingFees: number
  recentPayments: {
    id: string
    receiptNo: string
    studentName: string
    amount: number
    date: Date
    status: string
  }[]
  monthlyStats: {
    month: string
    collected: number
    enrollments: number
  }[]
}

export const getDashboardStats = cache(async (academicYearId?: string): Promise<DashboardStats> => {
  // Get current academic year if not provided
  let currentAcademicYear = null
  if (academicYearId) {
    currentAcademicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId }
    })
  } else {
    currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    })
  }

  if (!currentAcademicYear) {
    throw new Error('No academic year found')
  }

  const [
    totalStudents,
    activeStudents,
    totalEnrollments,
    activeEnrollments,
    totalCollectedResponse,
    recentPaymentsData,
    enrollmentStats
  ] = await Promise.all([
    // Total students count
    prisma.student.count(),
    
    // Active students count
    prisma.student.count({
      where: { isActive: true }
    }),
    
    // Total enrollments for current academic year
    prisma.studentEnrollment.count({
      where: { academicYearId: currentAcademicYear.id }
    }),
    
    // Active enrollments for current academic year
    prisma.studentEnrollment.count({
      where: { 
        academicYearId: currentAcademicYear.id,
        isActive: true 
      }
    }),
    
    // Total collected fees for current academic year
    prisma.payment.aggregate({
      where: {
        studentEnrollment: {
          academicYearId: currentAcademicYear.id
        },
        status: "COMPLETED"
      },
      _sum: {
        totalAmount: true
      }
    }),
    
    // Recent payments (last 5)
    prisma.payment.findMany({
      where: {
        studentEnrollment: {
          academicYearId: currentAcademicYear.id
        }
      },
      select: {
        id: true,
        receiptNo: true,
        totalAmount: true,
        paymentDate: true,
        status: true,
        student: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      },
      take: 5
    }),
    
    // Monthly enrollment stats for the current academic year
    prisma.studentEnrollment.findMany({
      where: {
        academicYearId: currentAcademicYear.id,
      },
      select: {
        enrollmentDate: true,
        totals: true
      }
    })
  ])

  // Calculate outstanding fees from active enrollments
  const outstandingFees = enrollmentStats.reduce((total, enrollment) => {
    return total + (enrollment.totals?.netAmount?.due || 0)
  }, 0)

  // Group monthly stats
  const monthlyStatsMap = new Map<string, { collected: number, enrollments: number }>()
  
  // Process payments for monthly stats
  const paymentsThisYear = await prisma.payment.findMany({
    where: {
      studentEnrollment: {
        academicYearId: currentAcademicYear.id
      },
      paymentDate: {
        gte: currentAcademicYear.startDate,
        lte: currentAcademicYear.endDate
      },
      status: "COMPLETED"
    },
    select: {
      totalAmount: true,
      paymentDate: true
    }
  })
  
  paymentsThisYear.forEach(payment => {
    const monthKey = payment.paymentDate.toISOString().slice(0, 7) // YYYY-MM format
    const existing = monthlyStatsMap.get(monthKey) || { collected: 0, enrollments: 0 }
    existing.collected += payment.totalAmount
    monthlyStatsMap.set(monthKey, existing)
  })
  
  // Process enrollments for monthly stats
  enrollmentStats.forEach(enrollment => {
    const monthKey = enrollment.enrollmentDate.toISOString().slice(0, 7)
    const existing = monthlyStatsMap.get(monthKey) || { collected: 0, enrollments: 0 }
    existing.enrollments += 1
    monthlyStatsMap.set(monthKey, existing)
  })

  const monthlyStats = Array.from(monthlyStatsMap.entries())
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 6)

  return {
    totalStudents,
    activeStudents,
    totalEnrollments,
    activeEnrollments,
    totalCollectedFees: totalCollectedResponse._sum.totalAmount || 0,
    outstandingFees,
    recentPayments: recentPaymentsData.map(payment => ({
      id: payment.id,
      receiptNo: payment.receiptNo,
      studentName: payment.student.name,
      amount: payment.totalAmount,
      date: payment.paymentDate,
      status: payment.status
    })),
    monthlyStats
  }
})