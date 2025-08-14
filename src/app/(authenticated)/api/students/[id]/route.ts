import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import { studentUpdateSchema } from "@/lib/validations/student"
import { Gender } from "@/lib/types"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.connect()

    const params = await context.params
    const student = await db.student.findById(params.id).lean()

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get documents
    const documents = await db.document.find({ studentId: params.id }).lean()

    // Get enrollments using the new StudentEnrollment schema
    const enrollments = await db.studentEnrollment
      .find({ studentId: params.id })
      .sort({ enrollmentDate: -1 })
      .lean()

    // Combine student data with enrollments
    const studentWithEnrollments = {
      ...student,
      documents,
      enrollments,
    }

    return NextResponse.json(studentWithEnrollments)
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

    await db.connect()

    const body = await request.json()
    const validatedData = studentUpdateSchema.parse(body)

    const params = await context.params
    // Check if student exists
    const existingStudent = await db.student.findById(params.id)

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // If admission number is being updated, check for duplicates
    if (validatedData.admissionNo && validatedData.admissionNo !== existingStudent.admissionNo) {
      const duplicateStudent = await db.student.findOne({
        admissionNo: validatedData.admissionNo,
      })

      if (duplicateStudent) {
        return NextResponse.json(
          { error: "Admission number already exists" },
          { status: 400 }
        )
      }
    }

    // Convert date strings to Date objects
    const updateData: Record<string, unknown> = { 
      ...validatedData,
      ...(validatedData.gender && { gender: validatedData.gender as Gender })
    }
    
    if (validatedData.dateOfBirth) {
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth)
    }
    if (validatedData.admissionDate) {
      updateData.admissionDate = new Date(validatedData.admissionDate)
    }

    const student = await db.student.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, lean: true }
    )

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

    await db.connect()

    const params = await context.params
    // Soft delete by setting isActive to false
    const student = await db.student.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true, lean: true }
    )

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}