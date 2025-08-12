"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAcademicYear } from "@/contexts/academic-year-context"
import { trackReportGenerated, trackOutstandingFeesViewed, trackPageView } from "@/lib/analytics"

interface OutstandingFeesPageProps {
  params: Promise<Record<string, never>>
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Download,
  Search,
  AlertTriangle,
  FileText,
  RefreshCw,
  Users,
  DollarSign,
  Phone,
  MessageCircle
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
  fees: Array<{
    name: string
    amount: number
    paid: number
    outstandingAmount: number
  }>
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
    classId: searchParams.get("classId") || "-1",
    section: searchParams.get("section") || "",
    minOutstanding: searchParams.get("minOutstanding") || "1",
    search: searchParams.get("search") || "",
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
      const classId = filters.classId === "-1" ? "" : filters.classId
      if (academicYear?.id) queryParams.append("academicYearId", academicYear.id)
      if (classId) queryParams.append("classId", classId)
      if (filters.section) queryParams.append("section", filters.section)
      if (filters.minOutstanding) queryParams.append("minOutstanding", filters.minOutstanding)
      // Search parameter
      if (filters.search) queryParams.append("search", filters.search)

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
        fees: student.fees.filter((fee: any) => fee.outstanding > 0).map((fee: any) => ({
          name: fee.templateName,
          amount: fee.amount,
          paid: fee.paid,
          outstandingAmount: fee.outstanding
        })),
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
      classId: "-1",
      section: "",
      minOutstanding: "1",
      search: "",
    })
  }

  const sendWhatsAppReminder = (student: OutstandingStudent) => {
    const message = `Dear ${student.student.fatherName},\n\nThis is a fee reminder for ${student.student.name} for academic year ${student.academicYear.year}.\n\nOutstanding Amount: ₹${student.outstanding.toLocaleString()}\n\nFee Details:\n${student.fees.filter(fee => fee.outstandingAmount > 0).map(fee => `• ${fee.name}: ₹${fee.outstandingAmount.toLocaleString()}`).join('\n')}\n\nPlease pay at your earliest convenience.\n\nThank you,\nBlueMoon School`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${student.student.mobileNo.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }



  if (status === "loading" || !session) {
    return <LoaderWrapper fullScreen label="Loading outstanding fees report..." />
  }

  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header with Filters and Actions */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            {/* Title and Export */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Outstanding Fees Report</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {academicYear ? `Academic Year: ${academicYear.year}` : 'Loading...'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={!reportData || loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name, admission number, father name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Class</Label>
                  <Select
                    value={filters.classId}
                    onValueChange={(value) => handleFilterChange("classId", value)}
                  >
                    <SelectTrigger className="mt-1 h-9">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Section</Label>
                  <Input
                    className="mt-1 h-9"
                    placeholder="Enter section"
                    value={filters.section}
                    onChange={(e) => handleFilterChange("section", e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Min Total Outstanding (₹)</Label>
                  <Input
                    type="number"
                    className="mt-1 h-9"
                    placeholder="Min amount"
                    value={filters.minOutstanding}
                    onChange={(e) => handleFilterChange("minOutstanding", e.target.value)}
                  />
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset All
                </Button>
                <Button onClick={generateReport} disabled={loading} size="sm">
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search & Generate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        {reportData && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-red-50 rounded-lg">
                <Users className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students with Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.studentsWithOutstanding}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-red-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{reportData.summary.totalOutstandingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outstanding Students Table */}
        {reportData && reportData.students.length > 0 && (
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
                    Fee Balance Breakdown
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.students.map((student) => {
                  return (
                    <tr 
                      key={student.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/enrollments/${student.id}`)}
                      title="Click to view complete fee details"
                    >
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
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          {student.fees && student.fees.length > 0 ? (
                            student.fees
                              .filter((fee: any) => fee.outstandingAmount > 0)
                              .map((fee: any, index: number) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-gray-700">{fee.name}:</span>
                                  <span className="text-red-600 font-medium">₹{fee.outstandingAmount.toLocaleString()}</span>
                                </div>
                              ))
                          ) : (
                            <div className="flex justify-between">
                              <span className="text-gray-700">Outstanding:</span>
                              <span className="text-red-600 font-medium">₹{student.outstanding.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-lg font-bold text-red-600">
                          ₹{student.outstanding.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `tel:${student.student.mobileNo}`
                          }}
                          className="h-auto p-2 hover:bg-blue-50 text-left justify-start"
                          title="Call this number"
                        >
                          <Phone className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="text-sm text-gray-700">{student.student.mobileNo}</span>
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendWhatsAppReminder(student)
                          }}
                          className="hover:bg-green-50 hover:border-green-300 text-green-700"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Send Reminder
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="px-6 py-12">
            <LoaderWrapper center label="Generating report..." />
          </div>
        )}

        {/* No Data */}
        {reportData && reportData.students.length === 0 && !loading && (
          <div className="px-6 py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Outstanding Fees Found</h3>
              <p className="text-gray-600">All students have paid their fees or no students match the current filters.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}