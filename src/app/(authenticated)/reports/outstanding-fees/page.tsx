"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAcademicYear } from "@/contexts/academic-year-context"
import SecondaryHeader from "@/components/ui/secondary-header"
import { trackReportGenerated, trackOutstandingFeesViewed, trackPageView } from "@/lib/analytics"

interface OutstandingFeesPageProps {
  params: Promise<Record<string, never>>
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Download,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  RefreshCw,
  Users,
  DollarSign,
  Phone
} from "lucide-react"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import { MobileNumber } from "@/generated/prisma"

interface OutstandingStudent {
  id: string
  student: {
    id: string
    name: string
    admissionNo: string
    fatherName: string
    mobileNo: string
    isActive: boolean
  }
  academicYear: {
    year: string
  }
  class: {
    className: string
  }
  section: string
  totalFee: number
  totalPaid: number
  outstanding: number
  feeBreakdown: {
    schoolFee: number
    bookFee: number
    uniformFee: number
    islamicStudies: number
    vanFee: number
    scholarship: number
  }
  paidBreakdown: {
    schoolFeePaid: number
    bookFeePaid: number
    uniformFeePaid: number
    islamicStudiesPaid: number
    vanFeePaid: number
  }
}

interface ReportData {
  students: OutstandingStudent[]
  summary: {
    totalStudents: number
    studentsWithOutstanding: number
    totalOutstandingAmount: number
    classTotals: Array<{
      class: string
      studentsCount: number
      outstandingAmount: number
    }>
  }
}

