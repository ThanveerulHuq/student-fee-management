"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import EnhancedPageHeader from "@/components/ui/enhanced-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  User,
  GraduationCap,
  CreditCard,
  Phone,
  MapPin
} from "lucide-react"

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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student details...</p>
        </div>
      </div>
    )
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
    <div className="min-h-screen bg-gray-50">
      <EnhancedPageHeader 
        title="Student Details"
        showBackButton={true}
        backPath="/students"
      >
        <Button
          variant="outline"
          onClick={() => navigateTo(`/students/${studentId}/enroll`)}
          disabled={!studentId}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Enroll
        </Button>
        <Button
          variant="outline"
          onClick={() => navigateTo(`/students/${studentId}/edit`)}
          disabled={!studentId}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </EnhancedPageHeader>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Basic Information</span>
                  <Badge variant={student.isActive ? "default" : "secondary"}>
                    {student.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">{student.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Admission Number</label>
                        <p className="text-sm">{student.admissionNo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Gender</label>
                        <p className="text-sm">{student.gender}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                        <p className="text-sm">{formatDate(student.dateOfBirth)} ({student.age} years)</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Admission Date</label>
                        <p className="text-sm">{formatDate(student.admissionDate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Community</label>
                      <p className="text-sm">{student.community}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Religion</label>
                      <p className="text-sm">{student.religion}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Caste</label>
                      <p className="text-sm">{student.caste}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nationality</label>
                      <p className="text-sm">{student.nationality}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Family Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Father&apos;s Name</label>
                      <p className="text-sm">{student.fatherName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mother&apos;s Name</label>
                      <p className="text-sm">{student.motherName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Primary Mobile</label>
                        <p className="text-sm">{student.mobileNo1}</p>
                      </div>
                    </div>
                    {student.mobileNo2 && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Secondary Mobile</label>
                          <p className="text-sm">{student.mobileNo2}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-sm">{student.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Enrollment History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className="text-gray-500">No enrollments found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigateTo(`/students/${studentId}/enroll`)}
                      disabled={!studentId}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Enroll Student
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Total Fee</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.enrollments.map((enrollment) => {
                        const totalFee = calculateTotalFee(enrollment)
                        const paid = enrollment.paidFee?.totalPaid || 0
                        const outstanding = totalFee - paid
                        
                        return (
                          <TableRow key={enrollment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{enrollment.academicYear.year}</span>
                                {enrollment.academicYear.isActive && (
                                  <Badge variant="outline" className="text-xs">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{enrollment.class.className}</TableCell>
                            <TableCell>{enrollment.section}</TableCell>
                            <TableCell>₹{totalFee.toLocaleString()}</TableCell>
                            <TableCell>₹{paid.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={outstanding > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                                ₹{outstanding.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={enrollment.isActive ? "default" : "secondary"}>
                                {enrollment.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {outstanding > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigateTo(`/fees/collect?enrollmentId=${enrollment.id}`)}
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo(`/students/${studentId}/enroll`)}
                  disabled={!studentId}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll in Class
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo(`/fees/collect?studentId=${studentId}`)}
                  disabled={!studentId}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Collect Fees
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigateTo(`/students/${studentId}/edit`)}
                  disabled={!studentId}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(student.aadharNo || student.emisNo || student.previousSchool || student.remarks) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.aadharNo && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Aadhar Number</label>
                      <p className="text-sm">{student.aadharNo}</p>
                    </div>
                  )}
                  {student.emisNo && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">EMIS Number</label>
                      <p className="text-sm">{student.emisNo}</p>
                    </div>
                  )}
                  {student.previousSchool && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Previous School</label>
                      <p className="text-sm">{student.previousSchool}</p>
                    </div>
                  )}
                  {student.remarks && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Remarks</label>
                      <p className="text-sm">{student.remarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}