"use client"

import { Button } from "@/components/ui/button"

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface EnrollmentsPaginationProps {
  pagination: PaginationData
  currentPage: number
  onPageChange: (page: number) => void
}

export default function EnrollmentsPagination({ 
  pagination,
  currentPage,
  onPageChange
}: EnrollmentsPaginationProps) {
  if (pagination.pages <= 1) {
    return null
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 shadow-sm">
        <div className="text-sm text-gray-600 font-medium">
          Showing <span className="text-gray-900 font-bold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
          <span className="text-gray-900 font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
          <span className="text-gray-900 font-bold">{pagination.total}</span> enrollments
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
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
                  className={`w-11 h-11 p-0 text-sm font-semibold transition-all ${
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
            className="px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}