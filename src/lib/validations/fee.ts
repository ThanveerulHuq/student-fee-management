import { z } from "zod"

export const feePaymentSchema = z.object({
  studentYearId: z.string().min(1, "Student enrollment is required"),
  schoolFee: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  bookFee: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  uniformFee: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  islamicStudies: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  vanFee: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  totalAmountPaid: z.union([z.number(), z.string()]).transform((val) => {
    const num = Number(val) || 0
    if (num <= 0) throw new Error("Payment amount must be greater than 0")
    return num
  }),
  paymentDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (!val) return undefined
    return val instanceof Date ? val : new Date(val)
  }),
  paymentMethod: z.enum(["CASH", "ONLINE", "CHEQUE"]).default("CASH"),
  remarks: z.string().optional(),
  createdBy: z.string().min(1, "Created by is required"),
})

export const receiptGenerationSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
})

export type FeePaymentFormData = z.infer<typeof feePaymentSchema>
export type ReceiptGenerationData = z.infer<typeof receiptGenerationSchema>