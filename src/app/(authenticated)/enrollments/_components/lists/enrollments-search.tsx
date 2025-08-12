"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Plus, Search, GraduationCap } from "lucide-react"
import LoaderOne from "@/components/ui/loader-one"

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface EnrollmentsSearchProps {
  searchTerm: string
  isSearching: boolean
  onSearchChange: (term: string) => void
  includeInactive: boolean
  onIncludeInactiveChange: (value: boolean) => void
  onAddEnrollment: () => void
  totalEnrollments: number
  pagination?: PaginationData
  currentPage?: number
  onPageChange?: (page: number) => void
}

export default function EnrollmentsSearch({ 
  searchTerm,
  isSearching,
  onSearchChange,
  includeInactive,
  onIncludeInactiveChange,
  onAddEnrollment,
  totalEnrollments,
  pagination,
  currentPage = 1,
  onPageChange
}: EnrollmentsSearchProps) {
  return (
    <>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {includeInactive ? "All Enrollments" : "Active Enrollments"}
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                {totalEnrollments} {totalEnrollments === 1 ? 'enrollment' : 'enrollments'}
                {pagination && pagination.total > 0 && (
                  <span className="text-gray-400 mx-2">•</span>
                )}
                {pagination && pagination.total > 0 && (
                  <span className="text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
              <Checkbox
                id="include-inactive"
                checked={includeInactive}
                onCheckedChange={(checked) => onIncludeInactiveChange(checked === true)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300"
              />
              <Label 
                htmlFor="include-inactive" 
                className="text-xs font-medium text-gray-700 cursor-pointer select-none"
              >
                Include inactive
              </Label>
            </div>
            <Button 
              onClick={onAddEnrollment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Enrollment
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students by name, admission number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-11 pr-20 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-gray-50/50 focus:bg-white transition-colors"
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
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && onPageChange && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
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
                      className={`w-8 h-8 p-0 text-xs font-semibold transition-all ${
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
                className="px-3 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}