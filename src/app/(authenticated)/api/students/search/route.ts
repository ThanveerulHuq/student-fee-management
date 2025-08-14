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
    const query = searchParams.get("q") || ""
    const limit = parseInt(searchParams.get("limit") || "10")

    if (query.length < 2) {
      return NextResponse.json({ 
        students: [],
        message: "Query must be at least 2 characters long" 
      })
    }

    const students = await db.student
      .find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { admissionNo: { $regex: query, $options: "i" } },
              { fatherName: { $regex: query, $options: "i" } },
            ]
          }
        ]
      })
      .select({
        _id: 1,
        name: 1,
        admissionNo: 1,
        fatherName: 1,
      })
      .limit(limit)
      .sort({ name: 1 })
      .lean()

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