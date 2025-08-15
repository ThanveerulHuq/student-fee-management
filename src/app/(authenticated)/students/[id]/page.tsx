"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import { DeactivateStudentDialog } from "@/components/students/deactivate-student-dialog"
import { ReactivateStudentDialog } from "@/components/students/reactivate-student-dialog"
import { toast } from "sonner"
import StudentHeader from "../_components/details/student-header"
import PersonalInfoCard from "../_components/details/personal-info-card"
import FamilyContactCard from "../_components/details/family-contact-card"
import EnrollmentHistoryCard from "../_components/details/enrollment-history-card"
import { StudentEnrollment } from "@/types/enrollment"
import { MobileNumber } from "@/generated/prisma"

interface Student {
  id: string
  admissionNo: string
  aadharNo?: string
  emisNo?: string
  penNumber?: string
  udiseNumber?: string
  name: string
  gender: string
  dateOfBirth: string
  age?: number // Make age optional since it's calculated dynamically
  community: string
  motherTongue: string
  mobileNo: string
  fatherName: string
  motherName: string
  address: string
  previousSchool?: string
  religion: string
  caste: string
  nationality: string
  remarks?: string
  siblingIds: string[]
  isActive: boolean
  admissionDate: string
  enrollments: Array<StudentEnrollment>
  mobileNumbers: Array<MobileNumber>
}

interface StudentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { navigateTo } = useAcademicYearNavigation()
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setStudentId(p.id))
  }, [params])

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showReactivateDialog, setShowReactivateDialog] = useState(false)

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
        setStudent(data)
      } else {
        console.error("Failed to fetch student")
      }
    } catch (error) {
      console.error("Error fetching student:", error)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])


  const handleDeactivateStudent = () => {
    setShowDeactivateDialog(true)
  }

  const handleReactivateStudent = () => {
    setShowReactivateDialog(true)
  }

  const handleConfirmDeactivation = async (data: { reason?: string }) => {
    if (!student) return

    try {
      const response = await fetch(`/api/students/${student.id}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Student Deactivated", {
          description: result.message,
        })
        setShowDeactivateDialog(false)
        // Refresh the student data
        fetchStudent()
      } else {
        const error = await response.json()
        toast.error("Error", {
          description: error.error || "Failed to deactivate student",
        })
      }
    } catch (error) {
      console.error('Error deactivating student:', error)
      toast.error("Error", {
        description: "An unexpected error occurred",
      })
    }
  }

  const handleConfirmReactivation = async (data: {
    restoreEnrollments?: boolean
    academicYearId?: string
    classId?: string
  }) => {
    if (!student) return

    try {
      const response = await fetch(`/api/students/${student.id}/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Student Reactivated", {
          description: result.message,
        })
        setShowReactivateDialog(false)
        // Refresh the student data
        fetchStudent()
      } else {
        const error = await response.json()
        toast.error("Error", {
          description: error.error || "Failed to reactivate student",
        })
      }
    } catch (error) {
      console.error('Error reactivating student:', error)
      toast.error("Error", {
        description: "An unexpected error occurred",
      })
    }
  }

  const handleCancelDialog = () => {
    setShowDeactivateDialog(false)
    setShowReactivateDialog(false)
  }

  const handlePrint = () => {
    navigateTo(`/students/${studentId}/print`)
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
    <div className="min-h-screen bg-gray-50/30">
      <StudentHeader
        student={student}
        onEdit={() => navigateTo(`/students/${studentId}/edit`)}
        onEnroll={() => navigateTo(`/enrollments/enroll/${studentId}`)}
        onDeactivate={handleDeactivateStudent}
        onReactivate={handleReactivateStudent}
        onBack={() => router.back()}
        onPrint={handlePrint}
      />

      <main className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <PersonalInfoCard student={student} />
        <FamilyContactCard student={student} />
        <EnrollmentHistoryCard 
          enrollments={student.enrollments}
          onEnrollClick={() => navigateTo(`/enrollments/enroll/${studentId}`)}
          onFeeCollectionClick={(enrollmentId) => navigateTo(`/fees/collect/${enrollmentId}`)}
        />
      </main>

      {/* Dialogs */}
      {student && (
        <>
          <DeactivateStudentDialog
            student={student}
            isOpen={showDeactivateDialog}
            onConfirm={handleConfirmDeactivation}
            onCancel={handleCancelDialog}
          />
          <ReactivateStudentDialog
            student={student}
            isOpen={showReactivateDialog}
            onConfirm={handleConfirmReactivation}
            onCancel={handleCancelDialog}
          />
        </>
      )}
    </div>
  )
}