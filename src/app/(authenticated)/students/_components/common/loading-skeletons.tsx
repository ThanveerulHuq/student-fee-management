"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function StudentsListSkeleton() {
  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-36 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="px-8 py-6 bg-white border-b border-gray-100">
          <Skeleton className="h-13 w-full rounded-lg" />
        </div>

        {/* Table Skeleton */}
        <div className="p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-gray-100">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-6 border-b border-gray-50">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export function StudentDetailSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading student details...</p>
      </div>
    </div>
  )
}