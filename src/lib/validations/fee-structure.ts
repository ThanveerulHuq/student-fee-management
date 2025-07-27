import { z } from 'zod'

// Fee Template Validation
export const feeTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  category: z.enum(['REGULAR', 'OPTIONAL', 'ACTIVITY', 'EXAMINATION', 'LATE_FEE']),
  order: z.number().min(0).optional(),
  isActive: z.boolean().optional()
})

// Scholarship Template Validation
export const scholarshipTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  type: z.enum(['MERIT', 'NEED_BASED', 'GOVERNMENT', 'SPORTS', 'MINORITY', 'GENERAL']),
  order: z.number().min(0).optional(),
  isActive: z.boolean().optional()
})

// Fee Item Validation
export const feeItemSchema = z.object({
  id: z.string().optional(),
  templateId: z.string().min(1, 'Template ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  isCompulsory: z.boolean().optional().default(true),
  isEditableDuringEnrollment: z.boolean().optional().default(false),
  order: z.number().min(0).optional()
})

// Scholarship Item Validation
export const scholarshipItemSchema = z.object({
  id: z.string().optional(),
  templateId: z.string().min(1, 'Template ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  isAutoApplied: z.boolean().optional().default(false),
  order: z.number().min(0).optional()
})

// Fee Structure Validation
export const feeStructureSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  feeItems: z.array(feeItemSchema).optional().default([]),
  scholarshipItems: z.array(scholarshipItemSchema).optional().default([]),
  isActive: z.boolean().optional().default(true)
})

// Fee Structure Copy Validation
export const feeStructureCopySchema = z.object({
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  name: z.string().optional()
})

// Update schemas (partial versions)
export const updateFeeTemplateSchema = feeTemplateSchema.partial()
export const updateScholarshipTemplateSchema = scholarshipTemplateSchema.partial()
export const updateFeeStructureSchema = feeStructureSchema.partial().omit({ 
  academicYearId: true, 
  classId: true 
})

// Type exports
export type FeeTemplateInput = z.infer<typeof feeTemplateSchema>
export type ScholarshipTemplateInput = z.infer<typeof scholarshipTemplateSchema>
export type FeeItemInput = z.infer<typeof feeItemSchema>
export type ScholarshipItemInput = z.infer<typeof scholarshipItemSchema>
export type FeeStructureInput = z.infer<typeof feeStructureSchema>
export type FeeStructureCopyInput = z.infer<typeof feeStructureCopySchema>
export type UpdateFeeTemplateInput = z.infer<typeof updateFeeTemplateSchema>
export type UpdateScholarshipTemplateInput = z.infer<typeof updateScholarshipTemplateSchema>
export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>