import { MobileNumber } from "@/generated/prisma"

export interface WhereCondition {
  [key: string]: unknown
  paymentDate?: {
    gte?: Date
    lte?: Date
  }
  paymentMethod?: string
  createdBy?: string
  studentYear?: {
    academicYearId?: string
    classId?: string
  }
}

export interface EnrollmentWhereCondition {
  [key: string]: unknown
  academicYearId?: string
  classId?: string
  section?: string
  isActive?: boolean
}

export interface StudentWhereCondition {
  [key: string]: unknown
  gender?: string
  isActive?: boolean
  OR?: Array<{
    name?: { contains: string; mode: string }
    admissionNo?: { contains: string; mode: string }
    fatherName?: { contains: string; mode: string }
  }>
  admissionDate?: {
    gte?: Date
    lte?: Date
  }
  enrollments?: {
    some: EnrollmentWhereCondition
  }
}

export interface PrismaStudentUpdate {
  [key: string]: unknown
  name?: string
  gender?: string
  dateOfBirth?: Date
  age?: number
  community?: string
  motherTongue?: string
  fatherName?: string
  motherName?: string
  address?: string
  previousSchool?: string
  religion?: string
  caste?: string
  nationality?: string
  remarks?: string
  isActive?: boolean
  mobileNumbers?: MobileNumber[]
}