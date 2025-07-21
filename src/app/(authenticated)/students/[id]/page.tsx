"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Edit, 
  UserPlus, 
  UserMinus,
  User,
  GraduationCap,
  CreditCard,
  Phone,
  MapPin,
  ArrowLeft
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { DeactivateStudentDialog } from "@/components/students/deactivate-student-dialog"
import { ReactivateStudentDialog } from "@/components/students/reactivate-student-dialog"
import { toast } from "sonner"

interface Student {
  id: string
  admissionNo: string
  aadharNo?: string
  emisNo?: string
  name: string
  gender: string
  dateOfBirth: string
  age: number
  community: string
  motherTongue: string
  mobileNo1: string
  mobileNo2?: string
  fatherName: string
  motherName: string
  address: string
  previousSchool?: string
  religion: string
  caste: string
  nationality: string
  remarks?: string
  isActive: boolean
  admissionDate: string
  enrollments: Array<{
    id: string
    section: string
    uniformFee: number
    islamicStudies: number
    vanFee: number
    scholarship: number
    isActive: boolean
    academicYear: {
      year: string
      isActive: boolean
    }
    class: {
      className: string
    }
    commonFee: {
      schoolFee: number
      bookFee: number
    }
    paidFee?: {
      totalPaid: number
    }
  }>
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

  const calculateTotalFee = (enrollment: {
    commonFee: { schoolFee: number; bookFee: number }
    uniformFee: number
    islamicStudies: number
    vanFee: number
    scholarship: number
  }) => {
    return (
      enrollment.commonFee.schoolFee +
      enrollment.commonFee.bookFee +
      enrollment.uniformFee +
      enrollment.islamicStudies +
      enrollment.vanFee -
      enrollment.scholarship
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN")
  }

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
    <div className="min-h-screen bg-gray-50/30">
      
      {/* Modern Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("/students")}
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Back to Students"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{student?.name}</h1>
                <p className="text-sm text-gray-600">Student Details • Admission #{student?.admissionNo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigateTo(`/students/${studentId}/enroll`)}
                disabled={!studentId}
                className="border-gray-300"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo(`/students/${studentId}/edit`)}
                disabled={!studentId}
                className="border-gray-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {student?.isActive ? (
                <Button
                  variant="outline"
                  onClick={handleDeactivateStudent}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleReactivateStudent}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Student Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Details Card */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${
                        student.gender === 'MALE' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-pink-50 text-pink-700 border-pink-200'
                      }`}
                    >
                      {student.gender}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(student.dateOfBirth)} ({student.age} years)</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission Date</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(student.admissionDate)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Community</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.community}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Religion</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.religion}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Caste</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.caste}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nationality</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.nationality}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mother Tongue</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.motherTongue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          {(student.aadharNo || student.emisNo || student.previousSchool || student.remarks) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Additional Information</h4>
              <div className="space-y-4">
                {student.aadharNo && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aadhar Number</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{student.aadharNo}</p>
                  </div>
                )}
                {student.emisNo && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">EMIS Number</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{student.emisNo}</p>
                  </div>
                )}
                {student.previousSchool && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previous School</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{student.previousSchool}</p>
                  </div>
                )}
                {student.remarks && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{student.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Family & Contact Information Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Family & Contact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father&apos;s Name</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{student.fatherName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mother&apos;s Name</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{student.motherName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Mobile</label>
              <div className="flex items-center space-x-2 mt-1">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 font-mono">{student.mobileNo1}</p>
              </div>
            </div>
            {student.mobileNo2 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secondary Mobile</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 font-mono">{student.mobileNo2}</p>
                </div>
              </div>
            )}
            <div className={student.mobileNo2 ? "md:col-span-2" : "md:col-span-2"}>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
              <div className="flex items-start space-x-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-sm font-medium text-gray-900">{student.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment History Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Enrollment History</h3>
              </div>
              {student.enrollments.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo(`/students/${studentId}/enroll`)}
                  disabled={!studentId}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll Student
                </Button>
              )}
            </div>
          </div>
          
          {student.enrollments.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30 text-gray-400" />
              <p className="text-gray-500 text-lg font-medium">No enrollments found</p>
              <p className="text-gray-400 text-sm mt-1">This student has not been enrolled in any academic year yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Academic Year</TableHead>
                    <TableHead className="font-semibold text-gray-700">Class</TableHead>
                    <TableHead className="font-semibold text-gray-700">Section</TableHead>
                    <TableHead className="font-semibold text-gray-700">Total Fee</TableHead>
                    <TableHead className="font-semibold text-gray-700">Paid</TableHead>
                    <TableHead className="font-semibold text-gray-700">Outstanding</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.enrollments.map((enrollment) => {
                    const totalFee = calculateTotalFee(enrollment)
                    const paid = enrollment.paidFee?.totalPaid || 0
                    const outstanding = totalFee - paid
                    
                    return (
                      <TableRow key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{enrollment.academicYear.year}</span>
                            {enrollment.academicYear.isActive && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Current
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 font-medium">{enrollment.class.className}</TableCell>
                        <TableCell className="py-4">{enrollment.section}</TableCell>
                        <TableCell className="py-4 font-mono">₹{totalFee.toLocaleString()}</TableCell>
                        <TableCell className="py-4 font-mono">₹{paid.toLocaleString()}</TableCell>
                        <TableCell className="py-4">
                          <span className={`font-semibold font-mono ${outstanding > 0 ? "text-red-600" : "text-green-600"}`}>
                            ₹{outstanding.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant={enrollment.isActive ? "default" : "secondary"} className="font-medium">
                            {enrollment.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          {outstanding > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateTo(`/fees/collect?enrollmentId=${enrollment.id}`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
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