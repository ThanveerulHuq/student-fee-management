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
    const query = searchParams.get("q") || ""
    const limit = parseInt(searchParams.get("limit") || "10")

    if (query.length < 2) {
      return NextResponse.json({ 
        students: [],
        message: "Query must be at least 2 characters long" 
      })
    }

    const students = await prisma.student.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { admissionNo: { contains: query, mode: "insensitive" } },
              { fatherName: { contains: query, mode: "insensitive" } },
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        admissionNo: true,
        fatherName: true,
      },
      take: limit,
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      students,
      count: students.length,
    })
  } catch (error) {
    console.error("Error searching students:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}