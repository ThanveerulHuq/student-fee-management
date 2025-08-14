import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.connect()

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYear')

    if (!academicYearId) {
      return NextResponse.json({ error: "Academic year is required" }, { status: 400 })
    }

    // Get total students enrolled in the current academic year
    const totalStudents = await db.studentEnrollment.countDocuments({
      academicYearId: academicYearId,
      isActive: true
    })

    // Get monthly collections for current month using aggregation
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthlyCollectionsResult = await db.payment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          },
          status: "COMPLETED"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ])

    // Get total pending fees for current academic year using aggregation
    const pendingFeesResult = await db.studentEnrollment.aggregate([
      {
        $match: {
          academicYearId: academicYearId,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: '$totals.netAmount.due' }
        }
      }
    ])

    const stats = {
      totalStudents,
      monthlyCollections: monthlyCollectionsResult[0]?.totalAmount || 0,
      pendingFees: pendingFeesResult[0]?.totalPending || 0
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