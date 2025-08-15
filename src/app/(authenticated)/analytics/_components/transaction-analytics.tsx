"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DateRangePickerAdvanced } from "@/components/ui/date-range-picker/date-range-picker-advanced"
import { BarChart, Table, Calendar, TrendingUp, DollarSign, CreditCard, BarChart3, Download } from "lucide-react"
import { useAcademicYear } from "@/contexts/academic-year-context"
import { formatCurrency, formatNumber } from "@/lib/format"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

interface TransactionData {
  period: string
  formattedPeriod: string
  totalAmount: number
  paymentCount: number
  methods: { [key: string]: number }
  feeTypes: { [key: string]: number }
}

interface TransactionSummary {
  totalAmount: number
  totalPayments: number
  averagePerPeriod: number
  periodCount: number
  groupBy: string
}

interface TransactionAnalyticsData {
  data: TransactionData[]
  summary: TransactionSummary
}

type ViewMode = "chart" | "table"
type GroupBy = "day" | "week" | "month"

export default function TransactionAnalytics() {
  const { academicYear } = useAcademicYear()
  const [data, setData] = useState<TransactionAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("chart")
  const [groupBy, setGroupBy] = useState<GroupBy>("month")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("ALL")
  const [academicYears, setAcademicYears] = useState<Array<{id: string, year: string}>>([])
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(true)

  // Load academic years
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const response = await fetch('/api/academic-years')
        if (response.ok) {
          const data = await response.json()
          setAcademicYears(data || [])
        }
      } catch (error) {
        console.error('Error loading academic years:', error)
      } finally {
        setLoadingAcademicYears(false)
      }
    }

    loadAcademicYears()
  }, [])

  // Set default academic year when academic years load
  useEffect(() => {
    if (academicYear?.id && selectedAcademicYear === "ALL") {
      setSelectedAcademicYear(academicYear.id)
    }
  }, [academicYear?.id, selectedAcademicYear])

  useEffect(() => {
    const effectiveAcademicYear = selectedAcademicYear === "ALL" ? academicYear?.id : selectedAcademicYear
    if (!effectiveAcademicYear) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
        const queryParams = new URLSearchParams()
        queryParams.append("academicYear", effectiveAcademicYear)
        queryParams.append("groupBy", groupBy)
        
        if (dateRange?.from) {
          queryParams.append("startDate", format(dateRange.from, "yyyy-MM-dd"))
        }
        if (dateRange?.to) {
          queryParams.append("endDate", format(dateRange.to, "yyyy-MM-dd"))
        }
        
        const response = await fetch(`/api/analytics/transactions?${queryParams}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("Failed to fetch transaction analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedAcademicYear, academicYear?.id, groupBy, dateRange])


  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      CASH: "#10b981",
      ONLINE: "#3b82f6", 
      CHEQUE: "#f59e0b"
    }
    return colors[method] || "#6b7280"
  }

  const resetFilters = () => {
    setDateRange(undefined)
    setGroupBy("month")
    setViewMode("chart")
    setSelectedAcademicYear("ALL")
  }

  const exportToCSV = async () => {
    if (!data) return

    try {
      const headers = [
        "Period",
        "Total Amount (₹)",
        "Payment Count", 
        "Average Amount (₹)",
        "Top Payment Methods"
      ]

      const rows = data.data.map(row => [
        row.formattedPeriod,
        row.totalAmount,
        row.paymentCount,
        (row.totalAmount / row.paymentCount).toFixed(2),
        Object.entries(row.methods)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([method, count]) => `${method}: ${count}`)
          .join("; ")
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `transaction-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  if (loading) {
    return (
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="px-6 py-4 bg-white border-b border-gray-100">
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Transaction Analytics
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">No transaction data found for the selected period.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header Section with Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Transaction Analytics
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={!data || loading}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-end">
              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Date Range</Label>
                <div className="mt-1">
                  <DateRangePickerAdvanced
                    date={dateRange}
                    onDateChange={setDateRange}
                    placeholder="Select date range"
                    className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-gray-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Academic Year */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Academic Year</Label>
                <div className="mt-1">
                  <Select
                    value={selectedAcademicYear}
                    onValueChange={setSelectedAcademicYear}
                    disabled={loadingAcademicYears}
                  >
                    <SelectTrigger className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder={loadingAcademicYears ? "Loading..." : "All Academic Years"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Academic Years</SelectItem>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Group By */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Group By</Label>
                <div className="mt-1">
                  <Select value={groupBy} onValueChange={(value: GroupBy) => setGroupBy(value)}>
                    <SelectTrigger className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* View Mode */}
              <div>
                <Label className="text-sm font-medium text-gray-700">View</Label>
                <div className="flex rounded-lg border border-gray-200 mt-1 overflow-hidden">
                  <Button
                    variant={viewMode === "chart" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("chart")}
                    className="rounded-none border-0 h-9 px-3"
                  >
                    <BarChart className="w-4 h-4 mr-1" />
                    Chart
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="rounded-none border-0 h-9 px-3"
                  >
                    <Table className="w-2 h-4 mr-1" />
                    Table
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.summary.totalAmount)}
                </div>
                <p className="text-sm text-gray-600">
                  {data.summary.periodCount} {groupBy}s
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.summary.totalPayments)}
                </div>
                <p className="text-sm text-gray-600">
                  transactions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chart/Table View */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Collections by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</CardTitle>
              <CardDescription>
                Transaction amounts and counts over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === "chart" ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[...data.data].reverse()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="formattedPeriod"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis yAxisId="amount" orientation="left" />
                      <YAxis yAxisId="count" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === "totalAmount" ? formatCurrency(Number(value)) : value,
                          name === "totalAmount" ? "Amount" : "Payments"
                        ]}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="amount"
                        dataKey="totalAmount" 
                        fill="#3b82f6" 
                        name="Amount"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="count"
                        dataKey="paymentCount" 
                        fill="#10b981" 
                        name="Count"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Payments</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Top Methods</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{row.formattedPeriod}</td>
                          <td className="text-right py-3 px-4 font-mono">
                            {formatCurrency(row.totalAmount)}
                          </td>
                          <td className="text-right py-3 px-4">{row.paymentCount}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {Object.entries(row.methods)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3)
                                .map(([method, count]) => (
                                  <span
                                    key={method}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: getMethodColor(method) + "20",
                                      color: getMethodColor(method)
                                    }}
                                  >
                                    {method}: {count}
                                  </span>
                                ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}