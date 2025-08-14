import mongoose, { Document, Schema } from 'mongoose'
import { 
  AcademicYearInfo, 
  ClassInfo, 
  StudentInfo, 
  StudentFee, 
  StudentScholarship, 
  StudentTotals, 
  FeeStatus,
  FeeCategory,
  ScholarshipType,
  StudentStatus,
  FeeStatusType,
  FeeAmounts,
  ScholarshipAmounts,
  NetAmounts
} from '../types'

export interface IStudentEnrollment extends Document {
  _id: string
  studentId: mongoose.Types.ObjectId
  academicYearId: mongoose.Types.ObjectId
  classId: mongoose.Types.ObjectId
  section: string
  enrollmentDate: Date
  isActive: boolean
  student: StudentInfo
  academicYear: AcademicYearInfo
  class: ClassInfo
  fees: StudentFee[]
  scholarships: StudentScholarship[]
  totals: StudentTotals
  feeStatus: FeeStatus
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

const ClassInfoSchema = new Schema<ClassInfo>({
  className: { type: String, required: true },
  isActive: { type: Boolean, required: true }
}, { _id: false })

const StudentFeeSchema = new Schema<StudentFee>({
  feeItemId: { type: String, required: true },
  templateId: { type: String, required: true },
  templateName: { type: String, required: true },
  templateCategory: { 
    type: String, 
    enum: Object.values(FeeCategory), 
    required: true 
  },
  amount: { type: Number, required: true },
  originalAmount: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  amountDue: { type: Number, required: true },
  isCompulsory: { type: Boolean, required: true }
})

const StudentScholarshipSchema = new Schema<StudentScholarship>({
  scholarshipItemId: { type: String, required: true },
  templateId: { type: String, required: true },
  templateName: { type: String, required: true },
  templateType: { 
    type: String, 
    enum: Object.values(ScholarshipType), 
    required: true 
  },
  amount: { type: Number, required: true },
  originalAmount: { type: Number, required: true },
  isAutoApplied: { type: Boolean, required: true },
  appliedDate: { type: Date, required: true },
  appliedBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  remarks: { type: String }
})

const FeeAmountsSchema = new Schema<FeeAmounts>({
  total: { type: Number, required: true },
  paid: { type: Number, required: true },
  due: { type: Number, required: true }
}, { _id: false })

const ScholarshipAmountsSchema = new Schema<ScholarshipAmounts>({
  applied: { type: Number, required: true }
}, { _id: false })

const NetAmountsSchema = new Schema<NetAmounts>({
  total: { type: Number, required: true },
  paid: { type: Number, required: true },
  due: { type: Number, required: true }
}, { _id: false })

const StudentTotalsSchema = new Schema<StudentTotals>({
  fees: FeeAmountsSchema,
  scholarships: ScholarshipAmountsSchema,
  netAmount: NetAmountsSchema
}, { _id: false })

const FeeStatusSchema = new Schema<FeeStatus>({
  status: { 
    type: String, 
    enum: Object.values(FeeStatusType), 
    required: true 
  },
  lastPaymentDate: { type: Date },
  nextDueDate: { type: Date },
  overdueAmount: { type: Number, required: true }
}, { _id: false })

const StudentEnrollmentSchema = new Schema<IStudentEnrollment>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYearId: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  student: StudentInfoSchema,
  academicYear: AcademicYearInfoSchema,
  class: ClassInfoSchema,
  fees: [StudentFeeSchema],
  scholarships: [StudentScholarshipSchema],
  totals: StudentTotalsSchema,
  feeStatus: FeeStatusSchema,
  migrationData: Schema.Types.Mixed
}, {
  timestamps: true,
  collection: 'student_enrollments'
})

StudentEnrollmentSchema.index({ studentId: 1, academicYearId: 1 }, { unique: true })
StudentEnrollmentSchema.index({ academicYearId: 1 })
StudentEnrollmentSchema.index({ classId: 1 })
StudentEnrollmentSchema.index({ isActive: 1 })
StudentEnrollmentSchema.index({ 'student.admissionNumber': 1 })
StudentEnrollmentSchema.index({ 'student.name': 1 })
StudentEnrollmentSchema.index({ 'feeStatus.status': 1 })

export default mongoose.models.StudentEnrollment || mongoose.model<IStudentEnrollment>('StudentEnrollment', StudentEnrollmentSchema)