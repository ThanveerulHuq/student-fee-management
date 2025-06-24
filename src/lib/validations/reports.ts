import { z } from "zod"

export const studentReportFilterSchema = z.object({
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  section: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  isActive: z.boolean().optional(),
  admissionDateFrom: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (!val) return undefined
    return val instanceof Date ? val : new Date(val)
  }),
  admissionDateTo: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (!val) return undefined
    return val instanceof Date ? val : new Date(val)
  }),
  search: z.string().optional(),
})

export const feeCollectionReportFilterSchema = z.object({
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  paymentDateFrom: z.union([z.string(), z.date()]).transform((val) => {
    return val instanceof Date ? val : new Date(val)
  }),
  paymentDateTo: z.union([z.string(), z.date()]).transform((val) => {
    return val instanceof Date ? val : new Date(val)
  }),
  paymentMethod: z.enum(["CASH", "ONLINE", "CHEQUE"]).optional(),
  createdBy: z.string().optional(),
})

export const outstandingFeesReportFilterSchema = z.object({
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  section: z.string().optional(),
  minOutstanding: z.union([z.number(), z.string()]).optional().transform((val) => val ? Number(val) || 0 : undefined),
  maxOutstanding: z.union([z.number(), z.string()]).optional().transform((val) => val ? Number(val) || 0 : undefined),
})

export type StudentReportFilters = z.infer<typeof studentReportFilterSchema>
export type FeeCollectionReportFilters = z.infer<typeof feeCollectionReportFilterSchema>
export type OutstandingFeesReportFilters = z.infer<typeof outstandingFeesReportFilterSchema>