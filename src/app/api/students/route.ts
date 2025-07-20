import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { studentSchema } from "@/lib/validations/student"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { admissionNo: { contains: search, mode: "insensitive" as const } },
            { fatherName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          enrollments: {
            include: {
              academicYear: true,
              class: true,
            },
            where: {
              isActive: true,
            },
          },
        },
      }),
      prisma.student.count({ where }),
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

    const body = await request.json()
    const validatedData = studentSchema.parse(body)

    // Calculate age from date of birth
    const age = new Date().getFullYear() - new Date(validatedData.dateOfBirth).getFullYear()

    // Check if admission number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNo: validatedData.admissionNo },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: "Admission number already exists" },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: {
        ...validatedData,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        admissionDate: new Date(validatedData.admissionDate),
        age,
      },
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