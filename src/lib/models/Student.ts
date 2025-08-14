import mongoose, { Document, Schema } from 'mongoose'
import { Gender, MobileNumber } from '../types'

export interface IStudent extends Document {
  _id: string
  admissionNo: string
  aadharNo?: string
  emisNo?: string
  penNumber?: string
  udiseNumber?: string
  name: string
  gender: Gender
  dateOfBirth: Date
  community: string
  motherTongue: string
  mobileNumbers: MobileNumber[]
  fatherName: string
  motherName: string
  address: string
  previousSchool?: string
  religion: string
  caste: string
  nationality: string
  remarks?: string
  siblingIds: string[]
  isActive: boolean
  admissionDate: Date
  profilePhotoUrl?: string
  createdAt: Date
  updatedAt: Date
  migrationData?: Record<string, unknown>
}

const MobileNumberSchema = new Schema<MobileNumber>({
  number: { type: String, required: true },
  isWhatsApp: { type: Boolean, default: false },
  isPrimary: { type: Boolean, default: false },
  label: { type: String }
}, { _id: false })

const StudentSchema = new Schema<IStudent>({
  admissionNo: {
    type: String,
    required: true,
    trim: true
  },
  aadharNo: {
    type: String,
    trim: true
  },
  emisNo: {
    type: String,
    trim: true
  },
  penNumber: {
    type: String,
    trim: true
  },
  udiseNumber: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  community: {
    type: String,
    required: true,
    trim: true
  },
  motherTongue: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumbers: [MobileNumberSchema],
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  motherName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  previousSchool: {
    type: String,
    trim: true
  },
  religion: {
    type: String,
    required: true,
    trim: true
  },
  caste: {
    type: String,
    required: true,
    trim: true
  },
  nationality: {
    type: String,
    default: 'Indian',
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  siblingIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  profilePhotoUrl: {
    type: String,
    trim: true
  },
  migrationData: Schema.Types.Mixed
}, {
  timestamps: true,
  collection: 'students'
})

StudentSchema.index({ admissionNo: 1 }, { unique: true })
StudentSchema.index({ name: 1 })
StudentSchema.index({ fatherName: 1 })
StudentSchema.index({ isActive: 1 })
StudentSchema.index({ admissionDate: 1 })

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema)