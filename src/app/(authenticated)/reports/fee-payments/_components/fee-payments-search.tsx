"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { 
  Download,
  Search,
  Receipt,
  FileText,
  DollarSign
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useDebounce } from "@/hooks/use-debounce"

interface ReportSummary {
  totalPayments: number
  totalAmount: number
  averagePayment: number
}

interface ReportData {
  payments: any[]
  summary: ReportSummary
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface FeePaymentsSearchProps {
  dateRange: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  onExportCSV: () => void
  onResetFilters: () => void
  filters: {
    studentId: string
    receiptNo: string
    paymentMethod: string
  }
  onFilterChange: (key: string, value: string) => void
  reportData: ReportData | null
  loading: boolean
  pagination?: PaginationData
  currentPage?: number
  onPageChange?: (page: number) => void
  sortBy?: string
  sortOrder?: string
  onSortChange?: (sortBy: string, sortOrder: string) => void
  recordsPerPage?: number
  onRecordsPerPageChange?: (limit: number) => void
}

export default function FeePaymentsSearch({
  dateRange,
  onDateChange,
  onExportCSV,
  onResetFilters,
  filters,
  onFilterChange,
  reportData,
  loading,
  pagination,
  currentPage = 1,
  onPageChange,
  sortBy = "paymentDate",
  sortOrder = "desc",
  onSortChange,
  recordsPerPage = 20,
  onRecordsPerPageChange
}: FeePaymentsSearchProps) {
  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = useState(filters.studentId)
  
  // Debounced search value (for API calls)
  const debouncedSearchValue = useDebounce(searchInput, 500)
  
  // Update local state when filters change (from parent)
  useEffect(() => {
    setSearchInput(filters.studentId)
  }, [filters.studentId])
  
  // Trigger filter change when debounced value changes
  useEffect(() => {
    if (debouncedSearchValue !== filters.studentId) {
      onFilterChange("studentId", debouncedSearchValue)
    }
  }, [debouncedSearchValue, filters.studentId, onFilterChange])
  return (
    <>
      {/* Header Section with Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Fee Payments Report
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              disabled={!reportData || loading}
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
          {/* Single Line Layout for MD/LG */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr_1fr] gap-3 items-end">
            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Date Range</Label>
              <div className="mt-1">
                <DateRangePicker
                  date={dateRange}
                  onDateChange={onDateChange}
                  placeholder="Select date range"
                  className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Student Search */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Student</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Name, father name, or admission no..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Receipt Number */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Receipt No</Label>
              <Input
                className="mt-1 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Receipt number"
                value={filters.receiptNo}
                onChange={(e) => onFilterChange("receiptNo", e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) => onFilterChange("paymentMethod", value)}
                >
                  <SelectTrigger className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onResetFilters}
                  className="h-9 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Sorting Controls Row */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Sort Controls */}
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium text-gray-700">Sort by:</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => onSortChange && onSortChange(value, sortOrder)}
              >
                <SelectTrigger className="w-48 h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paymentDate">Payment Date</SelectItem>
                  <SelectItem value="studentName">Student Name</SelectItem>
                  <SelectItem value="totalAmount">Amount</SelectItem>
                  <SelectItem value="receiptNo">Receipt No</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortOrder}
                onValueChange={(value) => onSortChange && onSortChange(sortBy, value)}
              >
                <SelectTrigger className="w-28 h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">A-Z</SelectItem>
                  <SelectItem value="desc">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary and Pagination Row */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Summary Information - Left */}
            <div className="flex items-center space-x-4">
              {reportData && (
                <>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{formatNumber(reportData.summary.totalPayments)} payments</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(reportData.summary.totalAmount)} total</span>
                  </div>
                </>
              )}
            </div>

            {/* Pagination Controls - Right */}
            <div className="flex items-center space-x-4">
              {/* Records per page */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-gray-700">Show:</Label>
                <Select
                  value={recordsPerPage.toString()}
                  onValueChange={(value) => onRecordsPerPageChange && onRecordsPerPageChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && onPageChange && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 mr-4">
                    Page {currentPage} of {pagination.pages}
                  </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 text-xs font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum = i + 1
                    if (pagination.pages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className={`w-7 h-7 p-0 text-xs font-semibold transition-all ${
                          pageNum === currentPage 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="px-3 py-1.5 text-xs font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Next
                </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}