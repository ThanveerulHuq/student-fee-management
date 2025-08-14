import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.connect()

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    const filter = activeOnly ? { isActive: true } : {}

    const classes = await db.class
      .find(filter)
      .sort({ order: 1 })
      .lean()

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

    await db.connect()

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
    const existingClass = await db.class.findOne({ className })

    if (existingClass) {
      return NextResponse.json(
        { error: "Class name already exists" },
        { status: 400 }
      )
    }

    // Check if order already exists
    const existingOrder = await db.class.findOne({ order })

    if (existingOrder) {
      return NextResponse.json(
        { error: "Class order already exists" },
        { status: 400 }
      )
    }

    const classRecord = await db.class.create({
      className,
      order,
      isActive: isActive !== false, // Default to true
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