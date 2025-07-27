// Enums
export enum FeeCategory {
  REGULAR = 'REGULAR',
  OPTIONAL = 'OPTIONAL', 
  ACTIVITY = 'ACTIVITY',
  EXAMINATION = 'EXAMINATION',
  LATE_FEE = 'LATE_FEE'
}

export enum ScholarshipType {
  MERIT = 'MERIT',
  NEED_BASED = 'NEED_BASED',
  GOVERNMENT = 'GOVERNMENT',
  SPORTS = 'SPORTS',
  MINORITY = 'MINORITY',
  GENERAL = 'GENERAL'
}

export enum FeeStatusType {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED'
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED',
  TRANSFERRED = 'TRANSFERRED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
  CHEQUE = 'CHEQUE'
}

// Embedded types
export interface StudentInfo {
  admissionNumber: string
  firstName: string
  lastName: string
  fatherName: string
  phone: string
  class: string
  status: StudentStatus
}

export interface AcademicYearInfo {
  year: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

export interface ClassInfo {
  className: string
  order: number
  isActive: boolean
}

export interface RecentPayment {
  paymentId: string
  amount: number
  paymentDate: Date
  receiptNo: string
  paymentMethod: PaymentMethod
}

export interface StudentFee {
  id: string
  feeItemId: string
  templateId: string
  templateName: string
  templateCategory: FeeCategory
  amount: number
  originalAmount: number
  amountPaid: number
  amountDue: number
  isCompulsory: boolean
  isWaived: boolean
  waivedReason?: string
  waivedBy?: string
  waivedDate?: Date
  order: number
  recentPayments: RecentPayment[]
}

export interface StudentScholarship {
  id: string
  scholarshipItemId: string
  templateId: string
  templateName: string
  templateType: ScholarshipType
  amount: number
  originalAmount: number
  isAutoApplied: boolean
  appliedDate: Date
  appliedBy: string
  isActive: boolean
  remarks?: string
}

export interface FeeAmounts {
  compulsory: number
  optional: number
  total: number
  paid: number
  due: number
}

export interface ScholarshipAmounts {
  applied: number
  autoApplied: number
  manual: number
}

export interface NetAmounts {
  total: number
  paid: number
  due: number
}

export interface StudentTotals {
  fees: FeeAmounts
  scholarships: ScholarshipAmounts
  netAmount: NetAmounts
}

export interface FeeStatus {
  status: FeeStatusType
  lastPaymentDate?: Date
  nextDueDate?: Date
  overdueAmount: number
}

// Main StudentEnrollment interface
export interface StudentEnrollment {
  id: string
  studentId: string
  academicYearId: string
  classId: string
  section: string
  enrollmentDate: Date
  isActive: boolean
  
  // Embedded denormalized data
  student: StudentInfo
  academicYear: AcademicYearInfo
  class: ClassInfo
  
  // Student-specific fees and scholarships
  fees: StudentFee[]
  scholarships: StudentScholarship[]
  
  // Pre-computed totals
  totals: StudentTotals
  feeStatus: FeeStatus
  
  createdAt: Date
  updatedAt: Date
}