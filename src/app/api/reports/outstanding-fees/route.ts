import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
    const section = searchParams.get("section")
    const minOutstanding = parseFloat(searchParams.get("minOutstanding") || "1")

    // Build where conditions for student enrollments
    const enrollmentWhere: {
      academicYearId?: string
      classId?: string
      section?: string
      isActive?: boolean
    } = {
      isActive: true // Only active enrollments
    }

    if (academicYearId) enrollmentWhere.academicYearId = academicYearId
    if (classId) enrollmentWhere.classId = classId
    if (section) enrollmentWhere.section = section

    // Get all student enrollments with fee data
    const enrollments = await prisma.studentEnrollment.findMany({
      where: enrollmentWhere,
      orderBy: [
        { class: { order: "asc" } },
        { section: "asc" },
        { student: { firstName: "asc" } }
      ]
    })

    // Process enrollments to calculate outstanding fees
    const studentsWithOutstanding = enrollments
      .map(enrollment => {
        // Get fee data from the embedded structure
        const totalFees = enrollment.totals.netAmount.total
        const totalPaid = enrollment.totals.netAmount.paid
        const outstandingAmount = enrollment.totals.netAmount.due

        // Get individual fee breakdown from the fees array
        const fees = enrollment.fees.map(fee => ({
          templateName: fee.templateName,
          amount: fee.amount,
          paid: fee.amountPaid,
          outstanding: fee.amountDue
        }))

        // Use the pre-computed fee status
        const feeStatus = enrollment.feeStatus.status

        return {
          id: enrollment.id,
          admissionNo: enrollment.student.admissionNumber,
          name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          fatherName: enrollment.student.fatherName,
          phone: enrollment.student.phone,
          class: enrollment.class.className,
          section: enrollment.section,
          totalFees,
          paidAmount: totalPaid,
          outstandingAmount,
          feeStatus,
          enrollmentDate: enrollment.enrollmentDate.toISOString(),
          fees
        }
      })
      .filter(student => student.outstandingAmount >= minOutstanding)

    // Calculate summary statistics
    const totalStudents = studentsWithOutstanding.length
    const totalOutstandingAmount = studentsWithOutstanding.reduce((sum, student) => sum + student.outstandingAmount, 0)

    // Group by class for class totals
    const classTotals = studentsWithOutstanding.reduce((acc, student) => {
      const existing = acc.find(item => item.class === student.class)
      if (existing) {
        existing.studentsCount += 1
        existing.outstandingAmount += student.outstandingAmount
      } else {
        acc.push({
          class: student.class,
          studentsCount: 1,
          outstandingAmount: student.outstandingAmount
        })
      }
      return acc
    }, [] as Array<{ class: string; studentsCount: number; outstandingAmount: number }>)

    const summary = {
      totalStudents,
      studentsWithOutstanding: totalStudents,
      totalOutstandingAmount,
      classTotals: classTotals.sort((a, b) => a.class.localeCompare(b.class))
    }

    return NextResponse.json({
      students: studentsWithOutstanding,
      summary,
      filters: {
        academicYearId,
        classId,
        section,
        minOutstanding
      },
      generatedAt: new Date(),
      generatedBy: session.user.username
    })

  } catch (error) {
    console.error("Error generating outstanding fees report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}