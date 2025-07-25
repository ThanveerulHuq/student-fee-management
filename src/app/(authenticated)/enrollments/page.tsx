"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Eye, 
  GraduationCap,
  CreditCard
} from "lucide-react"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import SecondaryHeader from "@/components/ui/secondary-header"
import { Spinner } from "@/components/ui/spinner"

interface Enrollment {
  id: string
  section: string
  uniformFee: number
  islamicStudies: number
  vanFee: number
  scholarship: number
  enrollmentDate: string
  isActive: boolean
  student: {
    id: string
    name: string
    admissionNo: string
  }
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
}

interface EnrollmentsResponse {
  enrollments: Enrollment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function EnrollmentsPage() {
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    classId: "",
    section: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchEnrollments = useCallback(async () => {
    if (!academicYear) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        academicYear: academicYear.id,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value)
        ),
      })

      const response = await fetch(`/api/enrollments?${params}`)
      if (response.ok) {
        const data: EnrollmentsResponse = await response.json()
        setEnrollments(data.enrollments)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }, [page, filters, academicYear])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  const calculateTotalFee = (enrollment: Enrollment) => {
    return (
      enrollment.commonFee.schoolFee +
      enrollment.commonFee.bookFee +
      enrollment.uniformFee +
      enrollment.islamicStudies +
      enrollment.vanFee -
      enrollment.scholarship
    )
  }

  const calculateOutstanding = (enrollment: Enrollment) => {
    const totalFee = calculateTotalFee(enrollment)
    const paid = enrollment.paidFee?.totalPaid || 0
    return totalFee - paid
  }

  if (loading) {
    return <Spinner size="2xl" fullScreen />
  }

  return (
    <>
      <SecondaryHeader 
        title="Student Enrollments" 
        showBackButton={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Enrollments</span>
              <Badge variant="secondary">{pagination.total}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <select
                  value={filters.classId}
                  onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Classes</option>
                  {/* Classes will be populated */}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Input
                  placeholder="Enter section..."
                  value={filters.section}
                  onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <Spinner center label="Loading enrollments..." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
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
                  {enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-gray-500">
                          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No enrollments found</p>
                          <p className="text-sm">Students will appear here once enrolled</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((enrollment) => {
                      const totalFee = calculateTotalFee(enrollment)
                      const outstanding = calculateOutstanding(enrollment)
                      
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.student.name}
                          </TableCell>
                          <TableCell>{enrollment.student.admissionNo}</TableCell>
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
                          <TableCell>
                            ₹{(enrollment.paidFee?.totalPaid || 0).toLocaleString()}
                          </TableCell>
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
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateTo(`/students/${enrollment.student.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {outstanding > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigateTo(`/fees/collect?enrollmentId=${enrollment.id}`)}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} enrollments
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}