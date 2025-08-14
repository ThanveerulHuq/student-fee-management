import mongoose, { Document as MongooseDocument, Schema } from 'mongoose'
import { DocumentType } from '../types'

export interface IDocument extends MongooseDocument {
  _id: string
  studentId: string
  fileName: string
  fileUrl: string
  fileType: DocumentType
  uploadDate: Date
  uploadedBy: string
  createdAt: Date
}

const DocumentSchema = new Schema<IDocument>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    enum: Object.values(DocumentType),
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'documents'
})

DocumentSchema.index({ studentId: 1 })
DocumentSchema.index({ fileType: 1 })
DocumentSchema.index({ uploadDate: 1 })

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)