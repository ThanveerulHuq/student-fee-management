import connectDB from './mongoose'
import {
  User,
  Student,
  AcademicYear,
  Class,
  FeeTemplate,
  ScholarshipTemplate,
  FeeStructure,
  StudentEnrollment,
  Payment,
  Document,
  ReceiptSequence,
  type IUser,
  type IStudent,
  type IAcademicYear,
  type IClass,
  type IFeeTemplate,
  type IScholarshipTemplate,
  type IFeeStructure,
  type IStudentEnrollment,
  type IPayment,
  type IDocument,
  type IReceiptSequence
} from './models'

class DatabaseService {
  async connect() {
    await connectDB()
  }

  get user() {
    return User
  }

  get student() {
    return Student
  }

  get academicYear() {
    return AcademicYear
  }

  get class() {
    return Class
  }

  get feeTemplate() {
    return FeeTemplate
  }

  get scholarshipTemplate() {
    return ScholarshipTemplate
  }

  get feeStructure() {
    return FeeStructure
  }

  get studentEnrollment() {
    return StudentEnrollment
  }

  get payment() {
    return Payment
  }

  get document() {
    return Document
  }

  get receiptSequence() {
    return ReceiptSequence
  }
}

export const db = new DatabaseService()

export type {
  IUser,
  IStudent,
  IAcademicYear,
  IClass,
  IFeeTemplate,
  IScholarshipTemplate,
  IFeeStructure,
  IStudentEnrollment,
  IPayment,
  IDocument,
  IReceiptSequence
}