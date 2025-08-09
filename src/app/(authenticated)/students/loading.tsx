import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

export default function StudentsLoading() {
  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  disabled
                  placeholder="Search students by name, admission no, or father's name..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              
              <Button disabled className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Student</div>
            <div className="col-span-2">Admission No</div>
            <div className="col-span-2">Father's Name</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Class</div>
            <div className="col-span-1">Status</div>
          </div>
        </div>

        {/* Table Body Skeleton */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
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
                  <Skeleton className="h-4 w-20" />
                </div>
                
                <div className="col-span-2">
                  <Skeleton className="h-4 w-24" />
                </div>
                
                <div className="col-span-2">
                  <Skeleton className="h-4 w-12" />
                </div>
                
                <div className="col-span-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
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