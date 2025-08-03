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

    // Get all enrollments for the student using the new StudentEnrollment model
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { studentId },
      orderBy: { enrollmentDate: "desc" }
    })

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: "No enrollments found for this student" },
        { status: 404 }
      )
    }

    // Get recent payments for this student
    const recentPayments = await prisma.payment.findMany({
      where: {
        studentEnrollmentId: { in: enrollments.map(e => e.id) }
      },
      orderBy: { paymentDate: "desc" },
      take: 10
    })

    // Transform enrollments to match expected response format
    const enrollmentsWithSummary = enrollments.map((enrollment) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      academicYearId: enrollment.academicYearId,
      classId: enrollment.classId,
      section: enrollment.section,
      enrollmentDate: enrollment.enrollmentDate,
      isActive: enrollment.isActive,
      
      // Student info (embedded in enrollment)
      student: {
        id: enrollment.studentId,
        admissionNo: enrollment.student.admissionNumber,
        name: `${enrollment.student.name}`,
        fatherName: enrollment.student.fatherName,
        mobileNo: enrollment.student.mobileNo,
        class: enrollment.student.class,
        status: enrollment.student.status
      },
      
      // Academic year info (embedded)
      academicYear: {
        id: enrollment.academicYearId,
        year: enrollment.academicYear.year,
        startDate: enrollment.academicYear.startDate,
        endDate: enrollment.academicYear.endDate,
        isActive: enrollment.academicYear.isActive
      },
      
      // Class info (embedded)
      class: {
        id: enrollment.classId,
        className: enrollment.class.className,
        order: enrollment.class.order,
        isActive: enrollment.class.isActive
      },
      
      // Fee breakdown from embedded data
      feeBreakdown: {
        fees: enrollment.fees.map(fee => ({
          id: fee.id,
          templateName: fee.templateName,
          templateCategory: fee.templateCategory,
          total: fee.amount,
          paid: fee.amountPaid,
          outstanding: fee.amountDue,
          isCompulsory: fee.isCompulsory,
          isWaived: fee.isWaived,
          waivedReason: fee.waivedReason,
          recentPayments: fee.recentPayments
        })),
        scholarships: enrollment.scholarships.map(scholarship => ({
          id: scholarship.id,
          templateName: scholarship.templateName,
          templateType: scholarship.templateType,
          amount: scholarship.amount,
          isAutoApplied: scholarship.isAutoApplied,
          appliedDate: scholarship.appliedDate,
          appliedBy: scholarship.appliedBy,
          isActive: scholarship.isActive,
          remarks: scholarship.remarks
        })),
        totals: enrollment.totals,
        feeStatus: enrollment.feeStatus
      },
      
      // Recent transactions for this enrollment
      recentTransactions: recentPayments
        .filter(payment => payment.studentEnrollmentId === enrollment.id)
        .slice(0, 5)
    }))

    // Get student info from the first enrollment
    const studentInfo = {
      id: enrollments[0].studentId,
      admissionNo: enrollments[0].student.admissionNumber,
      name: `${enrollments[0].student.name}`,
      fatherName: enrollments[0].student.fatherName,
      mobileNo: enrollments[0].student.mobileNo,
      class: enrollments[0].student.class,
      status: enrollments[0].student.status
    }

    return NextResponse.json({
      student: studentInfo,
      enrollments: enrollmentsWithSummary,
      recentPayments: recentPayments.slice(0, 10)
    })
  } catch (error) {
    console.error("Error fetching student fee details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}