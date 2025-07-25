import { z } from "zod"

const phoneRegex = /^[6-9]\d{9}$/
const aadharRegex = /^\d{12}$/

// Basic Information Schema
export const basicInfoSchema = z.object({
  admissionNo: z.string()
    .min(1, "Admission number is required")
    .max(20, "Admission number must be at most 20 characters")
    .regex(/^[A-Z0-9]+$/, "Admission number must contain only uppercase letters and numbers"),
  admissionDate: z.string()
    .min(1, "Admission date is required")
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, {
      message: "Invalid admission date format"
    })
    .refine((val) => {
      const date = new Date(val)
      const today = new Date()
      return date <= today
    }, {
      message: "Admission date cannot be in the future"
    }),
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[a-zA-Z\s.]+$/, "Name must contain only letters, spaces, and dots"),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, {
      message: "Invalid date of birth format"
    }),
  aadharNo: z.string()
    .optional()
    .refine((val) => !val || aadharRegex.test(val), {
      message: "Aadhar number must be 12 digits"
    }),
  emisNo: z.string()
    .optional()
    .refine((val) => !val || /^\d{1,15}$/.test(val), {
      message: "EMIS number must contain only digits"
    }),
})

// Family Information Schema
export const familyInfoSchema = z.object({
  fatherName: z.string()
    .min(1, "Father's name is required")
    .min(2, "Father's name must be at least 2 characters")
    .max(100, "Father's name must be at most 100 characters")
    .regex(/^[a-zA-Z\s.]+$/, "Father's name must contain only letters, spaces, and dots"),
  motherName: z.string()
    .min(1, "Mother's name is required")
    .min(2, "Mother's name must be at least 2 characters")
    .max(100, "Mother's name must be at most 100 characters")
    .regex(/^[a-zA-Z\s.]+$/, "Mother's name must contain only letters, spaces, and dots"),
  mobileNo1: z.string()
    .min(1, "Primary mobile number is required")
    .regex(phoneRegex, "Mobile number must be 10 digits starting with 6-9"),
  mobileNo2: z.string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Mobile number must be 10 digits starting with 6-9"
    }),
})

// Additional Information Schema
export const additionalInfoSchema = z.object({
  community: z.string()
    .min(1, "Community is required")
    .max(50, "Community must be at most 50 characters"),
  motherTongue: z.string()
    .min(1, "Mother tongue is required")
    .max(50, "Mother tongue must be at most 50 characters"),
  religion: z.string()
    .min(1, "Religion is required")
    .max(50, "Religion must be at most 50 characters"),
  caste: z.string()
    .min(1, "Caste is required")
    .max(50, "Caste must be at most 50 characters"),
  nationality: z.string()
    .min(1, "Nationality is required")
    .max(50, "Nationality must be at most 50 characters")
    .default("Indian"),
  address: z.string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be at most 500 characters"),
  previousSchool: z.string()
    .optional()
    .refine((val) => !val || val.length <= 200, {
      message: "Previous school name must be at most 200 characters"
    }),
  remarks: z.string()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: "Remarks must be at most 500 characters"
    }),
})

// Combined Form Schema (without isActive for form use)
export const studentFormSchema = z.object({
  ...basicInfoSchema.shape,
  ...familyInfoSchema.shape,
  ...additionalInfoSchema.shape,
})

// Complete Student Schema (with isActive for database operations)
export const studentSchema = studentFormSchema.extend({
  isActive: z.boolean().default(true),
})

// Update schemas
export const studentUpdateSchema = studentSchema.partial()

// Export types
export type BasicInfoData = z.infer<typeof basicInfoSchema>
export type FamilyInfoData = z.infer<typeof familyInfoSchema>
export type AdditionalInfoData = z.infer<typeof additionalInfoSchema>
export type StudentFormData = z.infer<typeof studentFormSchema>
export type StudentData = z.infer<typeof studentSchema>
export type StudentUpdateData = z.infer<typeof studentUpdateSchema>