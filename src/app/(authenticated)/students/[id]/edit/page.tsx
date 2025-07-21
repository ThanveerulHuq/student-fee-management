"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import SecondaryHeader from "@/components/ui/secondary-header"
import StudentForm from "@/app/(authenticated)/students/_components/student-form"
import { type StudentFormData } from "@/lib/validations/student"
import { Spinner } from "@/components/ui/spinner"

interface EditStudentPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { navigateTo } = useAcademicYearNavigation()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [student, setStudent] = useState<StudentFormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(p => setStudentId(p.id))
  }, [params])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const fetchStudent = useCallback(async () => {
    if (!studentId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        // Convert the student data to form format
        const formData: StudentFormData = {
          admissionNo: data.admissionNo,
          admissionDate: data.admissionDate,
          aadharNo: data.aadharNo || "",
          emisNo: data.emisNo || "",
          name: data.name,
          gender: data.gender as "MALE" | "FEMALE",
          dateOfBirth: data.dateOfBirth.split('T')[0], // Convert ISO date to YYYY-MM-DD
          community: data.community,
          motherTongue: data.motherTongue,
          mobileNo1: data.mobileNo1,
          mobileNo2: data.mobileNo2 || "",
          fatherName: data.fatherName,
          motherName: data.motherName,
          address: data.address,
          previousSchool: data.previousSchool || "",
          religion: data.religion,
          caste: data.caste,
          nationality: data.nationality,
          remarks: data.remarks || "",
          isActive: data.isActive,
        }
        setStudent(formData)
      } else {
        console.error("Failed to fetch student")
        navigateTo('/students')
      }
    } catch (error) {
      console.error("Error fetching student:", error)
      navigateTo('/students')
    } finally {
      setLoading(false)
    }
  }, [studentId, navigateTo])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  const handleSubmit = async (data: StudentFormData) => {
    if (!studentId) throw new Error("Student ID not found")

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      navigateTo(`/students/${studentId}`)
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update student")
    }
  }

  const handleCancel = () => {
    navigateTo(`/students/${studentId}`)
  }

  if (status === "loading" || loading) {
    return <Spinner size="2xl" fullScreen label="Loading student details..." />
  }

  if (!session || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Student not found</p>
        </div>
      </div>
    )
  }
  

  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <StudentForm 
          initialData={student}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </main>
  )
}