import { z } from "zod";

export const createAcademicYearSchema = z.object({
  year: z
    .string()
    .min(1, "Academic year is required")
    .regex(/^\d{4}-\d{2}$/, "Academic year must be in YYYY-YY format (e.g., 2024-25)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().optional().default(false),
  description: z.string().optional(),
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return startDate < endDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const updateAcademicYearSchema = z.object({
  year: z
    .string()
    .min(1, "Academic year is required")
    .regex(/^\d{4}-\d{2}$/, "Academic year must be in YYYY-YY format (e.g., 2024-25)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return startDate < endDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type CreateAcademicYearFormData = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearFormData = z.infer<typeof updateAcademicYearSchema>;