import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateAcademicYearSchema } from "@/lib/validations/academic-year"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const academicYear = await prisma.academicYear.findUnique({
      where: { id: params.id },
    })

    if (!academicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(academicYear)
  } catch (error) {
    console.error("Error fetching academic year:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAcademicYearSchema.parse(body)

    // Check if academic year exists
    const existingYear = await prisma.academicYear.findUnique({
      where: { id: params.id },
    })

    if (!existingYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      )
    }

    // Check if year string is unique (excluding current record)
    const duplicateYear = await prisma.academicYear.findFirst({
      where: {
        year: validatedData.year,
        id: { not: params.id },
      },
    })

    if (duplicateYear) {
      return NextResponse.json(
        { error: "Academic year already exists" },
        { status: 400 }
      )
    }

    // If setting as active, deactivate other years
    if (validatedData.isActive) {
      await prisma.academicYear.updateMany({
        where: { 
          isActive: true,
          id: { not: params.id }
        },
        data: { isActive: false },
      })
    }

    const updatedYear = await prisma.academicYear.update({
      where: { id: params.id },
      data: {
        year: validatedData.year,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        isActive: validatedData.isActive ?? existingYear.isActive,
      },
    })

    return NextResponse.json(updatedYear)
  } catch (error) {
    console.error("Error updating academic year:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if academic year exists
    const existingYear = await prisma.academicYear.findUnique({
      where: { id: params.id },
    })

    if (!existingYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      )
    }

    // Check if there are any associated records (students, fee structures, etc.)
    const [feeStructures] = await Promise.all([
      prisma.feeStructure.findFirst({ where: { academicYearId: params.id } }),
    ])

    if (feeStructures) {
      return NextResponse.json(
        { 
          error: "Cannot delete academic year that has associated students or fee structures" 
        },
        { status: 400 }
      )
    }

    await prisma.academicYear.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Academic year deleted successfully" })
  } catch (error) {
    console.error("Error deleting academic year:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}