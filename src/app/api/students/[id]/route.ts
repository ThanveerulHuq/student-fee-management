import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { studentUpdateSchema } from "@/lib/validations/student"
import { Gender } from "@/generated/prisma"

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
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        enrollments: {
          include: {
            academicYear: true,
            class: true,
            commonFee: true,
            feeTransactions: true,
            paidFee: true,
          },
        },
        documents: true,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
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

    const body = await request.json()
    const validatedData = studentUpdateSchema.parse(body)

    const params = await context.params
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // If admission number is being updated, check for duplicates
    if (validatedData.admissionNo && validatedData.admissionNo !== existingStudent.admissionNo) {
      const duplicateStudent = await prisma.student.findUnique({
        where: { admissionNo: validatedData.admissionNo },
      })

      if (duplicateStudent) {
        return NextResponse.json(
          { error: "Admission number already exists" },
          { status: 400 }
        )
      }
    }

    // Calculate age if date of birth is updated
    const updateData: Record<string, unknown> = { 
      ...validatedData,
      ...(validatedData.gender && { gender: validatedData.gender as Gender })
    }
    if (validatedData.dateOfBirth) {
      updateData.age = new Date().getFullYear() - new Date(validatedData.dateOfBirth).getFullYear()
    }

    const student = await prisma.student.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error updating student:", error)
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
    const student = await prisma.student.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}