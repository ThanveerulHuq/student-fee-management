"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import SecondaryHeader from "@/components/ui/secondary-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/ui/date-range-picker"
// import StudentSelector from "@/components/ui/student-selector"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import { 
  Download,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  FileText,
  Calendar,
  CreditCard,
  User,
  Receipt,
  TrendingUp,
  BarChart3,
  Printer,
  ExternalLink
} from "lucide-react"
import WhatsAppShare from "@/components/ui/whatsapp-share"

interface PaymentItem {
  feeTemplateName: string
  amount: number
  feeBalance: number
}

interface Payment {
  id: string
  receiptNo: string
  studentName: string
  studentAdmissionNo: string
  studentPhone: string
  studentClass: string
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
    } else {
      // Default to current month
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setDateRange({
        from: monthStart,
        to: monthEnd,
      })
    }
  }, [searchParams])

  const generateReport = useCallback(async () => {
    setLoading(true)
    setError("")
    
    try {
      const queryParams = new URLSearchParams()
      
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
    } catch (error) {
      setError("Failed to generate report. Please try again.")
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, filters])

  useEffect(() => {
    if (session && dateRange) {
      generateReport()
    }
  }, [session, generateReport, dateRange])

  const exportToCSV = async () => {
    if (!reportData) return

    try {
      const headers = [
        "Receipt No",
        "Student Name",
        "Admission No",
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
        payment.studentAdmissionNo,
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
  }


  const handlePrintReceipt = (payment: Payment) => {
    const receiptUrl = `/fees/receipt/${payment.id}`
    window.open(receiptUrl, '_blank')
  }

  const resetFilters = () => {
    setFilters({
      studentId: "",
      receiptNo: "",
      paymentMethod: "ALL",
    })
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    })
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH": return "bg-green-100 text-green-800"
      case "ONLINE": return "bg-blue-100 text-blue-800"
      case "CHEQUE": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading" || !session) {
    return <LoaderWrapper fullScreen label="Loading fee payments report..." />
  }

  return (
    <>
      <SecondaryHeader 
        title="Fee Payments Report"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Date Range</Label>
                <DateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                  placeholder="Select date range"
                />
              </div>

              <div>
                <Label htmlFor="studentId">Student</Label>
                <Input
                  id="studentId"
                  placeholder="Enter student name or admission number"
                  value={filters.studentId}
                  onChange={(e) => handleFilterChange("studentId", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="receiptNo">Receipt Number</Label>
                <Input
                  id="receiptNo"
                  placeholder="Enter receipt number"
                  value={filters.receiptNo}
                  onChange={(e) => handleFilterChange("receiptNo", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) => handleFilterChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Receipt className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Payments</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.totalPayments.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Amount Collected</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{reportData.summary.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Payment</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{Math.round(reportData.summary.averagePayment).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Breakdown */}
            {reportData.summary.paymentMethodBreakdown.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Payment Method Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportData.summary.paymentMethodBreakdown.map((breakdown) => (
                      <div key={breakdown.method} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getPaymentMethodColor(breakdown.method)}>
                            {breakdown.method}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {breakdown.count} payments
                          </span>
                        </div>
                        <p className="text-lg font-semibold">
                          ₹{breakdown.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Payment Details ({reportData.payments.length} payments)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipt & Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class & Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount & Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.receiptNo}
                              </p>
                              <p className="text-sm text-gray-900">{payment.studentName}</p>
                              <p className="text-sm text-gray-500">
                                Adm: {payment.studentAdmissionNo}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.studentClass} 
                              </p>
                              <p className="text-sm text-gray-500">
                                {payment.academicYear}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm text-gray-900">
                                {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                              </p>
                              <p className="text-sm text-gray-500">
                                by {payment.createdBy}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-lg font-bold text-green-600">
                                ₹{payment.totalAmount.toLocaleString()}
                              </p>
                              <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                                {payment.paymentMethod}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              {payment.paymentItems.map((item, index) => (
                                <div key={index} className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">{item.feeTemplateName}:</span> ₹{item.amount.toLocaleString()}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <WhatsAppShare
                                receiptId={payment.id}
                                receiptNo={payment.receiptNo}
                                studentName={payment.studentName}
                                totalAmount={payment.totalAmount}
                                paymentDate={payment.paymentDate}
                                phoneNumber={payment.studentPhone}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintReceipt(payment)}
                                className="flex items-center"
                                title="Print Receipt"
                              >
                                <Printer className="h-3 w-3 mr-1" />
                                Print
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
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
        {reportData && reportData.payments.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
                <p className="text-gray-600">
                  No payments match the current filters. Try adjusting your search criteria.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
} 