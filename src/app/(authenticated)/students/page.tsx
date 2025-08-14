"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAcademicYear } from "@/contexts/academic-year-context"
import StudentsSearch from "./_components/lists/students-search"
import StudentsTable from "./_components/lists/students-table"
import { StudentsListSkeleton } from "./_components/common/loading-skeletons"
import { trackSearch, trackPageView } from "@/lib/analytics"
import { MobileNumber } from "@/generated/prisma"
  
interface Student {
  id: string
  admissionNo: string
  name: string
  gender: string
  dateOfBirth: string | Date
  fatherName: string
  mobileNumbers: MobileNumber[]
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
  const router = useRouter()
  const { academicYear } = useAcademicYear()
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

  // Track page view
  useEffect(() => {
    trackPageView('Students', 'students')
  }, [])

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
        
        // Track search if there's a search term
        if (debouncedSearch) {
          trackSearch('students')
        }
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
    router.push("/students/add")
  }



  const handleToggleInactive = (checked: boolean) => {
    setIncludeInactive(checked)
    setPage(1) // Reset to first page when toggle changes
  }

  if (loading && students.length === 0) {
    return <StudentsListSkeleton />
  }

  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <StudentsSearch
          searchTerm={search}
          includeInactive={includeInactive}
          isSearching={isSearching}
          onSearchChange={handleSearch}
          onIncludeInactiveChange={handleToggleInactive}
          onAddStudent={handleAddStudent}
          totalStudents={pagination.total}
          pagination={pagination}
          currentPage={page}
          onPageChange={setPage}
        />
        
        <StudentsTable
          students={students}
          loading={loading}
          onStudentClick={(id) => router.push(`/students/${id}`)}
          academicYear={academicYear ?? undefined}
        />
      </div>

    </main>
  )
}