'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  GraduationCap, 
  IndianRupee,
  Award,
  Eye,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useAcademicYear, useAcademicYearNavigation } from '@/contexts/academic-year-context'
import LoaderWrapper from '@/components/ui/loader-wrapper'
import { DeleteEnrollmentDialog } from './_components/delete-enrollment-dialog'
import { StudentEnrollmentWithTotals } from '@/types/enrollment'

const statusColors = {
  PAID: 'bg-green-100 text-green-800 border-green-200',
  PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OVERDUE: 'bg-red-100 text-red-800 border-red-200',
  WAIVED: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function EnrollmentsPage() {
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  const [enrollments, setEnrollments] = useState<StudentEnrollmentWithTotals[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<StudentEnrollmentWithTotals[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<StudentEnrollmentWithTotals | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [academicYear])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = enrollments.filter(enrollment => 
        enrollment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.class.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.section.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEnrollments(filtered)
    } else {
      setFilteredEnrollments(enrollments)
    }
  }, [searchTerm, enrollments])

  const fetchEnrollments = useCallback(async () => {
    try {
      const url = academicYear 
        ? `/api/enrollments?academicYearId=${academicYear.id}`
        : '/api/enrollments'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments || [])
        setFilteredEnrollments(data.enrollments || [])
      } else {
        toast.error('Failed to fetch enrollments')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching enrollments')
    } finally {
      setLoading(false)
    }
  }, [academicYear])

  const handleEdit = (enrollment: StudentEnrollmentWithTotals) => {
    // Navigate to edit enrollment page (could be implemented later)
    toast.info('Edit enrollment functionality will be available soon')
  }

  const handleDelete = (enrollment: StudentEnrollmentWithTotals) => {
    setEnrollmentToDelete(enrollment)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!enrollmentToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/enrollments/${enrollmentToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Enrollment deleted successfully')
        setDeleteDialogOpen(false)
        setEnrollmentToDelete(null)
        fetchEnrollments()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete enrollment')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting enrollment')
    } finally {
      setDeleting(false)
    }
  }

  const toggleRowExpansion = (enrollmentId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(enrollmentId)) {
      newExpandedRows.delete(enrollmentId)
    } else {
      newExpandedRows.add(enrollmentId)
    }
    setExpandedRows(newExpandedRows)
  }

  if (loading) {
    return <LoaderWrapper fullScreen label="Loading enrollments..." />
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Student Enrollments
                </h1>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={() => navigateTo('/enroll')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Enrollment
            </Button>
          </div>

          {/* Search Section - Primary Focus */}
          <div className="mt-6 space-y-4">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search students by name, admission number, class, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {filteredEnrollments.length} result{filteredEnrollments.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {searchTerm ? 'Showing' : 'Total Enrollments:'}
                </span>
                <Badge variant="secondary" className="text-base font-semibold px-3 py-1">
                  {filteredEnrollments.length}
                  {searchTerm && enrollments.length !== filteredEnrollments.length && (
                    <span className="text-gray-500 ml-1">of {enrollments.length}</span>
                  )}
                </Badge>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enrollments List */}
        <div className="space-y-2">
          {filteredEnrollments.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No matching enrollments' : 'No enrollments yet'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm 
                      ? 'Try adjusting your search terms to find students'
                      : 'Start enrolling students'
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700" 
                      onClick={() => navigateTo('/enroll')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll First Student
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Admission No.</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Class</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Section</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total Fees</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Due Amount</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrollments.map((enrollment) => (
                      <>
                        {/* Collapsed Row */}
                        <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleRowExpansion(enrollment.id)}
                              >
                                {expandedRows.has(enrollment.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                              <div className="p-2 bg-blue-50 rounded-full">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {enrollment.student.firstName} {enrollment.student.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {enrollment.student.fatherName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {enrollment.student.admissionNumber}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {enrollment.class.className}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {enrollment.section}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">
                            ₹{enrollment.totals.netAmount.total.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            <span className={enrollment.totals.netAmount.due > 0 ? 'text-red-600' : 'text-green-600'}>
                              ₹{enrollment.totals.netAmount.due.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              className={`${statusColors[enrollment.feeStatus.status as keyof typeof statusColors]} border text-xs font-medium`}
                            >
                              {enrollment.feeStatus.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => navigateTo(`/enrollments/${enrollment.id}`)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(enrollment)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(enrollment)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedRows.has(enrollment.id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={8} className="px-4 py-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Fee Items */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <IndianRupee className="w-4 h-4 mr-2 text-blue-600" />
                                    Fee Items
                                  </h4>
                                  <div className="space-y-2">
                                                                         {enrollment.fees.map((fee, index) => (
                                       <div key={index} className="bg-white rounded-lg p-3 border">
                                         <div className="flex justify-between items-start mb-2">
                                           <div className="flex-1">
                                             <div className="font-medium text-gray-900">{fee.templateName}</div>
                                           </div>
                                         </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                          <div>
                                            <div className="text-gray-600">Amount</div>
                                            <div className="font-medium">₹{fee.amount.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <div className="text-gray-600">Paid</div>
                                            <div className="font-medium text-green-600">₹{fee.amountPaid.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <div className="text-gray-600">Due</div>
                                            <div className="font-medium text-red-600">₹{fee.amountDue.toFixed(2)}</div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Scholarships */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Award className="w-4 h-4 mr-2 text-green-600" />
                                    Scholarships
                                  </h4>
                                  <div className="space-y-2">
                                    {enrollment.scholarships.length > 0 ? (
                                      enrollment.scholarships.map((scholarship, index) => (
                                        <div key={index} className="bg-white rounded-lg p-3 border">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <div className="font-medium text-gray-900">{scholarship.templateName}</div>
                                              <div className="text-sm text-green-600 font-medium">-₹{scholarship.amount.toFixed(2)}</div>
                                            </div>
                                            <Badge 
                                              variant={scholarship.isActive ? "default" : "secondary"}
                                              className="text-xs"
                                            >
                                              {scholarship.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="bg-white rounded-lg p-4 border text-center text-gray-500">
                                        <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No scholarships applied</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Payment Summary */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                                  <div className="bg-white rounded-lg p-4 border space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total Fees</span>
                                      <span className="font-medium">₹{enrollment.totals.fees.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Scholarships Applied</span>
                                      <span className="font-medium text-green-600">-₹{enrollment.totals.scholarships.applied.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Net Amount</span>
                                        <span className="font-bold">₹{enrollment.totals.netAmount.total.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Amount Paid</span>
                                        <span className="font-medium text-green-600">₹{enrollment.totals.netAmount.paid.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Amount Due</span>
                                        <span className="font-bold text-red-600">₹{enrollment.totals.netAmount.due.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteEnrollmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        enrollment={enrollmentToDelete}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  )
}