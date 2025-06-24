import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EnrollmentWhereCondition } from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const academicYearId = searchParams.get("academicYearId")
    const classId = searchParams.get("classId")
    const minOutstanding = parseFloat(searchParams.get("minOutstanding") || "0")

    const skip = (page - 1) * limit

    const where: EnrollmentWhereCondition = {
      isActive: true,
    }

    if (academicYearId) where.academicYearId = academicYearId
    if (classId) where.classId = classId

    // Get all active enrollments with fee details
    const enrollments = await prisma.studentYear.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: true,
        academicYear: true,
        class: true,
        commonFee: true,
        paidFee: true,
      },
      orderBy: [
        { academicYear: { startDate: "desc" } },
        { class: { order: "asc" } },
        { student: { name: "asc" } },
      ],
    })

    // Calculate outstanding fees and filter
    const enrollmentsWithOutstanding = enrollments
      .map((enrollment) => {
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
      .filter((enrollment) => enrollment.feeBreakdown.outstanding >= minOutstanding)
      .sort((a, b) => b.feeBreakdown.outstanding - a.feeBreakdown.outstanding)

    // Calculate summary statistics
    const totalOutstanding = enrollmentsWithOutstanding.reduce(
      (sum, enrollment) => sum + enrollment.feeBreakdown.outstanding,
      0
    )

    const totalStudents = enrollmentsWithOutstanding.length

    // Get count for pagination
    const totalCount = await prisma.studentYear.count({ where })

    return NextResponse.json({
      enrollments: enrollmentsWithOutstanding,
      summary: {
        totalStudents,
        totalOutstanding,
        averageOutstanding: totalStudents > 0 ? totalOutstanding / totalStudents : 0,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching outstanding fees:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}