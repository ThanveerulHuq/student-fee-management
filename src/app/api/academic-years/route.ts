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

    const academicYears = await db.academicYear
      .find(filter)
      .sort({ startDate: -1 })
      .lean()

    // Transform the data to include proper types and clean ObjectIds
    const transformedYears = academicYears.map((year) => ({
      id: year._id.toString(),
      year: year.year,
      startDate: year.startDate,
      endDate: year.endDate,
      isActive: year.isActive,
      description: year.description || null,
      createdAt: year.createdAt,
      updatedAt: year.updatedAt,
    }))

    return NextResponse.json(transformedYears)
  } catch (error) {
    console.error("Error fetching academic years:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}