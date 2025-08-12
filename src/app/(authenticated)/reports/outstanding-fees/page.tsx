"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAcademicYear } from "@/contexts/academic-year-context"
import { trackReportGenerated, trackOutstandingFeesViewed, trackPageView } from "@/lib/analytics"
import OutstandingFeesSearch from "./_components/outstanding-fees-search"
import OutstandingFeesTable from "./_components/outstanding-fees-table"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import { formatCurrency } from "@/lib/format"
import { StudentsListSkeleton } from "../../students/_components/common/loading-skeletons"
import { createFeeReminderMessage, openWhatsApp } from "@/lib/utils/whatsapp"

interface OutstandingFeesPageProps {
  params: Promise<Record<string, never>>
}

export interface OutstandingStudent {
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
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  
  // Filter states
  const [classes, setClasses] = useState<{ id: string; className: string }[]>([])
  const [filters, setFilters] = useState({
    classId: searchParams.get("classId") || "-1",
    section: searchParams.get("section") || "",
    minOutstanding: searchParams.get("minOutstanding") || "1",
    search: searchParams.get("search") || "",
  })
  
  // Sorting states
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "name")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "asc")

  // Debounce search input with 3-character minimum
  useEffect(() => {
    if (search.length >= 3) {
      setIsSearching(true)
    }

    const timer = setTimeout(() => {
      if (search.length === 0 || search.length >= 3) {
        setDebouncedSearch(search)
        setFilters(prev => ({ ...prev, search: search }))
        setPage(1) // Reset to first page when search changes
      }
      setIsSearching(false)
    }, 500)

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [search])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    loadClasses()
    trackPageView('Outstanding Fees Report', 'reports')
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const generateReport = useCallback(async () => {
    setLoading(true)
    setError("")
    
    try {
      // Use the outstanding fees API with filtering and pagination
      const queryParams = new URLSearchParams()
      const classId = filters.classId === "-1" ? "" : filters.classId
      if (academicYear?.id) queryParams.append("academicYearId", academicYear.id)
      if (classId) queryParams.append("classId", classId)
      if (filters.section) queryParams.append("section", filters.section)
      if (filters.minOutstanding) queryParams.append("minOutstanding", filters.minOutstanding)
      if (filters.search) queryParams.append("search", filters.search)
      queryParams.append("page", page.toString())
      queryParams.append("limit", "10")
      queryParams.append("sortBy", sortBy)
      queryParams.append("sortOrder", sortOrder)

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
      
      // Update pagination data if available
      if (data.pagination) {
        setPagination(data.pagination)
      }
      
      // Track report generation and outstanding fees viewed
      trackReportGenerated('outstanding_fees')
      trackOutstandingFeesViewed()
    } catch (error) {
      setError("Failed to generate report. Please try again.")
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }, [filters, academicYear, page, sortBy, sortOrder])

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
    setSortBy("name")
    setSortOrder("asc")
    setPage(1)
  }

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1) // Reset to first page when sorting changes
  }

  const sendWhatsAppReminder = (student: OutstandingStudent) => {
    const message = createFeeReminderMessage({
      studentName: student.student.name,
      fatherName: student.student.fatherName,
      academicYear: student.academicYear.year,
      outstandingAmount: student.outstanding,
      feeDetails: student.fees.filter(fee => fee.outstandingAmount > 0).map(fee => ({
        name: fee.name,
        outstandingAmount: fee.outstandingAmount
      }))
    })
    
    openWhatsApp(message, student.student.mobileNo)
  }



  if (loading && !reportData) {
    return <StudentsListSkeleton />
  }

  if (status === "loading" || !session) {
    return <LoaderWrapper fullScreen label="Loading outstanding fees report..." />
  }

  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <OutstandingFeesSearch
          searchTerm={search}
          isSearching={isSearching}
          onSearchChange={handleSearch}
          onExportCSV={exportToCSV}
          onResetFilters={resetFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          classes={classes}
          reportData={reportData}
          loading={loading}
          academicYear={academicYear}
          pagination={pagination}
          currentPage={page}
          onPageChange={setPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {/* Error */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <OutstandingFeesTable
          students={reportData?.students || []}
          loading={loading}
          onStudentClick={(studentId) => router.push(`/enrollments/${studentId}`)}
          onSendWhatsAppReminder={sendWhatsAppReminder}
        />
      </div>
    </main>
  )
}