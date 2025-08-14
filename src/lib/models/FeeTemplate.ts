import mongoose, { Document, Schema } from 'mongoose'
import { FeeCategory } from '../types'

export interface IFeeTemplate extends Document {
  _id: string
  name: string
  description?: string
  category: FeeCategory
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const FeeTemplateSchema = new Schema<IFeeTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: Object.values(FeeCategory),
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
  collection: 'fee_templates'
})

FeeTemplateSchema.index({ name: 1 }, { unique: true })
FeeTemplateSchema.index({ category: 1 })
FeeTemplateSchema.index({ isActive: 1 })
FeeTemplateSchema.index({ order: 1 })

export default mongoose.models.FeeTemplate || mongoose.model<IFeeTemplate>('FeeTemplate', FeeTemplateSchema)