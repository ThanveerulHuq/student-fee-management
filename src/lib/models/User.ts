import mongoose, { Document, Schema } from 'mongoose'
import { Role } from '../types'

export interface IUser extends Document {
  _id: string
  username: string
  email?: string
  password: string
  role: Role
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.ADMIN,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'users'
})

UserSchema.index({ username: 1 }, { unique: true })
UserSchema.index({ email: 1 }, { sparse: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)