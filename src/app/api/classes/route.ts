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

    const classes = await prisma.class.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            enrollments: true,
            feeStructures: true,
          },
        },
      },
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
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
    const { className, order, isActive } = body

    // Validate required fields
    if (!className || order === undefined) {
      return NextResponse.json(
        { error: "Class name and order are required" },
        { status: 400 }
      )
    }

    // Check if class name already exists
    const existingClass = await prisma.class.findUnique({
      where: { className },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: "Class name already exists" },
        { status: 400 }
      )
    }

    // Check if order already exists
    const existingOrder = await prisma.class.findUnique({
      where: { order },
    })

    if (existingOrder) {
      return NextResponse.json(
        { error: "Class order already exists" },
        { status: 400 }
      )
    }

    const classRecord = await prisma.class.create({
      data: {
        className,
        order,
        isActive: isActive !== false, // Default to true
      },
    })

    return NextResponse.json(classRecord, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}