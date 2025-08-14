export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
  CHEQUE = 'CHEQUE'
}

export enum DocumentType {
  PHOTO = 'PHOTO',
  DOCUMENT = 'DOCUMENT',
  CERTIFICATE = 'CERTIFICATE'
}

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

export interface MobileNumber {
  number: string
  isWhatsApp?: boolean
  isPrimary?: boolean
  label?: string
}

export interface AcademicYearInfo {
  year: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

export interface ClassInfo {
  className: string
  isActive: boolean
}

export interface FeeItem {
  _id?: string
  templateId: string
  templateName: string
  templateCategory: FeeCategory
  amount: number
  isCompulsory: boolean
  isEditableDuringEnrollment: boolean
  order: number
}

export interface ScholarshipItem {
  _id?: string
  templateId: string
  templateName: string
  templateType: ScholarshipType
  amount: number
  isEditableDuringEnrollment: boolean
  order: number
}

export interface FeeTotals {
  compulsory: number
  optional: number
  total: number
}

export interface ScholarshipTotals {
  autoApplied: number
  manual: number
  total: number
}

export interface StudentInfo {
  admissionNumber: string
  name: string
  fatherName: string
  mobileNo: string
  status: StudentStatus
}

export interface StudentFee {
  _id?: string
  feeItemId: string
  templateId: string
  templateName: string
  templateCategory: FeeCategory
  amount: number
  originalAmount: number
  amountPaid: number
  amountDue: number
  isCompulsory: boolean
}

export interface StudentScholarship {
  _id?: string
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
  total: number
  paid: number
  due: number
}

export interface ScholarshipAmounts {
  applied: number
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

export interface PaymentItem {
  _id?: string
  feeId: string
  feeTemplateId: string
  feeTemplateName: string
  amount: number
  feeBalance: number
}