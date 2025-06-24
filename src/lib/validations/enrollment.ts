import { z } from "zod"

export const enrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  classId: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  commonFeeId: z.string().optional(),
  uniformFee: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  islamicStudies: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  vanFee: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  scholarship: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  enrollmentDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (!val) return undefined
    return val instanceof Date ? val : new Date(val)
  }),
  isActive: z.boolean().default(true),
})

export const enrollmentUpdateSchema = enrollmentSchema.partial()

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>
export type EnrollmentUpdateData = z.infer<typeof enrollmentUpdateSchema>