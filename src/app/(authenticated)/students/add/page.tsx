"use client"

import { useRouter } from "next/navigation"
import StudentForm from "@/app/(authenticated)/students/_components/student-form"
import { type StudentFormData } from "@/lib/validations/student"
import { trackStudentCreated } from "@/lib/analytics"

interface AddStudentPageProps {
  params: Promise<Record<string, never>>
}

export default function AddStudentPage({}: AddStudentPageProps) {
  const router = useRouter()

  const handleSubmit = async (data: StudentFormData) => {
    // Add isActive field for database save
    const completeData = { ...data, isActive: true }

    const response = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(completeData),
    })

    if (response.ok) {
      const createdStudent = await response.json()
      trackStudentCreated()
      router.push('/students')
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create student")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <StudentForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={false}
        />
      </main>
  )
}