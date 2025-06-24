import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { enrollmentUpdateSchema } from "@/lib/validations/enrollment"

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
    const enrollment = await prisma.studentYear.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        academicYear: true,
        class: true,
        commonFee: true,
        feeTransactions: {
          orderBy: { createdAt: "desc" },
        },
        paidFee: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error fetching enrollment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const body = await request.json()
    const validatedData = enrollmentUpdateSchema.parse(body)

    // Check if enrollment exists
    const existingEnrollment = await prisma.studentYear.findUnique({
      where: { id: params.id },
    })

    if (!existingEnrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    // If changing class or academic year, check for conflicts
    if (validatedData.academicYearId || validatedData.classId) {
      const academicYearId = validatedData.academicYearId || existingEnrollment.academicYearId
      const classId = validatedData.classId || existingEnrollment.classId

      // Check if student is already enrolled in this academic year (if changing year)
      if (validatedData.academicYearId && validatedData.academicYearId !== existingEnrollment.academicYearId) {
        const conflictingEnrollment = await prisma.studentYear.findUnique({
          where: {
            studentId_academicYearId: {
              studentId: existingEnrollment.studentId,
              academicYearId: validatedData.academicYearId,
            },
          },
        })

        if (conflictingEnrollment && conflictingEnrollment.id !== params.id) {
          return NextResponse.json(
            { error: "Student is already enrolled in this academic year" },
            { status: 400 }
          )
        }
      }

      // Update common fee if class or academic year changed
      if (validatedData.classId || validatedData.academicYearId) {
        const commonFee = await prisma.commonFee.findUnique({
          where: {
            academicYearId_classId: {
              academicYearId,
              classId,
            },
          },
        })

        if (!commonFee) {
          return NextResponse.json(
            { error: "Fee structure not found for this class and academic year" },
            { status: 400 }
          )
        }

        validatedData.commonFeeId = commonFee.id
      }
    }

    const enrollment = await prisma.studentYear.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        student: true,
        academicYear: true,
        class: true,
        commonFee: true,
      },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error updating enrollment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    
    // Soft delete by setting isActive to false
    const enrollment = await prisma.studentYear.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error deleting enrollment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}