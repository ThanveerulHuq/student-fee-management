import mongoose, { Document, Schema } from 'mongoose'

export interface IAcademicYear extends Document {
  _id: string
  year: string
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AcademicYearSchema = new Schema<IAcademicYear>({
  year: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{4}-\d{2}$/
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'academic_years'
})

AcademicYearSchema.index({ year: 1 }, { unique: true })
AcademicYearSchema.index({ isActive: 1 })
AcademicYearSchema.index({ startDate: 1, endDate: 1 })

AcademicYearSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('Start date must be before end date'))
  }
  next()
})

export default mongoose.models.AcademicYear || mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema)