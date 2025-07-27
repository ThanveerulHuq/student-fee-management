"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  CreditCard,
  IndianRupee,
  TrendingDown,
  Users,
  DollarSign,
  Search
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/receipt"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import LoaderWrapper from "@/components/ui/loader-wrapper"

interface OutstandingFee {
  id: string
  section: string
  student: {
    id: string
    name: string
    admissionNo: string
    fatherName: string
    phone: string
    status: string
  }
  academicYear: {
    id: string
    year: string
    startDate: string
    endDate: string
    isActive: boolean
  }
  class: {
    id: string
    className: string
    order: number
    isActive: boolean
  }
  feeBreakdown: {
    fees: Array<{
      templateName: string
      total: number
      paid: number
      outstanding: number
    }>
    scholarships: Array<{
      templateName: string
      amount: number
      isActive: boolean
    }>
    totals: {
      fees: {
        compulsory: number
        optional: number
        total: number
        paid: number
        due: number
      }
      scholarships: {
        applied: number
        autoApplied: number
        manual: number
      }
      netAmount: {
        total: number
        paid: number
        due: number
      }
    }
    feeStatus: {
      status: string
      lastPaymentDate?: string
      nextDueDate?: string
      overdueAmount: number
    }
  }
}

interface OutstandingResponse {
  enrollments: OutstandingFee[]
  summary: {
    totalStudents: number
    totalOutstanding: number
    averageOutstanding: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function FeesPage() {
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  const [outstandingFees, setOutstandingFees] = useState<OutstandingFee[]>([])
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalOutstanding: 0,
    averageOutstanding: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const fetchOutstandingFees = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      })

      const response = await fetch(`/api/fees/outstanding?${params}`)
      if (response.ok) {
        const data: OutstandingResponse = await response.json()
        setOutstandingFees(data.enrollments)
        setSummary(data.summary)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching outstanding fees:", error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchOutstandingFees()
  }, [fetchOutstandingFees])

  // Filter fees based on search term
  const filteredFees = outstandingFees.filter(fee => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      fee.student.name.toLowerCase().includes(searchLower) ||
      fee.student.fatherName.toLowerCase().includes(searchLower) ||
      fee.student.admissionNo.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <LoaderWrapper fullScreen label="Loading fees..." />
  }

  return (
    <main className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Fee Management</h1>
                <p className="text-gray-600 text-sm">Manage and collect student fees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Students with Outstanding Fees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Active enrollments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Outstanding Amount
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalOutstanding)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending collection
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Outstanding
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.averageOutstanding)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per student
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Outstanding Fees Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Outstanding Fees</span>
                  <Badge variant="secondary">{filteredFees.length}</Badge>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by student or father name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  {/* Collect Fees Button */}
                  <Button onClick={() => navigateTo("/fees/collect")}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Collect Fees
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <LoaderWrapper center label="Loading outstanding fees..." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Father&apos;s Name</TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Fee</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-gray-500">
                            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            {searchTerm ? (
                              <>
                                <p>No students found matching &quot;{searchTerm}&quot;</p>
                                <p className="text-sm">Try adjusting your search terms</p>
                              </>
                            ) : (
                              <>
                                <p>No outstanding fees found</p>
                                <p className="text-sm">All students are up to date with their payments!</p>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">
                            {fee.student.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {fee.student.fatherName}
                          </TableCell>
                          <TableCell>{fee.student.admissionNo}</TableCell>
                          <TableCell>{fee.class.className} - {fee.section}</TableCell>
                          <TableCell>{formatCurrency(fee.feeBreakdown.totals.netAmount.total)}</TableCell>
                          <TableCell>{formatCurrency(fee.feeBreakdown.totals.netAmount.paid)}</TableCell>
                          <TableCell>
                            <span className="text-red-600 font-semibold">
                              {formatCurrency(fee.feeBreakdown.totals.netAmount.due)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => navigateTo(`/fees/collect?enrollmentId=${fee.id}`)}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Collect
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateTo(`/students/${fee.student.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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
                {pagination.total} students
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
        </div>
      </div>
    </main>
  )
}