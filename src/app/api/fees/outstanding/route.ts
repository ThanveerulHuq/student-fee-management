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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const skip = (page - 1) * limit

    // Get all enrollments using the denormalized model
    const enrollments = await prisma.studentEnrollment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    })

    // Transform to match expected response format
    const enrollmentsWithOutstanding = enrollments.map((enrollment) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      academicYearId: enrollment.academicYearId,
      classId: enrollment.classId,
      section: enrollment.section,
      enrollmentDate: enrollment.enrollmentDate,
      isActive: enrollment.isActive,
      
      // Student info (denormalized)
      student: {
        id: enrollment.studentId,
        admissionNo: enrollment.student.admissionNumber,
        name: `${enrollment.student.name}`,
        fatherName: enrollment.student.fatherName,
        mobileNo: enrollment.student.mobileNo,
        status: enrollment.student.status
      },
      
      // Academic year info (denormalized)
      academicYear: {
        id: enrollment.academicYearId,
        year: enrollment.academicYear.year,
        startDate: enrollment.academicYear.startDate,
        endDate: enrollment.academicYear.endDate,
        isActive: enrollment.academicYear.isActive
      },
      
      // Class info (denormalized)
      class: {
        id: enrollment.classId,
        className: enrollment.class.className,
        order: enrollment.class.order,
        isActive: enrollment.class.isActive
      },
      
      // Fee breakdown from embedded fees
      feeBreakdown: {
        fees: enrollment.fees.map(fee => ({
          templateName: fee.templateName,
          total: fee.amount,
          paid: fee.amountPaid,
          outstanding: fee.amountDue
        })),
        scholarships: enrollment.scholarships.map(scholarship => ({
          templateName: scholarship.templateName,
          amount: scholarship.amount,
          isActive: scholarship.isActive
        })),
        totals: enrollment.totals,
        feeStatus: enrollment.feeStatus
      }
    }))

    // Calculate summary statistics
    const totalOutstanding = enrollments.reduce(
      (sum, enrollment) => sum + enrollment.totals.netAmount.due,
      0
    )

    const totalStudents = enrollments.length

    // Get total count for pagination
    const totalCount = await prisma.studentEnrollment.count()

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