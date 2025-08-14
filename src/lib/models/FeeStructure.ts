import mongoose, { Document, Schema } from 'mongoose'
import { AcademicYearInfo, ClassInfo, FeeItem, ScholarshipItem, FeeTotals, ScholarshipTotals, FeeCategory, ScholarshipType } from '../types'

export interface IFeeStructure extends Document {
  _id: string
  academicYearId: mongoose.Types.ObjectId
  classId: mongoose.Types.ObjectId
  name: string
  description?: string
  isActive: boolean
  academicYear: AcademicYearInfo
  class: ClassInfo
  feeItems: FeeItem[]
  scholarshipItems: ScholarshipItem[]
  totalFees: FeeTotals
  totalScholarships: ScholarshipTotals
  createdAt: Date
  updatedAt: Date
  migrationData?: Record<string, unknown>
}

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

const FeeItemSchema = new Schema<FeeItem>({
  templateId: { type: String, required: true },
  templateName: { type: String, required: true },
  templateCategory: { 
    type: String, 
    enum: Object.values(FeeCategory), 
    required: true 
  },
  amount: { type: Number, required: true },
  isCompulsory: { type: Boolean, required: true },
  isEditableDuringEnrollment: { type: Boolean, required: true },
  order: { type: Number, required: true }
})

const ScholarshipItemSchema = new Schema<ScholarshipItem>({
  templateId: { type: String, required: true },
  templateName: { type: String, required: true },
  templateType: { 
    type: String, 
    enum: Object.values(ScholarshipType), 
    required: true 
  },
  amount: { type: Number, required: true },
  isEditableDuringEnrollment: { type: Boolean, required: true },
  order: { type: Number, required: true }
})

const FeeTotalsSchema = new Schema<FeeTotals>({
  compulsory: { type: Number, required: true },
  optional: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false })

const ScholarshipTotalsSchema = new Schema<ScholarshipTotals>({
  autoApplied: { type: Number, required: true },
  manual: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false })

const FeeStructureSchema = new Schema<IFeeStructure>({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  academicYear: AcademicYearInfoSchema,
  class: ClassInfoSchema,
  feeItems: [FeeItemSchema],
  scholarshipItems: [ScholarshipItemSchema],
  totalFees: FeeTotalsSchema,
  totalScholarships: ScholarshipTotalsSchema,
  migrationData: Schema.Types.Mixed
}, {
  timestamps: true,
  collection: 'fee_structures'
})

FeeStructureSchema.index({ academicYearId: 1, classId: 1 }, { unique: true })
FeeStructureSchema.index({ isActive: 1 })
FeeStructureSchema.index({ 'academicYear.year': 1 })
FeeStructureSchema.index({ 'class.className': 1 })

export default mongoose.models.FeeStructure || mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema)