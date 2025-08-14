"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import StudentForm from "@/app/(authenticated)/students/_components/student-form"
import { type StudentFormData } from "@/lib/validations/student"
import LoaderWrapper from "@/components/ui/loader-wrapper"

interface EditStudentPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [student, setStudent] = useState<StudentFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isActive, setIsActive] = useState(true)
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
        setIsActive(data.isActive)
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
          mobileNumbers: data.mobileNumbers || [],
          fatherName: data.fatherName,
          motherName: data.motherName,
          address: data.address,
          previousSchool: data.previousSchool || "",
          religion: data.religion,
          caste: data.caste,
          nationality: data.nationality,
          remarks: data.remarks || "",
          siblingIds: data.siblingIds || [],
        }
        setStudent(formData)
      } else {
        console.error("Failed to fetch student")
        router.push('/students')
      }
    } catch (error) {
      console.error("Error fetching student:", error)
      router.push('/students')
    } finally {
      setLoading(false)
    }
  }, [studentId, router])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  const handleSubmit = async (data: StudentFormData) => {
    if (!studentId) throw new Error("Student ID not found")

    // Add isActive field for database update
    const completeData = { ...data, isActive }

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(completeData),
    })

    if (response.ok) {
      router.push(`/students/${studentId}`)
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update student")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (status === "loading" || loading) {
    return <LoaderWrapper fullScreen label="Loading student details..." />
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