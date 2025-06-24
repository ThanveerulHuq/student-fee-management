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
    const activeOnly = searchParams.get("active") === "true"

    const where = activeOnly ? { isActive: true } : {}

    const academicYears = await prisma.academicYear.findMany({
      where,
      orderBy: { startDate: "desc" },
      include: {
        _count: {
          select: {
            enrollments: true,
            feeStructures: true,
          },
        },
      },
    })

    return NextResponse.json(academicYears)
  } catch (error) {
    console.error("Error fetching academic years:", error)
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
    const { year, startDate, endDate, isActive } = body

    // Validate required fields
    if (!year || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Year, start date, and end date are required" },
        { status: 400 }
      )
    }

    // Check if year already exists
    const existingYear = await prisma.academicYear.findUnique({
      where: { year },
    })

    if (existingYear) {
      return NextResponse.json(
        { error: "Academic year already exists" },
        { status: 400 }
      )
    }

    // If setting as active, deactivate other years
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
      },
    })

    return NextResponse.json(academicYear, { status: 201 })
  } catch (error) {
    console.error("Error creating academic year:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}