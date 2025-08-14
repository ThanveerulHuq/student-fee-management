import mongoose, { Document, Schema } from 'mongoose'

export interface IClass extends Document {
  _id: string
  className: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ClassSchema = new Schema<IClass>({
  className: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'classes'
})

ClassSchema.index({ className: 1 }, { unique: true })
ClassSchema.index({ order: 1 }, { unique: true })
ClassSchema.index({ isActive: 1 })

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema)