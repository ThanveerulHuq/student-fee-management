import { z } from 'zod'

// Enrollment Schema
export const enrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  section: z.string().min(1, 'Section is required'),
  enrollmentDate: z.date().optional(),
  customFees: z.record(z.string(), z.number().min(0)).optional().default({}),
  selectedScholarships: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true)
})

// Enrollment Update Schema
export const enrollmentUpdateSchema = z.object({
  section: z.string().optional(),
  customFees: z.record(z.string(), z.number().min(0)).optional(),
  scholarshipUpdates: z.array(z.object({
    scholarshipItemId: z.string(),
    amount: z.number().min(0).optional(),
    isActive: z.boolean().optional()
  })).optional(),
  isActive: z.boolean().optional()
})

// Fee Structure Query Schema
export const feeStructureQuerySchema = z.object({
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  classId: z.string().min(1, 'Class ID is required')
})

// Student Fee Update Schema
export const studentFeeUpdateSchema = z.object({
  feeId: z.string().min(1, 'Fee ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  isWaived: z.boolean().optional(),
  waivedReason: z.string().optional(),
  waivedBy: z.string().optional()
})

// Student Scholarship Schema
export const studentScholarshipSchema = z.object({
  scholarshipItemId: z.string().min(1, 'Scholarship item ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  isActive: z.boolean().optional().default(true),
  remarks: z.string().optional()
})

// Type exports
export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type EnrollmentUpdateInput = z.infer<typeof enrollmentUpdateSchema>
export type FeeStructureQueryInput = z.infer<typeof feeStructureQuerySchema>
export type StudentFeeUpdateInput = z.infer<typeof studentFeeUpdateSchema>
export type StudentScholarshipInput = z.infer<typeof studentScholarshipSchema>