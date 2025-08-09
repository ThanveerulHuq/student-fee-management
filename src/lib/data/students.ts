import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import type { Student } from '@/generated/prisma'

export interface StudentWithEnrollments extends Student {
  currentEnrollment?: {
    id: string
    className: string
    section: string
    academicYear: string
    isActive: boolean
  }
  totalEnrollments: number
}

export interface StudentsResponse {
  students: StudentWithEnrollments[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface StudentFilters {
  page?: number
  search?: string
  status?: 'active' | 'inactive' | 'all'
  limit?: number
}

export const getStudents = cache(async (filters: StudentFilters = {}): Promise<StudentsResponse> => {
  const { 
    page = 1, 
    search, 
    status = 'all',
    limit = 10 
  } = filters
  
  const skip = (page - 1) * limit

  const where = {
    ...(status === 'active' && { isActive: true }),
    ...(status === 'inactive' && { isActive: false }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { admissionNo: { contains: search, mode: 'insensitive' as const } },
        { fatherName: { contains: search, mode: 'insensitive' as const } },
        { motherName: { contains: search, mode: 'insensitive' as const } },
      ]
    })
  }

  const [studentsData, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.student.count({ where })
  ])

  // Get current academic year
  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  })

  // Get current enrollments for these students
  const studentIds = studentsData.map(s => s.id)
  const currentEnrollments = currentAcademicYear ? await prisma.studentEnrollment.findMany({
    where: {
      studentId: { in: studentIds },
      academicYearId: currentAcademicYear.id,
      isActive: true
    },
    select: {
      id: true,
      studentId: true,
      section: true,
      class: true,
      academicYear: true,
      isActive: true
    }
  }) : []

  // Get enrollment counts for each student
  const enrollmentCounts = await prisma.studentEnrollment.groupBy({
    by: ['studentId'],
    where: {
      studentId: { in: studentIds }
    },
    _count: true
  })

  const enrollmentCountMap = new Map(
    enrollmentCounts.map(item => [item.studentId, item._count])
  )

  const students: StudentWithEnrollments[] = studentsData.map(student => {
    const currentEnrollment = currentEnrollments.find(e => e.studentId === student.id)
    return {
      ...student,
      currentEnrollment: currentEnrollment ? {
        id: currentEnrollment.id,
        className: currentEnrollment.class.className,
        section: currentEnrollment.section,
        academicYear: currentEnrollment.academicYear.year,
        isActive: currentEnrollment.isActive
      } : undefined,
      totalEnrollments: enrollmentCountMap.get(student.id) || 0
    }
  })

  return {
    students,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
})

export const getStudentById = cache(async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id }
  })

  if (!student) return null

  // Get all enrollments for this student
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId: id },
    orderBy: { enrollmentDate: 'desc' }
  })

  return {
    ...student,
    enrollments
  }
})

export const getStudentEnrollments = cache(async (studentId: string) => {
  return await prisma.studentEnrollment.findMany({
    where: { studentId },
    orderBy: { enrollmentDate: 'desc' }
  })
})

export const getStudentCurrentEnrollment = cache(async (studentId: string) => {
  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  })

  if (!currentAcademicYear) return null

  return await prisma.studentEnrollment.findFirst({
    where: {
      studentId,
      academicYearId: currentAcademicYear.id,
      isActive: true
    }
  })
})

export const searchStudents = cache(async (query: string, limit = 10) => {
  if (!query || query.length < 2) {
    return []
  }

  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { admissionNo: { contains: query, mode: 'insensitive' } },
        { fatherName: { contains: query, mode: 'insensitive' } },
      ]
    },
    take: limit,
    orderBy: { name: 'asc' }
  })

  // Get current enrollments for search results
  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  })

  if (!currentAcademicYear) {
    return students.map(student => ({ ...student, currentClass: null }))
  }

  const studentIds = students.map(s => s.id)
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      studentId: { in: studentIds },
      academicYearId: currentAcademicYear.id,
      isActive: true
    }
  })

  return students.map(student => {
    const enrollment = enrollments.find(e => e.studentId === student.id)
    return {
      ...student,
      currentClass: enrollment ? enrollment.class.className : null
    }
  })
})

export const getStudentStats = cache(async () => {
  const [total, active, inactive] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.student.count({ where: { isActive: false } })
  ])

  return { total, active, inactive }
})

export const getStudentsByClass = cache(async (classId: string, academicYearId: string) => {
  return await prisma.studentEnrollment.findMany({
    where: {
      classId,
      academicYearId,
      isActive: true
    },
    orderBy: {
      student: {
        name: 'asc'
      }
    }
  })
})