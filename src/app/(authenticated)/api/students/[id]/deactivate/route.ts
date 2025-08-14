import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import { z } from "zod"

const deactivateSchema = z.object({
  reason: z.string().optional()
})

export async function POST(
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

    // Validate request body
    const body = await request.json()
    deactivateSchema.parse(body)

    await db.connect()
    
    // Check if student exists
    const existingStudent = await db.student.findById(studentId)

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (!existingStudent.isActive) {
      return NextResponse.json({ error: "Student is already inactive" }, { status: 400 })
    }

    // Deactivate student (keep enrollments active)
    const updatedStudent = await db.student.findByIdAndUpdate(
      studentId,
      {
        isActive: false,
        updatedAt: new Date()
      },
      { new: true, lean: true }
    )

    return NextResponse.json({
      success: true,
      student: updatedStudent,
      message: `Student ${existingStudent.name} has been deactivated successfully. Academic enrollments remain active for historical data.`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error deactivating student:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}