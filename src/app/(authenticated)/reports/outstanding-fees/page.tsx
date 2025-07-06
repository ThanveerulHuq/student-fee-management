"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import EnhancedPageHeader from "@/components/ui/enhanced-page-header"
import SecondaryHeader from "@/components/ui/secondary-header"

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

interface OutstandingStudent {
  id: string
  student: {
    id: string
    name: string
    admissionNo: string
    fatherName: string
    mobileNo1: string
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
    totalOutstanding: number
    averageOutstanding: number
  }
}

export default function OutstandingFeesReportPage({}: OutstandingFeesPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Filter states
  const [academicYears, setAcademicYears] = useState<{ id: string; year: string }[]>([])
  const [classes, setClasses] = useState<{ id: string; className: string }[]>([])
  const [filters, setFilters] = useState({
    academicYearId: searchParams.get("academicYearId") || "",
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
    loadAcademicYears()
    loadClasses()
  }, [])

  const generateReport = useCallback(async () => {
    setLoading(true)
    setError("")
    
    try {
      // Use the student reports API with filtering for outstanding fees
      const queryParams = new URLSearchParams()
      if (filters.academicYearId) queryParams.append("academicYearId", filters.academicYearId)
      if (filters.classId) queryParams.append("classId", filters.classId)
      if (filters.section) queryParams.append("section", filters.section)
      queryParams.append("isActive", "true") // Only active students

      const response = await fetch(`/api/reports/students?${queryParams}`)
      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await response.json()
      
      // Process data to filter only students with outstanding fees
      const minOutstanding = parseFloat(filters.minOutstanding) || 1
      const outstandingStudents: OutstandingStudent[] = []
      
      data.students.forEach((student: {
        id: string
        name: string
        admissionNo: string
        fatherName: string
        mobileNo1: string
        isActive: boolean
        enrollments: Array<{
          id: string
          section: string
          academicYear: { year: string }
          class: { className: string }
          feeCalculation: { totalFee: number; totalPaid: number; outstanding: number }
          commonFee: { schoolFee: number; bookFee: number }
          paidFee: {
            schoolFeePaid: number
            bookFeePaid: number
            uniformFeePaid: number
            islamicStudiesPaid: number
            vanFeePaid: number
          } | null
          uniformFee: number
          islamicStudies: number
          vanFee: number
          scholarship: number
        }>
      }) => {
        student.enrollments.forEach((enrollment) => {
          const outstanding = enrollment.feeCalculation.outstanding
          
          if (outstanding >= minOutstanding) {
            outstandingStudents.push({
              id: enrollment.id,
              student: {
                id: student.id,
                name: student.name,
                admissionNo: student.admissionNo,
                fatherName: student.fatherName,
                mobileNo1: student.mobileNo1,
                isActive: student.isActive,
              },
              academicYear: enrollment.academicYear,
              class: enrollment.class,
              section: enrollment.section,
              totalFee: enrollment.feeCalculation.totalFee,
              totalPaid: enrollment.feeCalculation.totalPaid,
              outstanding: outstanding,
              feeBreakdown: {
                schoolFee: enrollment.commonFee.schoolFee,
                bookFee: enrollment.commonFee.bookFee,
                uniformFee: enrollment.uniformFee,
                islamicStudies: enrollment.islamicStudies,
                vanFee: enrollment.vanFee,
                scholarship: enrollment.scholarship,
              },
              paidBreakdown: enrollment.paidFee ? {
                schoolFeePaid: enrollment.paidFee.schoolFeePaid || 0,
                bookFeePaid: enrollment.paidFee.bookFeePaid || 0,
                uniformFeePaid: enrollment.paidFee.uniformFeePaid || 0,
                islamicStudiesPaid: enrollment.paidFee.islamicStudiesPaid || 0,
                vanFeePaid: enrollment.paidFee.vanFeePaid || 0,
              } : {
                schoolFeePaid: 0,
                bookFeePaid: 0,
                uniformFeePaid: 0,
                islamicStudiesPaid: 0,
                vanFeePaid: 0,
              }
            })
          }
        })
      })

      // Calculate summary statistics
      const totalOutstanding = outstandingStudents.reduce((sum, s) => sum + s.outstanding, 0)

      const processedData: ReportData = {
        students: outstandingStudents.sort((a, b) => b.outstanding - a.outstanding),
        summary: {
          totalStudents: outstandingStudents.length,
          totalOutstanding,
          averageOutstanding: outstandingStudents.length > 0 ? totalOutstanding / outstandingStudents.length : 0,
        }
      }

      setReportData(processedData)
    } catch (error) {
      setError("Failed to generate report. Please try again.")
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (session) {
      generateReport()
    }
  }, [session, generateReport])

  const loadAcademicYears = async () => {
    try {
      const response = await fetch("/api/academic-years")
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(data)
      }
    } catch (error) {
      console.error("Error loading academic years:", error)
    }
  }

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
        student.student.mobileNo1,
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
      academicYearId: "",
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
        title="Dhaarussalam Matriculation Higher Secondary School"
      />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select
                  value={filters.academicYearId}
                  onValueChange={(value) => handleFilterChange("academicYearId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NA">All Years</SelectItem>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="NA">All Classes</SelectItem>
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
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalStudents}</p>
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
                      ₹{reportData.summary.totalOutstanding.toLocaleString()}
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
                      ₹{Math.round(reportData.summary.averageOutstanding).toLocaleString()}
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
                              {student.student.mobileNo1}
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
              <div className="flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-4" />
                <p className="text-gray-600">Generating report...</p>
              </div>
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
    </div>
  )
}