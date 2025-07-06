"use client"

import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import EnhancedPageHeader from "@/components/ui/enhanced-page-header"
import SecondaryHeader from "@/components/ui/secondary-header"
import StudentForm from "@/app/(authenticated)/students/_components/student-form"
import { type StudentFormData } from "@/lib/validations/student"

interface AddStudentPageProps {
  params: Promise<Record<string, never>>
}

export default function AddStudentPage({}: AddStudentPageProps) {
  const { navigateTo } = useAcademicYearNavigation()

  const handleSubmit = async (data: StudentFormData) => {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      navigateTo('/students')
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create student")
    }
  }

  const handleCancel = () => {
    navigateTo('/students')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedPageHeader 
        title="Dhaarussalam Matriculation Higher Secondary School"
      />
      <SecondaryHeader 
        title="Add New Student"
        showBackButton={true}
        backPath="/students"
      />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <StudentForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={false}
        />
      </main>
    </div>
  )
}