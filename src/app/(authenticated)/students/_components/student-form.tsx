"use client"

import StudentFormWizard from "./student-form-wizard"
import { type StudentFormData } from "@/lib/validations/student"

interface StudentFormProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export default function StudentForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}: StudentFormProps) {
  return (
    <StudentFormWizard
      initialData={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isEdit={isEdit}
    />
  )
}