export default function OutstandingFeesReportPage({}: OutstandingFeesPageProps) {
  const { data: session, status } = useSession()
  const { academicYear } = useAcademicYear()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Filter states
  const [classes, setClasses] = useState<{ id: string; className: string }[]>([])
  const [filters, setFilters] = useState({
    classId: searchParams.get("classId") || "",
    section: searchParams.get("section") || "",
    minOutstanding: searchParams.get("minOutstanding") || "1",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    loadClasses()
    trackPageView('Outstanding Fees Report', 'reports')
  }, [])

  const generateReport = useCallback(async () => {
    setLoading(true)
    setError("")
    
    try {
      // Use the outstanding fees API with filtering
      const queryParams = new URLSearchParams()
      if (academicYear?.id) queryParams.append("academicYearId", academicYear.id)
      if (filters.classId) queryParams.append("classId", filters.classId)
      if (filters.section) queryParams.append("section", filters.section)
      if (filters.minOutstanding) queryParams.append("minOutstanding", filters.minOutstanding)

      const response = await fetch(`/api/reports/outstanding-fees?${queryParams}`)
      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await response.json()
      
      // Map the API response to the UI format
      const outstandingStudents: OutstandingStudent[] = data.students.map((student: any) => ({
        id: student.id,
        student: {
          id: student.id,
          name: student.name,
          admissionNo: student.admissionNo,
          fatherName: student.fatherName,
          mobileNo: student.mobileNo,
          isActive: true, // API only returns active students
        },
        academicYear: {
          year: academicYear?.year || "Current",
        },
        class: {
          className: student.class,
        },
        section: student.section,
        totalFee: student.totalFees,
        totalPaid: student.paidAmount,
        outstanding: student.outstandingAmount,
        feeBreakdown: {
          schoolFee: 0, // Will calculate from fees array
          bookFee: 0,
          uniformFee: 0,
          islamicStudies: 0,
          vanFee: 0,
          scholarship: 0,
        },
        paidBreakdown: {
          schoolFeePaid: 0, // Will calculate from fees array
          bookFeePaid: 0,
          uniformFeePaid: 0,
          islamicStudiesPaid: 0,
          vanFeePaid: 0,
        }
      }))

      const processedData: ReportData = {
        students: outstandingStudents,
        summary: data.summary
      }

      setReportData(processedData)
      
      // Track report generation and outstanding fees viewed
      trackReportGenerated('outstanding_fees')
      trackOutstandingFeesViewed()
    } catch (error) {
      setError("Failed to generate report. Please try again.")
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }, [filters, academicYear])

  useEffect(() => {
    if (session && academicYear) {
      generateReport()
    }
  }, [session, academicYear, generateReport])


  const loadClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    }
  }


  const exportToCSV = async () => {
    if (!reportData) return

    try {
      const headers = [
        "Admission No",
        "Student Name",
        "Father's Name",
        "Mobile No",
        "Academic Year",
        "Class",
        "Section",
        "Total Fee",
        "Total Paid",
        "Outstanding Amount",
        "School Fee Due",
        "Book Fee Due",
        "Uniform Fee Due",
        "Islamic Studies Due",
        "Van Fee Due",
      ]

      const rows = reportData.students.map(student => [
        student.student.admissionNo,
        student.student.name,
        student.student.fatherName,
        student.student.mobileNo,
        student.academicYear.year,
        student.class.className,
        student.section,
        student.totalFee,
        student.totalPaid,
        student.outstanding,
        student.feeBreakdown.schoolFee - student.paidBreakdown.schoolFeePaid,
        student.feeBreakdown.bookFee - student.paidBreakdown.bookFeePaid,
        student.feeBreakdown.uniformFee - student.paidBreakdown.uniformFeePaid,
        student.feeBreakdown.islamicStudies - student.paidBreakdown.islamicStudiesPaid,
        student.feeBreakdown.vanFee - student.paidBreakdown.vanFeePaid,
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `outstanding-fees-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      classId: "",
      section: "",
      minOutstanding: "1",
    })
  }

  const getOutstandingSeverity = (amount: number) => {
    if (amount <= 5000) return { color: "bg-yellow-100 text-yellow-800", label: "Low" }
    if (amount <= 15000) return { color: "bg-orange-100 text-orange-800", label: "Medium" }
    return { color: "bg-red-100 text-red-800", label: "High" }
  }

  if (status === "loading" || !session) {
    return <LoaderWrapper fullScreen label="Loading outstanding fees report..." />
  }

  return (
    <>
      <SecondaryHeader 
        title="Outstanding Fees Report"
        showBackButton={true}
        backPath="/reports"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          disabled={!reportData || loading}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </SecondaryHeader>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="class">Class</Label>
                <Select
                  value={filters.classId}
                  onValueChange={(value) => handleFilterChange("classId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  placeholder="Enter section"
                  value={filters.section}
                  onChange={(e) => handleFilterChange("section", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="minOutstanding">Min Outstanding (₹)</Label>
                <Input
                  id="minOutstanding"
                  type="number"
                  placeholder="Minimum amount"
                  value={filters.minOutstanding}
                  onChange={(e) => handleFilterChange("minOutstanding", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
              <Button onClick={generateReport} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Students with Outstanding</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.studentsWithOutstanding}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{reportData.summary.totalOutstandingAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Outstanding</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{reportData.summary.studentsWithOutstanding > 0 ? Math.round(reportData.summary.totalOutstandingAmount / reportData.summary.studentsWithOutstanding).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Outstanding Students Table */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Outstanding Fees Details ({reportData.students.length} students)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class & Academic Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee Summary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outstanding Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.students.map((student) => {
                      const severity = getOutstandingSeverity(student.outstanding)
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{student.student.name}</p>
                              <p className="text-sm text-gray-500">Adm: {student.student.admissionNo}</p>
                              <p className="text-sm text-gray-500">Father: {student.student.fatherName}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {student.class.className} - {student.section}
                              </p>
                              <p className="text-sm text-gray-500">{student.academicYear.year}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div>
                              <p className="text-gray-900">Total: ₹{student.totalFee.toLocaleString()}</p>
                              <p className="text-green-600">Paid: ₹{student.totalPaid.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-lg font-bold text-red-600">
                                ₹{student.outstanding.toLocaleString()}
                              </p>
                              <Badge className={severity.color}>
                                {severity.label}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-1" />
                              {student.student.mobileNo}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="p-8">
              <LoaderWrapper center label="Generating report..." />
            </CardContent>
          </Card>
        )}

        {/* No Data */}
        {reportData && reportData.students.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Outstanding Fees Found</h3>
                <p className="text-gray-600">All students have paid their fees or no students match the current filters.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}