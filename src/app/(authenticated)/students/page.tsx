"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Plus, Search, Users } from "lucide-react"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { StudentStatusBadge } from "@/components/students/student-status-badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Student {
  id: string
  admissionNo: string
  name: string
  gender: string
  age: number
  fatherName: string
  mobileNo1: string
  isActive: boolean
  createdAt: string
  enrollments: Array<{
    class: { className: string }
    academicYear: { year: string }
  }>
}

interface StudentsResponse {
  students: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function StudentsPage() {
  const { academicYear } = useAcademicYear()
  const { navigateTo, goToStudent } = useAcademicYearNavigation()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // Debounce search input with 3-character minimum
  useEffect(() => {
    // Show searching indicator if user is typing and we have enough characters
    if (search.length >= 3) {
      setIsSearching(true)
    }

    const timer = setTimeout(() => {
      // Only search if 3+ characters or empty (to show all)
      if (search.length === 0 || search.length >= 3) {
        setDebouncedSearch(search)
        setPage(1) // Reset to first page when search changes
      }
      setIsSearching(false)
    }, 500) // 500ms debounce delay

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [search])

  const fetchStudents = useCallback(async () => {
    if (!academicYear) return
    
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        academicYear: academicYear.id,
        ...(debouncedSearch && { search: debouncedSearch }),
      })

      // Only add status filter if not including inactive students
      if (!includeInactive) {
        params.append("status", "active")
      }

      const response = await fetch(`/api/students?${params}`)
      if (response.ok) {
        const data: StudentsResponse = await response.json()
        setStudents(data.students)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, academicYear, includeInactive])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSearch = (value: string) => {
    setSearch(value)
    // Page reset is handled in the debounce useEffect
  }

  const handleAddStudent = () => {
    navigateTo("/students/add")
  }



  const handleToggleInactive = (checked: boolean) => {
    setIncludeInactive(checked)
    setPage(1) // Reset to first page when toggle changes
  }

  if (loading && students.length === 0) {
    return (
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Students Management Container - Modern Borderless Design */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {includeInactive ? "All Students" : "Active Students"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    {pagination.total} {pagination.total === 1 ? 'student' : 'students'} found
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                  <Checkbox
                    id="include-inactive"
                    checked={includeInactive}
                    onCheckedChange={(checked) => handleToggleInactive(checked === true)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300"
                  />
                  <Label 
                    htmlFor="include-inactive" 
                    className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                  >
                    Include inactive
                  </Label>
                </div>
                <Button 
                  onClick={handleAddStudent}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="px-8 py-6 bg-white border-b border-gray-100">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by name, admission number, or father&apos;s name..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-20 h-13 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-base bg-gray-50/50 focus:bg-white transition-colors"
                />
                {search.length > 0 && search.length < 3 && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300 bg-white">
                      {3 - search.length} more
                    </Badge>
                  </div>
                )}
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-blue-50/30 px-4 py-2 rounded-lg border border-blue-100">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                <span>Click on any student row to view details and manage their information</span>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-hidden">
            {loading ? (
              <div className="p-8">
                {/* Table Skeleton */}
                <div className="space-y-4">
                  {/* Header Skeleton */}
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20" />
                    ))}
                  </div>
                  {/* Row Skeletons */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-6 border-b border-gray-50">
                      <Skeleton className="h-4 w-16" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200 hover:bg-gray-100">
                      <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                        Admission No
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                        Student Name
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                        Father&apos;s Name
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                        Contact
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                        Details
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                        Enrollment
                      </TableHead>
                      <TableHead className="font-bold text-gray-800 py-5 px-8 text-sm tracking-wide uppercase">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-20 px-8">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                              <Users className="h-10 w-10 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-gray-700 font-semibold text-xl">No students found</p>
                              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                                {search ? "Try adjusting your search criteria or check your filters" : "Add your first student to get started with the management system"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => {
                        const currentEnrollment = student.enrollments.find(
                          e => e.academicYear.year === academicYear?.year
                        )
                        
                        return (
                          <TableRow 
                            key={student.id} 
                            className="hover:bg-blue-50/30 transition-all duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer group"
                            onClick={() => goToStudent(student.id)}
                          >
                            <TableCell className="py-6 px-8">
                              <div className="font-mono text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {student.admissionNo}
                              </div>
                            </TableCell>
                            <TableCell className="py-6 px-8">
                              <div className="font-medium text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                                {student.name}
                              </div>
                            </TableCell>
                            <TableCell className="py-6 px-8">
                              <div className="text-gray-700 text-sm font-medium">
{student.fatherName}
                              </div>
                            </TableCell>
                            <TableCell className="py-6 px-8">
                              <div className="text-sm text-gray-900 font-mono">
                                {student.mobileNo1}
                              </div>
                            </TableCell>
                            <TableCell className="py-6 px-8">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs font-medium ${
                                    student.gender === 'MALE' 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : 'bg-pink-50 text-pink-700 border-pink-200'
                                  }`}
                                >
                                  {student.gender}
                                </Badge>
                                <span className="text-sm text-gray-600 font-medium">Age {student.age}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-6 px-8">
                              <div className="text-sm">
                                {currentEnrollment ? (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-gray-900">
                                      {currentEnrollment.class.className}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {currentEnrollment.academicYear.year}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-sm">Not enrolled</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-6 px-8">
                              <StudentStatusBadge 
                                student={student} 
                                showDeactivationInfo={true}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination - Modern Design */}
        {pagination.pages > 1 && (
          <div className="mt-8">
            <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="text-gray-900 font-bold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                <span className="text-gray-900 font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                <span className="text-gray-900 font-bold">{pagination.total}</span> students
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum = i + 1
                    if (pagination.pages > 5) {
                      if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`w-11 h-11 p-0 text-sm font-semibold transition-all ${
                          pageNum === page 
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
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                  className="px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
    </main>
  )
}