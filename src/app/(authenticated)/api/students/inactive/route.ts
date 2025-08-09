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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const deactivatedAfter = searchParams.get("deactivatedAfter")
    const deactivatedBefore = searchParams.get("deactivatedBefore")

    const skip = (page - 1) * limit

    // Build where clause for inactive students
    const where: {
      isActive: boolean
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" }
        admissionNo?: { contains: string; mode: "insensitive" }
        fatherName?: { contains: string; mode: "insensitive" }
      }>
      updatedAt?: {
        gte?: Date
        lte?: Date
      }
    } = {
      isActive: false
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { admissionNo: { contains: search, mode: "insensitive" as const } },
        { fatherName: { contains: search, mode: "insensitive" as const } }
      ]
    }

    // Add date filtering
    if (deactivatedAfter || deactivatedBefore) {
      where.updatedAt = {}
      if (deactivatedAfter) {
        where.updatedAt.gte = new Date(deactivatedAfter)
      }
      if (deactivatedBefore) {
        where.updatedAt.lte = new Date(deactivatedBefore)
      }
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" }, // Show recently deactivated first
        include: {
          enrollments: {
            include: {
              academicYear: true,
              class: true,
            },
            orderBy: { createdAt: "desc" }
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
    console.error("Error fetching inactive students:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}