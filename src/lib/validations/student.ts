import { z } from "zod"

const phoneRegex = /^[6-9]\d{9}$/
const aadharRegex = /^\d{12}$/

export const studentSchema = z.object({
  admissionNo: z.string()
    .min(1, "Admission number is required")
    .max(20, "Admission number must be at most 20 characters")
    .regex(/^[A-Z0-9]+$/, "Admission number must contain only uppercase letters and numbers"),
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
      const today = new Date()
      const age = today.getFullYear() - date.getFullYear()
      return age >= 3 && age <= 25
    }, {
      message: "Student must be between 3 and 25 years old"
    }),
  community: z.string()
    .min(1, "Community is required")
    .max(50, "Community must be at most 50 characters"),
  motherTongue: z.string()
    .min(1, "Mother tongue is required")
    .max(50, "Mother tongue must be at most 50 characters"),
  mobileNo1: z.string()
    .min(1, "Primary mobile number is required")
    .regex(phoneRegex, "Mobile number must be 10 digits starting with 6-9"),
  mobileNo2: z.string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Mobile number must be 10 digits starting with 6-9"
    }),
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
  address: z.string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be at most 500 characters"),
  previousSchool: z.string()
    .optional()
    .refine((val) => !val || val.length <= 200, {
      message: "Previous school name must be at most 200 characters"
    }),
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
  remarks: z.string()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: "Remarks must be at most 500 characters"
    }),
  isActive: z.boolean(),
})

export const studentUpdateSchema = studentSchema.partial()

export type StudentFormData = z.infer<typeof studentSchema>
export type StudentUpdateData = z.infer<typeof studentUpdateSchema>