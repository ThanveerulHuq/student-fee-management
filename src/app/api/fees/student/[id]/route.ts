import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const studentId = params.id

    // Get all enrollments for the student with fee details
    const enrollments = await prisma.studentYear.findMany({
      where: { studentId },
      include: {
        student: true,
        academicYear: true,
        class: true,
        commonFee: true,
        paidFee: true,
        feeTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 transactions
        },
      },
      orderBy: { createdAt: "desc" },
    })

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: "No enrollments found for this student" },
        { status: 404 }
      )
    }

    // Calculate fee summary for each enrollment
    const enrollmentsWithSummary = enrollments.map((enrollment) => {
      const totalFee = 
        enrollment.commonFee.schoolFee +
        enrollment.commonFee.bookFee +
        enrollment.uniformFee +
        enrollment.islamicStudies +
        enrollment.vanFee -
        enrollment.scholarship

      const totalPaid = enrollment.paidFee?.totalPaid || 0
      const outstanding = Math.max(0, totalFee - totalPaid)

      return {
        ...enrollment,
        feeBreakdown: {
          schoolFee: {
            total: enrollment.commonFee.schoolFee,
            paid: enrollment.paidFee?.schoolFeePaid || 0,
            outstanding: Math.max(0, enrollment.commonFee.schoolFee - (enrollment.paidFee?.schoolFeePaid || 0)),
          },
          bookFee: {
            total: enrollment.commonFee.bookFee,
            paid: enrollment.paidFee?.bookFeePaid || 0,
            outstanding: Math.max(0, enrollment.commonFee.bookFee - (enrollment.paidFee?.bookFeePaid || 0)),
          },
          uniformFee: {
            total: enrollment.uniformFee,
            paid: enrollment.paidFee?.uniformFeePaid || 0,
            outstanding: Math.max(0, enrollment.uniformFee - (enrollment.paidFee?.uniformFeePaid || 0)),
          },
          islamicStudies: {
            total: enrollment.islamicStudies,
            paid: enrollment.paidFee?.islamicStudiesPaid || 0,
            outstanding: Math.max(0, enrollment.islamicStudies - (enrollment.paidFee?.islamicStudiesPaid || 0)),
          },
          vanFee: {
            total: enrollment.vanFee,
            paid: enrollment.paidFee?.vanFeePaid || 0,
            outstanding: Math.max(0, enrollment.vanFee - (enrollment.paidFee?.vanFeePaid || 0)),
          },
          scholarship: enrollment.scholarship,
          totalFee,
          totalPaid,
          outstanding,
        },
      }
    })

    return NextResponse.json({
      student: enrollments[0].student,
      enrollments: enrollmentsWithSummary,
    })
  } catch (error) {
    console.error("Error fetching student fee details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}