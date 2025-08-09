import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter } from "lucide-react"

export default function EnrollmentsLoading() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Button disabled className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Enrollment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                disabled
                placeholder="Search students..."
                className="pl-10"
              />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Button disabled variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Enrollments</CardTitle>
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div className="col-span-3">Student</div>
            <div className="col-span-2">Admission No</div>
            <div className="col-span-2">Class</div>
            <div className="col-span-2">Academic Year</div>
            <div className="col-span-2">Total Fees</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Body Skeleton */}
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 py-4 items-center animate-pulse">
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                
                <div className="col-span-2">
                  <Skeleton className="h-4 w-12" />
                </div>
                
                <div className="col-span-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                
                <div className="col-span-2">
                  <Skeleton className="h-4 w-20" />
                </div>
                
                <div className="col-span-1">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </main>
  )
}