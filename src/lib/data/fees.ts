import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface StudentFeeInfo {
  enrollmentId: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  section: string
  academicYearId: string
  academicYear: string
  feeItems: Array<{
    id: string
    templateName: string
    templateCategory: string
    amount: number
    amountPaid: number
    amountDue: number
    isCompulsory: boolean
  }>
  scholarshipItems: Array<{
    id: string
    templateName: string
    templateType: string
    amount: number
    isAutoApplied: boolean
  }>
  totals: {
    fees: {
      compulsory: number
      optional: number
      total: number
      paid: number
      due: number
    }
    scholarships: {
      applied: number
      autoApplied: number
      manual: number
    }
    netAmount: {
      total: number
      paid: number
      due: number
    }
  }
  feeStatus: {
    status: string
    lastPaymentDate?: Date
    nextDueDate?: Date
    overdueAmount: number
  }
}

export const getStudentFeeInfo = cache(async (
  studentId: string, 
  academicYearId: string
): Promise<StudentFeeInfo | null> => {
  // Get student enrollment for the academic year
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      studentId,
      academicYearId
    }
  })

  if (!enrollment) {
    return null
  }

  return {
    enrollmentId: enrollment.id,
    studentId,
    studentName: enrollment.student.name,
    admissionNo: enrollment.student.admissionNumber,
    className: enrollment.class.className,
    section: enrollment.section,
    academicYearId,
    academicYear: enrollment.academicYear.year,
    feeItems: enrollment.fees.map(fee => ({
      id: fee.id,
      templateName: fee.templateName,
      templateCategory: fee.templateCategory,
      amount: fee.amount,
      amountPaid: fee.amountPaid,
      amountDue: fee.amountDue,
      isCompulsory: fee.isCompulsory
    })),
    scholarshipItems: enrollment.scholarships.map(scholarship => ({
      id: scholarship.id,
      templateName: scholarship.templateName,
      templateType: scholarship.templateType,
      amount: scholarship.amount,
      isAutoApplied: scholarship.isAutoApplied
    })),
    totals: enrollment.totals,
    feeStatus: {
      status: enrollment.feeStatus.status,
      overdueAmount: enrollment.feeStatus.overdueAmount
    }
  }
})

export const getOutstandingFees = cache(async (academicYearId: string) => {
  const enrollments = await prisma.studentEnrollment.aggregateRaw(
    {
      where: {
        academicYearId,
        isActive: true,
        feeStatus: {
          overdueAmount: { $gte: 0 }
        }
      },
      select: {
        id: true,
        student: true,
        class: true,
        section: true,
        totals: true,
        feeStatus: true
      },
      orderBy: {
        student: {
          name: 'asc'
        }
      }
    })

  return enrollments.map((enrollment: any) => ({
    enrollmentId: enrollment.id,
    studentId: enrollment.student.admissionNumber,
    studentName: enrollment.student.name,
    admissionNo: enrollment.student.admissionNumber,
    className: enrollment.class.className,
    section: enrollment.section,
    totalFees: enrollment.totals.netAmount.total,
    paidFees: enrollment.totals.netAmount.paid,
    outstandingAmount: enrollment.totals.netAmount.due,
    status: enrollment.feeStatus.status,
    overdueAmount: enrollment.feeStatus.overdueAmount
  }))
})

export const getRecentPayments = cache(async (limit = 10) => {
  return await prisma.payment.findMany({
    select: {
      id: true,
      receiptNo: true,
      totalAmount: true,
      paymentMethod: true,
      paymentDate: true,
      status: true,
      student: true
    },
    orderBy: {
      paymentDate: 'desc'
    },
    take: limit
  })
})

export const getStudentPayments = cache(async (studentId: string, academicYearId?: string) => {
  const where: any = {
    student: {
      admissionNumber: studentId
    }
  }
  
  if (academicYearId) {
    where.studentEnrollment = {
      academicYearId
    }
  }

  return await prisma.payment.findMany({
    where,
    orderBy: {
      paymentDate: 'desc'
    }
  })
})

export const getFeeStructures = cache(async (academicYearId: string) => {
  return await prisma.feeStructure.findMany({
    where: {
      academicYearId,
      isActive: true
    },
    orderBy: {
      class: {
        order: 'asc'
      }
    }
  })
})

export const getFeeStructureByClass = cache(async (academicYearId: string, classId: string) => {
  return await prisma.feeStructure.findFirst({
    where: {
      academicYearId,
      classId,
      isActive: true
    }
  })
})

export const getPaymentById = cache(async (paymentId: string) => {
  return await prisma.payment.findUnique({
    where: { id: paymentId }
  })
})

export const getStudentsWithOutstandingFees = cache(async (academicYearId: string, classId?: string) => {
  const where: any = {
    academicYearId,
    isActive: true,
    totals: {
      netAmount: {
        due: { gt: 0 }
      }
    }
  }
  
  if (classId) {
    where.classId = classId
  }

  return await prisma.studentEnrollment.findMany({
    where,
    select: {
      id: true,
      student: true,
      class: true,
      section: true,
      totals: true,
      feeStatus: true
    },
    orderBy: {
      feeStatus: {
        overdueAmount: 'desc'
      }
    }
  })
})

export const searchStudentsForFeeCollection = cache(async (query: string, academicYearId: string) => {
  if (!query || query.length < 2) {
    return []
  }

  return await prisma.studentEnrollment.findMany({
    where: {
      academicYearId,
      isActive: true,
      OR: [
        { student: { name: { contains: query, mode: 'i' } } },
        { student: { admissionNumber: { contains: query, mode: 'i' } } },
        { student: { fatherName: { contains: query, mode: 'i' } } }
      ]
    },
    select: {
      id: true,
      student: true,
      class: true,
      section: true,
      totals: true,
      feeStatus: true
    },
    take: 10,
    orderBy: {
      student: {
        name: 'asc'
      }
    }
  })
})