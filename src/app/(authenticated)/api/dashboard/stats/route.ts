import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYear')

    if (!academicYearId) {
      return NextResponse.json({ error: "Academic year is required" }, { status: 400 })
    }

    // Get total students enrolled in the current academic year
    const totalStudents = await prisma.studentEnrollment.count({
      where: {
        academicYearId: academicYearId,
        isActive: true
      }
    })

    // Get monthly collections for current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthlyCollections = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        status: "COMPLETED"
      },
      _sum: {
        totalAmount: true
      }
    })

    // Get total pending fees for current academic year
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        academicYearId: academicYearId,
        isActive: true
      },
      select: {
        totals: true
      }
    })

    const pendingFees = enrollments.reduce((total, enrollment) => {
      return total + (enrollment.totals.netAmount.due || 0)
    }, 0)

    const stats = {
      totalStudents,
      monthlyCollections: monthlyCollections._sum.totalAmount || 0,
      pendingFees
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}