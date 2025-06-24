"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Download,
  Search,
  Filter,
  DollarSign,
  FileText,
  RefreshCw,
  Calendar,
  TrendingUp
} from "lucide-react"

interface Transaction {
  id: string
  receiptNo: string
  paymentDate: string
  totalAmountPaid: number
  paymentMethod: string
  schoolFee: number
  bookFee: number
  uniformFee: number
  islamicStudies: number
  vanFee: number
  createdBy: string
  remarks: string
  studentYear: {
    student: {
      name: string
      admissionNo: string
    }
    academicYear: {
      year: string
    }
    class: {
      className: string
    }
  }
}

interface ReportData {
  transactions: Transaction[]
  summary: {
    totalTransactions: number
    totalAmount: number
    avgTransaction: number
    dateRange: {
      from: string
      to: string
    }
    feeBreakdown: {
      schoolFee: number
      bookFee: number
      uniformFee: number
      islamicStudies: number
      vanFee: number
    }
    paymentMethodSummary: Record<string, { count: number; amount: number }>
    collectorSummary: Record<string, { count: number; amount: number }>
  }
}

export default function FeeCollectionsReportPage() {
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
    academicYearId: searchParams.get("academicYearId") || "NA",
    classId: searchParams.get("classId") || "NA",
    paymentDateFrom: searchParams.get("from") || new Date().toISOString().split('T')[0],
    paymentDateTo: searchParams.get("to") || new Date().toISOString().split('T')[0],
    paymentMethod: searchParams.get("paymentMethod") || "NA",
    createdBy: searchParams.get("createdBy") || "",
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
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "NA") queryParams.append(key, value)
      })

      const response = await fetch(`/api/reports/fee-collection?${queryParams}`)
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
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "NA") queryParams.append(key, value)
      })
      queryParams.append("format", "csv")

      const response = await fetch(`/api/reports/fee-collection?${queryParams}`)
      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fee-collections-${new Date().toISOString().split('T')[0]}.csv`
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
    const today = new Date().toISOString().split('T')[0]
    setFilters({
      academicYearId: "NA",
      classId: "NA",
      paymentDateFrom: today,
      paymentDateTo: today,
      paymentMethod: "NA",
      createdBy: "",
    })
  }

  const setDateRange = (range: 'today' | 'week' | 'month') => {
    const now = new Date()
    let from = new Date()
    let to = new Date()

    switch (range) {
      case 'today':
        from = new Date()
        to = new Date()
        break
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        to = new Date()
        break
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
    }

    setFilters(prev => ({
      ...prev,
      paymentDateFrom: from.toISOString().split('T')[0],
      paymentDateTo: to.toISOString().split('T')[0],
    }))
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/reports")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Fee Collection Report
              </h1>
            </div>
            <div className="flex items-center space-x-2">
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
          </div>
        </div>
      </header>

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
            {/* Quick Date Range */}
            <div className="mb-4">
              <Label>Quick Date Range</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange('today')}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange('week')}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange('month')}
                >
                  This Month
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fromDate">From Date *</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={filters.paymentDateFrom}
                  onChange={(e) => handleFilterChange("paymentDateFrom", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="toDate">To Date *</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={filters.paymentDateTo}
                  onChange={(e) => handleFilterChange("paymentDateTo", e.target.value)}
                  required
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
                    <SelectItem value="NA">All Methods</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="createdBy">Collector</Label>
                <Input
                  id="createdBy"
                  placeholder="Enter collector username"
                  value={filters.createdBy}
                  onChange={(e) => handleFilterChange("createdBy", e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Collection</p>
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
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Transaction</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{Math.round(reportData.summary.avgTransaction).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Date Range</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(reportData.summary.dateRange.from).toLocaleDateString()} - {new Date(reportData.summary.dateRange.to).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fee Breakdown and Payment Methods */}
        {reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>School Fee:</span>
                    <span className="font-semibold">₹{reportData.summary.feeBreakdown.schoolFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Book Fee:</span>
                    <span className="font-semibold">₹{reportData.summary.feeBreakdown.bookFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uniform Fee:</span>
                    <span className="font-semibold">₹{reportData.summary.feeBreakdown.uniformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Islamic Studies:</span>
                    <span className="font-semibold">₹{reportData.summary.feeBreakdown.islamicStudies.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Van Fee:</span>
                    <span className="font-semibold">₹{reportData.summary.feeBreakdown.vanFee.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reportData.summary.paymentMethodSummary).map(([method, data]) => (
                    <div key={method} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{method}</span>
                        <span className="text-sm text-gray-500 ml-2">({data.count} transactions)</span>
                      </div>
                      <span className="font-semibold">₹{data.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collector Summary */}
        {reportData && Object.keys(reportData.summary.collectorSummary).length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Collection by Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(reportData.summary.collectorSummary).map(([collector, data]) => (
                  <div key={collector} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{collector}</p>
                        <p className="text-sm text-gray-500">{data.count} transactions</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">₹{data.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Transaction Details ({reportData.transactions.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt & Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount & Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee Breakdown
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collector
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.receiptNo}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.paymentDate).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.studentYear.student.name}</p>
                            <p className="text-sm text-gray-500">{transaction.studentYear.student.admissionNo}</p>
                            <p className="text-sm text-gray-500">
                              {transaction.studentYear.class.className} - {transaction.studentYear.academicYear.year}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              ₹{transaction.totalAmountPaid.toLocaleString()}
                            </p>
                            <Badge 
                              variant={
                                transaction.paymentMethod === "CASH" ? "default" :
                                transaction.paymentMethod === "ONLINE" ? "secondary" : "outline"
                              }
                            >
                              {transaction.paymentMethod}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {transaction.schoolFee > 0 && <span>School: ₹{transaction.schoolFee}</span>}
                            {transaction.bookFee > 0 && <span>Book: ₹{transaction.bookFee}</span>}
                            {transaction.uniformFee > 0 && <span>Uniform: ₹{transaction.uniformFee}</span>}
                            {transaction.islamicStudies > 0 && <span>Islamic: ₹{transaction.islamicStudies}</span>}
                            {transaction.vanFee > 0 && <span>Van: ₹{transaction.vanFee}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.createdBy}
                        </td>
                      </tr>
                    ))}
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
        {reportData && reportData.transactions.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                <p className="text-gray-600">No fee collections found for the selected date range and filters.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}