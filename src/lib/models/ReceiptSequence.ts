import mongoose, { Document, Schema } from 'mongoose'

export interface IReceiptSequence extends Document {
  _id: string
  academicYear: string
  lastSequence: number
  createdAt: Date
  updatedAt: Date
}

const ReceiptSequenceSchema = new Schema<IReceiptSequence>({
  academicYear: {
    type: String,
    required: true
  },
  lastSequence: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'receipt_sequences'
})

ReceiptSequenceSchema.index({ academicYear: 1 }, { unique: true })

export default mongoose.models.ReceiptSequence || mongoose.model<IReceiptSequence>('ReceiptSequence', ReceiptSequenceSchema)