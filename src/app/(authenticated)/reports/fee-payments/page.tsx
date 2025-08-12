"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import FeePaymentsSearch from "./_components/fee-payments-search"
import FeePaymentsTable from "./_components/fee-payments-table"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import { StudentsListSkeleton } from "../../students/_components/common/loading-skeletons"

interface PaymentItem {
  feeTemplateName: string
  amount: number
  feeBalance: number
}

export interface Payment {
  id: string
  receiptNo: string
  studentName: string
  studentAdmissionNo: string
  studentFatherName: string
  studentPhone: string
  studentClass: string
  studentSection: string
  academicYear: string
  totalAmount: number
  paymentDate: string
  paymentMethod: string
  remarks: string | null
  createdBy: string
  paymentItems: PaymentItem[]
}

interface ReportSummary {
  totalPayments: number
  totalAmount: number
  averagePayment: number
  paymentMethodBreakdown: Array<{
    method: string
    count: number
    amount: number
  }>
  dailySummary: Array<{
    date: string
    count: number
    amount: number
  }>
  collectorSummary: Array<{
    collector: string
    count: number
    amount: number
  }>
}

interface ReportData {
  payments: Payment[]
  summary: ReportSummary
  filters: {
    startDate: string | null
    endDate: string | null
    studentId: string | null
    receiptNo: string | null
    paymentMethod: string | null
  }
  generatedAt: string
  generatedBy: string
}

interface FeePaymentsPageProps {
  params: Promise<Record<string, never>>
}

export default function FeePaymentsReportPage({}: FeePaymentsPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  
  // Sorting states
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "paymentDate")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")
  
  // Records per page state
  const [recordsPerPage, setRecordsPerPage] = useState(parseInt(searchParams.get("limit") || "20"))
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [filters, setFilters] = useState({
    studentId: searchParams.get("studentId") || "",
    receiptNo: searchParams.get("receiptNo") || "",
    paymentMethod: searchParams.get("paymentMethod") || "ALL",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Initialize date range from URL params
  useEffect(() => {
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    if (startDate || endDate) {
      setDateRange({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      })
    }
  }, [searchParams])

  const generateReport = useCallback(async () => {
    setLoading(true)
    setError("")
    
    try {
      const queryParams = new URLSearchParams()
      
      // Add sortBy, sortOrder and pagination
      queryParams.append("sortBy", sortBy)
      queryParams.append("sortOrder", sortOrder)
      queryParams.append("page", page.toString())
      queryParams.append("limit", recordsPerPage.toString())
      
      // Only add date filters if dateRange is set
      if (dateRange?.from) {
        queryParams.append("startDate", format(dateRange.from, "yyyy-MM-dd"))
      }
      if (dateRange?.to) {
        queryParams.append("endDate", format(dateRange.to, "yyyy-MM-dd"))
      }
      if (filters.studentId && filters.studentId !== "ALL") {
        queryParams.append("studentId", filters.studentId)
      }
      if (filters.receiptNo) {
        queryParams.append("receiptNo", filters.receiptNo)
      }
      if (filters.paymentMethod && filters.paymentMethod !== "ALL") {
        queryParams.append("paymentMethod", filters.paymentMethod)
      }

      const response = await fetch(`/api/reports/fee-payments?${queryParams}`)
      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await response.json()
      setReportData(data)
      
      // Update pagination data if available
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      setError("Failed to generate report. Please try again.")
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, filters, page, sortBy, sortOrder, recordsPerPage])

  useEffect(() => {
    if (session) {
      generateReport()
    }
  }, [session, generateReport])

  // Auto-generate report when date range changes
  useEffect(() => {
    if (session && reportData) {
      generateReport()
    }
  }, [dateRange])

  const exportToCSV = async () => {
    if (!reportData) return

    try {
      const headers = [
        "Receipt No",
        "Student Name",
        "Father Name",
        "Class",
        "Academic Year",
        "Payment Date",
        "Amount (₹)",
        "Payment Method",
        "Collected By",
        "Remarks",
        "Fee Items"
      ]

      const rows = reportData.payments.map(payment => [
        payment.receiptNo,
        payment.studentName,
        payment.studentFatherName,
        payment.studentClass,
        payment.academicYear,
        format(new Date(payment.paymentDate), "dd/MM/yyyy"),
        payment.totalAmount,
        payment.paymentMethod,
        payment.createdBy,
        payment.remarks || "",
        payment.paymentItems.map(item => `${item.feeTemplateName}: ₹${item.amount}`).join("; ")
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fee-payments-${format(new Date(), "yyyy-MM-dd")}.csv`
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
    setPage(1) // Reset to first page when filters change
  }


  const handlePrintReceipt = (payment: Payment) => {
    const receiptUrl = `/receipts/${payment.id}`
    window.open(receiptUrl, '_blank')
  }

  const resetFilters = () => {
    setFilters({
      studentId: "",
      receiptNo: "",
      paymentMethod: "ALL",
    })
    setDateRange(undefined)
    setSortBy("paymentDate")
    setSortOrder("desc")
    setRecordsPerPage(20)
    setPage(1)
  }

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1) // Reset to first page when sorting changes
  }

  const handleRecordsPerPageChange = (newLimit: number) => {
    setRecordsPerPage(newLimit)
    setPage(1) // Reset to first page when records per page changes
    setPagination(prev => ({ ...prev, limit: newLimit }))
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH": return "bg-green-100 text-green-800"
      case "ONLINE": return "bg-blue-100 text-blue-800"
      case "CHEQUE": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && !reportData) {
    return <StudentsListSkeleton />
  }

  if (status === "loading" || !session) {
    return <LoaderWrapper fullScreen label="Loading fee payments report..." />
  }

  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <FeePaymentsSearch
          dateRange={dateRange}
          onDateChange={setDateRange}
          onExportCSV={exportToCSV}
          onResetFilters={resetFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          reportData={reportData}
          loading={loading}
          pagination={pagination}
          currentPage={page}
          onPageChange={setPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          recordsPerPage={recordsPerPage}
          onRecordsPerPageChange={handleRecordsPerPageChange}
        />

        {/* Error */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}


        <FeePaymentsTable
          payments={reportData?.payments || []}
          loading={loading}
          onPrintReceipt={handlePrintReceipt}
        />
      </div>
    </main>
  )
} 