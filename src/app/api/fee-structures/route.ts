import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EnrollmentWhereCondition } from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get("academicYearId")
    const classId = searchParams.get("classId")

    const where: EnrollmentWhereCondition = {}
    if (academicYearId) where.academicYearId = academicYearId
    if (classId) where.classId = classId

    const feeStructures = await prisma.commonFee.findMany({
      where,
      include: {
        academicYear: true,
        class: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        { academicYear: { startDate: "desc" } },
        { class: { order: "asc" } },
      ],
    })

    return NextResponse.json(feeStructures)
  } catch (error) {
    console.error("Error fetching fee structures:", error)
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
    const { academicYearId, classId, schoolFee, bookFee } = body

    // Validate required fields
    if (!academicYearId || !classId || schoolFee === undefined || bookFee === undefined) {
      return NextResponse.json(
        { error: "Academic year, class, school fee, and book fee are required" },
        { status: 400 }
      )
    }

    // Check if fee structure already exists
    const existingFeeStructure = await prisma.commonFee.findUnique({
      where: {
        academicYearId_classId: {
          academicYearId,
          classId,
        },
      },
    })

    if (existingFeeStructure) {
      return NextResponse.json(
        { error: "Fee structure already exists for this class and academic year" },
        { status: 400 }
      )
    }

    const feeStructure = await prisma.commonFee.create({
      data: {
        academicYearId,
        classId,
        schoolFee: parseFloat(schoolFee),
        bookFee: parseFloat(bookFee),
      },
      include: {
        academicYear: true,
        class: true,
      },
    })

    return NextResponse.json(feeStructure, { status: 201 })
  } catch (error) {
    console.error("Error creating fee structure:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}