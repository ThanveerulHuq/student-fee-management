"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import StudentPrintView from "../../_components/details/student-print-view"
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
  age?: number
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

interface StudentPrintPageProps {
  params: Promise<{
    id: string
  }>
}

export default function StudentPrintPage({ params }: StudentPrintPageProps) {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setStudentId(p.id))
  }, [params])

  const fetchStudent = useCallback(async () => {
    if (!studentId) return
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
      } else if (response.status === 404) {
        setError("Student not found")
      } else {
        setError("Failed to load student")
      }
    } catch (error) {
      console.error("Error fetching student:", error)
      setError("Failed to load student")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return <LoaderWrapper fullScreen label="Loading student information..." />
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{error || "Student not found"}</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden on print */}
      <div className="print:hidden">
        <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Print Student Information - {student.name}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 print:max-w-full print:py-0 print:px-2">
        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 0.5in;
            }
            
            /* Hide everything except student print content */
            body * {
              visibility: hidden;
            }
            
            .student-print-container,
            .student-print-container * {
              visibility: visible;
            }
            
            /* Position student content at top of page */
            .student-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              page-break-inside: avoid;
            }
            
            /* Ensure print only shows student content */
            header, nav, .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
        
        {/* Student Print Content */}
        <div className="student-print-container">
          <StudentPrintView student={student} />
        </div>
      </main>
    </div>
  )
}