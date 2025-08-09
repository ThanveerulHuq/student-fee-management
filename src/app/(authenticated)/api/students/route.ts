import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { studentSchema } from "@/lib/validations/student"
import { 
  withAuth, 
  handleApiError, 
  getPaginationParams, 
  getSearchParams,
  createSuccessResponse,
  ConflictError
} from "@/lib/api-utils"

export const GET = withAuth(async (request: NextRequest) => {
  const { page, limit, skip } = getPaginationParams(request)
  const { search, status } = getSearchParams(request)

  // Build where clause with search and status filtering
  const where: {
    isActive?: boolean
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" }
      admissionNo?: { contains: string; mode: "insensitive" }
      fatherName?: { contains: string; mode: "insensitive" }
    }>
  } = {}

  // Add status filtering
  if (status === "active") {
    where.isActive = true
  } else if (status === "inactive") {
    where.isActive = false
  }

  // Add search filtering
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { admissionNo: { contains: search, mode: "insensitive" as const } },
      { fatherName: { contains: search, mode: "insensitive" as const } },
    ]
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: { mobileNumbers: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where }),
  ])

  return createSuccessResponse({
    students,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json()
  const validatedData = studentSchema.parse(body)

  // Calculate age from date of birth
  const age = new Date().getFullYear() - new Date(validatedData.dateOfBirth).getFullYear()

  // Check if admission number already exists
  const existingStudent = await prisma.student.findUnique({
    where: { admissionNo: validatedData.admissionNo },
  })

  if (existingStudent) {
    throw new ConflictError("Admission number already exists")
  }

  const student = await prisma.student.create({
    data: {
      ...validatedData,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      admissionDate: new Date(validatedData.admissionDate),
      age,
    },
  })

  return createSuccessResponse(student, "Student created successfully", 201)
})