import { z } from "zod"

export const studentSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  aadharNo: z.string().optional(),
  emisNo: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.union([z.string(), z.date()]).transform((val) => {
    if (!val) throw new Error("Date of birth is required")
    return val instanceof Date ? val : new Date(val)
  }),
  community: z.string().min(1, "Community is required"),
  motherTongue: z.string().min(1, "Mother tongue is required"),
  mobileNo1: z.string().min(10, "Primary mobile number is required"),
  mobileNo2: z.string().optional(),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  address: z.string().min(1, "Address is required"),
  previousSchool: z.string().optional(),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),
  nationality: z.string().default("Indian"),
  remarks: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const studentUpdateSchema = studentSchema.partial()

export type StudentFormData = z.infer<typeof studentSchema>
export type StudentUpdateData = z.infer<typeof studentUpdateSchema>