"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Download,
  Search,
  AlertTriangle,
  RefreshCw,
  Users,
  DollarSign
} from "lucide-react"
import LoaderOne from "@/components/ui/loader-one"

interface ReportData {
  students: any[]
  summary: {
    totalStudents: number
    studentsWithOutstanding: number
    totalOutstandingAmount: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface OutstandingFeesSearchProps {
  searchTerm: string
  isSearching: boolean
  onSearchChange: (term: string) => void
  onExportCSV: () => void
  onResetFilters: () => void
  filters: {
    classId: string
    section: string
    minOutstanding: string
    search: string
  }
  onFilterChange: (key: string, value: string) => void
  classes: { id: string; className: string }[]
  reportData: ReportData | null
  loading: boolean
  academicYear: { year: string } | null
  pagination?: PaginationData
  currentPage?: number
  onPageChange?: (page: number) => void
  sortBy?: string
  sortOrder?: string
  onSortChange?: (sortBy: string, sortOrder: string) => void
}

export default function OutstandingFeesSearch({
  searchTerm,
  isSearching,
  onSearchChange,
  onExportCSV,
  onResetFilters,
  filters,
  onFilterChange,
  classes,
  reportData,
  loading,
  academicYear,
  pagination,
  currentPage = 1,
  onPageChange,
  sortBy = "name",
  sortOrder = "asc",
  onSortChange
}: OutstandingFeesSearchProps) {
  return (
    <>
      {/* Header Section with Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Outstanding Fees Report
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {/* Summary Badge - Less Prominent */}
            {reportData && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{reportData.summary.studentsWithOutstanding} students</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>₹{reportData.summary.totalOutstandingAmount.toLocaleString()} total</span>
                </div>
              </div>
            )}

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
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_2fr] gap-4 items-end">
            {/* Search Bar */}
            <div className="relative">
              <Label className="text-sm font-medium text-gray-700">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Student name, admission no..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-20 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
                {searchTerm.length > 0 && searchTerm.length < 3 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300 bg-white">
                      {3 - searchTerm.length} more
                    </Badge>
                  </div>
                )}
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoaderOne />
                  </div>
                )}
              </div>
            </div>

            {/* Class Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Class</Label>
              <Select
                value={filters.classId}
                onValueChange={(value) => onFilterChange("classId", value)}
              >
                <SelectTrigger className="mt-1 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="All Classes" />
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

            {/* Section Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Section</Label>
              <Input
                className="mt-1 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter section"
                value={filters.section}
                onChange={(e) => onFilterChange("section", e.target.value)}
              />
            </div>

            {/* Min Outstanding & Reset */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Min Outstanding (₹)</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type="number"
                  className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Min amount"
                  value={filters.minOutstanding}
                  onChange={(e) => onFilterChange("minOutstanding", e.target.value)}
                />
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

          {/* Sorting and Pagination Controls */}
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
                  <SelectItem value="name">Student Name</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="outstanding">Outstanding Amount</SelectItem>
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

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && onPageChange && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 mr-4">
                  Page {currentPage} of {pagination.pages} ({pagination.total} total)
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
    </>
  )
}