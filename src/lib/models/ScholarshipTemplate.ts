import mongoose, { Document, Schema } from 'mongoose'
import { ScholarshipType } from '../types'

export interface IScholarshipTemplate extends Document {
  _id: string
  name: string
  description?: string
  type: ScholarshipType
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const ScholarshipTemplateSchema = new Schema<IScholarshipTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(ScholarshipType),
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'scholarship_templates'
})

ScholarshipTemplateSchema.index({ name: 1 }, { unique: true })
ScholarshipTemplateSchema.index({ type: 1 })
ScholarshipTemplateSchema.index({ isActive: 1 })
ScholarshipTemplateSchema.index({ order: 1 })

export default mongoose.models.ScholarshipTemplate || mongoose.model<IScholarshipTemplate>('ScholarshipTemplate', ScholarshipTemplateSchema)