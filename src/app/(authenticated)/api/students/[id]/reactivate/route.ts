import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reactivateSchema = z.object({
  restoreEnrollments: z.boolean().optional().default(false),
  academicYearId: z.string().optional(),
  classId: z.string().optional()
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
    const { academicYearId, classId } = reactivateSchema.parse(body)

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (existingStudent.isActive) {
      return NextResponse.json({ error: "Student is already active" }, { status: 400 })
    }

    // Check for admission number conflicts with other active students
    const conflictStudent = await prisma.student.findFirst({
      where: {
        admissionNo: existingStudent.admissionNo,
        isActive: true,
        id: { not: studentId }
      }
    })

    if (conflictStudent) {
      return NextResponse.json({
        error: "Cannot reactivate: Another active student exists with the same admission number",
        conflicts: [`Admission number ${existingStudent.admissionNo} is already in use by ${conflictStudent.name}`]
      }, { status: 409 })
    }

    let message = `Student ${existingStudent.name} has been reactivated successfully.`

    // Handle new enrollment creation if requested
    if (academicYearId && classId) {
      // Check if academic year and class exist
      const [academicYear, classData] = await Promise.all([
        prisma.academicYear.findUnique({ where: { id: academicYearId } }),
        prisma.class.findUnique({ where: { id: classId } })
      ])

      if (!academicYear || !classData) {
        return NextResponse.json({
          error: "Invalid academic year or class provided"
        }, { status: 400 })
      }


      message += ` New enrollment created for ${classData.className} - ${academicYear.year}.`
    }

    // Reactivate student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      student: updatedStudent,
      message
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error reactivating student:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}