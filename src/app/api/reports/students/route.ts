import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Gender } from "@/generated/prisma"
import type { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get("academicYearId")
    const classId = searchParams.get("classId")
    const section = searchParams.get("section")
    const gender = searchParams.get("gender")
    const isActive = searchParams.get("isActive")
    const admissionDateFrom = searchParams.get("admissionDateFrom")
    const admissionDateTo = searchParams.get("admissionDateTo")
    const search = searchParams.get("search")
    const format = searchParams.get("format") // 'json' or 'csv'

    // Build where conditions for students
    const studentWhere: {
      gender?: Gender
      isActive?: boolean
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" }
        admissionNo?: { contains: string; mode: "insensitive" }
        fatherName?: { contains: string; mode: "insensitive" }
      }>
      admissionDate?: {
        gte?: Date
        lte?: Date
      }
      enrollments?: {
        some: {
          academicYearId?: string
          classId?: string
          section?: string
        }
      }
    } = {}
    
    if (gender) studentWhere.gender = gender as Gender
    if (isActive !== null) studentWhere.isActive = isActive === "true"
    if (search) {
      studentWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { admissionNo: { contains: search, mode: "insensitive" } },
        { fatherName: { contains: search, mode: "insensitive" } },
      ]
    }
    if (admissionDateFrom || admissionDateTo) {
      studentWhere.admissionDate = {}
      if (admissionDateFrom) studentWhere.admissionDate.gte = new Date(admissionDateFrom)
      if (admissionDateTo) studentWhere.admissionDate.lte = new Date(admissionDateTo)
    }

    // Add enrollment filters if provided
    if (academicYearId || classId || section) {
      studentWhere.enrollments = { some: {} }
      if (academicYearId) studentWhere.enrollments.some.academicYearId = academicYearId
      if (classId) studentWhere.enrollments.some.classId = classId
      if (section) studentWhere.enrollments.some.section = section
    }

    // Get students with their enrollments
    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        enrollments: {
          include: {
            academicYear: true,
            class: true,
            commonFee: true,
            paidFee: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [
        { name: "asc" },
      ],
    })

    // Calculate statistics
    const totalStudents = students.length
    const activeStudents = students.filter(s => s.isActive).length
    const maleStudents = students.filter(s => s.gender === "MALE").length
    const femaleStudents = students.filter(s => s.gender === "FEMALE").length

    // Group by class if filtering by academic year
    const classSummary: Record<string, number> = {}
    students.forEach(student => {
      student.enrollments.forEach(enrollment => {
        const className = enrollment.class.className
        classSummary[className] = (classSummary[className] || 0) + 1
      })
    })

    const reportData = {
      students: students.map(student => ({
        ...student,
        enrollments: student.enrollments.map(enrollment => {
          const totalFee = 
            enrollment.commonFee.schoolFee +
            enrollment.commonFee.bookFee +
            enrollment.uniformFee +
            enrollment.islamicStudies +
            enrollment.vanFee -
            enrollment.scholarship

          const totalPaid = enrollment.paidFee?.totalPaid || 0
          const outstanding = Math.max(0, totalFee - totalPaid)

          return {
            ...enrollment,
            feeCalculation: {
              totalFee,
              totalPaid,
              outstanding,
            },
          }
        }),
      })),
      summary: {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents,
        maleStudents,
        femaleStudents,
        classSummary,
      },
      filters: {
        academicYearId,
        classId,
        section,
        gender,
        isActive,
        admissionDateFrom,
        admissionDateTo,
        search,
      },
      generatedAt: new Date(),
      generatedBy: session.user.username,
    }

    // Return CSV format if requested
    if (format === "csv") {
      const csvData = generateStudentCSV(reportData.students)
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=student-report.csv",
        },
      })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating student report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

interface StudentWithEnrollments {
  admissionNo: string
  name: string
  fatherName: string
  gender: string
  age: number
  mobileNo1: string
  isActive: boolean
  admissionDate: Date | string
  enrollments: {
    academicYear: { year: string }
    class: { className: string }
    section: string
    feeCalculation: {
      totalFee: number
      totalPaid: number
      outstanding: number
    }
  }[]
}

function generateStudentCSV(students: StudentWithEnrollments[]): string {
  const headers = [
    "Admission No",
    "Student Name",
    "Father's Name",
    "Gender",
    "Age",
    "Mobile No 1",
    "Academic Year",
    "Class",
    "Section",
    "Total Fee",
    "Paid Amount",
    "Outstanding",
    "Status",
    "Admission Date",
  ]

  const rows = students.flatMap(student =>
    student.enrollments.length > 0
      ? student.enrollments.map((enrollment) => [
          student.admissionNo,
          student.name,
          student.fatherName,
          student.gender,
          student.age,
          student.mobileNo1,
          enrollment.academicYear.year,
          enrollment.class.className,
          enrollment.section,
          enrollment.feeCalculation.totalFee,
          enrollment.feeCalculation.totalPaid,
          enrollment.feeCalculation.outstanding,
          student.isActive ? "Active" : "Inactive",
          new Date(student.admissionDate).toLocaleDateString(),
        ])
      : [[
          student.admissionNo,
          student.name,
          student.fatherName,
          student.gender,
          student.age,
          student.mobileNo1,
          "",
          "",
          "",
          "",
          "",
          "",
          student.isActive ? "Active" : "Inactive",
          new Date(student.admissionDate).toLocaleDateString(),
        ]]
  )

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n")
}