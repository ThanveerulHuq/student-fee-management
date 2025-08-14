import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import { studentSchema } from "@/lib/validations/student"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.connect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    const skip = (page - 1) * limit

    // Build filter object for Mongoose
    const filter: {
      isActive?: boolean;
      $or?: Array<Record<string, { $regex: string; $options: string }>>;
    } = {}

    // Add status filtering
    if (status === "active") {
      filter.isActive = true
    } else if (status === "inactive") {
      filter.isActive = false
    }

    // Add search filtering
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { admissionNo: { $regex: search, $options: "i" } },
        { fatherName: { $regex: search, $options: "i" } },
      ]
    }

    const [students, total] = await Promise.all([
      db.student
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      db.student.countDocuments(filter),
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching students:", error)
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
    const validatedData = studentSchema.parse(body)

    // Check if admission number already exists
    const existingStudent = await db.student.findOne({
      admissionNo: validatedData.admissionNo,
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: "Admission number already exists" },
        { status: 400 }
      )
    }

    const student = await db.student.create({
      ...validatedData,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      admissionDate: new Date(validatedData.admissionDate),
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error creating student:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}