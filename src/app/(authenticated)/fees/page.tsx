"use client"

import { useEffect, useState, useCallback } from "react"
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
  CreditCard,
  IndianRupee,
  TrendingDown,
  Users,
  DollarSign
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/receipt"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import EnhancedPageHeader from "@/components/ui/enhanced-page-header"

interface OutstandingFee {
  id: string
  section: string
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
  feeBreakdown: {
    schoolFee: { total: number; paid: number; outstanding: number }
    bookFee: { total: number; paid: number; outstanding: number }
    uniformFee: { total: number; paid: number; outstanding: number }
    islamicStudies: { total: number; paid: number; outstanding: number }
    vanFee: { total: number; paid: number; outstanding: number }
    scholarship: number
    totalFee: number
    totalPaid: number
    outstanding: number
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
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const fetchOutstandingFees = useCallback(async () => {
    if (!academicYear) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        minOutstanding: "1", // Only show students with outstanding fees > ₹1
        academicYear: academicYear.id,
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
  }, [page, academicYear])

  useEffect(() => {
    fetchOutstandingFees()
  }, [fetchOutstandingFees])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedPageHeader 
        title="Fee Management" 
        showBackButton={true}
      >
        <Button onClick={() => navigateTo("/fees/collect")}>
          <CreditCard className="h-4 w-4 mr-2" />
          Collect Fees
        </Button>
      </EnhancedPageHeader>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Outstanding Fees</span>
              <Badge variant="secondary">{summary.totalStudents}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading outstanding fees...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-gray-500">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No outstanding fees found</p>
                          <p className="text-sm">All students are up to date with their payments!</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    outstandingFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">
                          {fee.student.name}
                        </TableCell>
                        <TableCell>{fee.student.admissionNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{fee.academicYear.year}</span>
                            {fee.academicYear.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{fee.class.className}</TableCell>
                        <TableCell>{formatCurrency(fee.feeBreakdown.totalFee)}</TableCell>
                        <TableCell>{formatCurrency(fee.feeBreakdown.totalPaid)}</TableCell>
                        <TableCell>
                          <span className="text-red-600 font-semibold">
                            {formatCurrency(fee.feeBreakdown.outstanding)}
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
      </main>
    </div>
  )
}