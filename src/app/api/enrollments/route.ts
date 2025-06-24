import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { enrollmentSchema } from "@/lib/validations/enrollment"
import { EnrollmentWhereCondition } from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const academicYearId = searchParams.get("academicYearId")
    const classId = searchParams.get("classId")
    const studentId = searchParams.get("studentId")
    const section = searchParams.get("section")

    const skip = (page - 1) * limit

    const where: EnrollmentWhereCondition = {}
    if (academicYearId) where.academicYearId = academicYearId
    if (classId) where.classId = classId
    if (studentId) where.studentId = studentId
    if (section) where.section = section

    const [enrollments, total] = await Promise.all([
      prisma.studentYear.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: true,
          academicYear: true,
          class: true,
          commonFee: true,
          feeTransactions: {
            orderBy: { createdAt: "desc" },
            take: 5, // Latest 5 transactions
          },
          paidFee: true,
        },
      }),
      prisma.studentYear.count({ where }),
    ])

    return NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = enrollmentSchema.parse(body)

    // Check if student is already enrolled in this academic year
    const existingEnrollment = await prisma.studentYear.findUnique({
      where: {
        studentId_academicYearId: {
          studentId: validatedData.studentId,
          academicYearId: validatedData.academicYearId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Student is already enrolled in this academic year" },
        { status: 400 }
      )
    }

    // Get the common fee structure for the class and academic year
    const commonFee = await prisma.commonFee.findUnique({
      where: {
        academicYearId_classId: {
          academicYearId: validatedData.academicYearId,
          classId: validatedData.classId,
        },
      },
    })

    if (!commonFee) {
      return NextResponse.json(
        { error: "Fee structure not found for this class and academic year" },
        { status: 400 }
      )
    }

    // Create the enrollment
    const enrollment = await prisma.studentYear.create({
      data: {
        studentId: validatedData.studentId,
        academicYearId: validatedData.academicYearId,
        classId: validatedData.classId,
        commonFeeId: commonFee.id,
        section: validatedData.section,
        uniformFee: validatedData.uniformFee,
        islamicStudies: validatedData.islamicStudies,
        vanFee: validatedData.vanFee,
        scholarship: validatedData.scholarship,
        enrollmentDate: validatedData.enrollmentDate || new Date(),
        isActive: validatedData.isActive,
      },
      include: {
        student: true,
        academicYear: true,
        class: true,
        commonFee: true,
      },
    })

    // Create initial paid fee record
    await prisma.paidFee.create({
      data: {
        studentYearId: enrollment.id,
        schoolFeePaid: 0,
        bookFeePaid: 0,
        uniformFeePaid: 0,
        islamicStudiesPaid: 0,
        vanFeePaid: 0,
        totalPaid: 0,
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error creating enrollment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}