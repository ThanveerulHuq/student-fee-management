import mongoose, { Document, Schema } from 'mongoose'
import { PaymentMethod, StudentInfo, AcademicYearInfo, PaymentItem, StudentStatus } from '../types'

export interface IPayment extends Document {
  _id: string
  receiptNo: string
  studentEnrollmentId: mongoose.Types.ObjectId
  totalAmount: number
  paymentDate: Date
  paymentMethod: PaymentMethod
  remarks?: string
  createdBy: string
  status: string
  student: StudentInfo
  academicYear: AcademicYearInfo
  paymentItems: PaymentItem[]
  createdAt: Date
  updatedAt: Date
  migrationData?: Record<string, unknown>
}

const StudentInfoSchema = new Schema<StudentInfo>({
  admissionNumber: { type: String, required: true },
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  status: { 
    type: String, 
    enum: Object.values(StudentStatus), 
    required: true 
  }
}, { _id: false })

const AcademicYearInfoSchema = new Schema<AcademicYearInfo>({
  year: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, required: true }
}, { _id: false })

const PaymentItemSchema = new Schema<PaymentItem>({
  feeId: { type: String, required: true },
  feeTemplateId: { type: String, required: true },
  feeTemplateName: { type: String, required: true },
  amount: { type: Number, required: true },
  feeBalance: { type: Number, required: true }
})

const PaymentSchema = new Schema<IPayment>({
  receiptNo: {
    type: String,
    required: true
  },
  studentEnrollmentId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentEnrollment',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.CASH
  },
  remarks: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'COMPLETED'
  },
  student: StudentInfoSchema,
  academicYear: AcademicYearInfoSchema,
  paymentItems: [PaymentItemSchema],
  migrationData: Schema.Types.Mixed
}, {
  timestamps: true,
  collection: 'payments'
})

PaymentSchema.index({ receiptNo: 1 }, { unique: true })
PaymentSchema.index({ studentEnrollmentId: 1 })
PaymentSchema.index({ paymentDate: 1 })
PaymentSchema.index({ 'student.admissionNumber': 1 })
PaymentSchema.index({ 'academicYear.year': 1 })

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)