import { 
  StudentInfo, 
  AcademicYearInfo, 
  ClassInfo,
  PaymentMethod 
} from './enrollment'

// Payment status enum
export enum PaymentStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED'
}

// Payment item interface
export interface PaymentItem {
  id: string
  feeId: string
  feeTemplateId: string
  feeTemplateName: string
  amount: number
  feeBalance: number
}

// Main Payment interface
export interface Payment {
  id: string
  receiptNo: string
  studentEnrollmentId: string
  academicYearId: string
  totalAmount: number
  paymentDate: Date
  paymentMethod: PaymentMethod
  remarks?: string
  createdBy: string
  status: PaymentStatus
  
  // Embedded student info for receipts
  student: StudentInfo
  class: ClassInfo
  academicYear: AcademicYearInfo
  section: string
  
  // Payment breakdown
  paymentItems: PaymentItem[]
  
  createdAt: Date
  updatedAt: Date
}
