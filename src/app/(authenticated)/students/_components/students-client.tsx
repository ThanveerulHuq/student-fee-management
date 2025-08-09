"use client"

import { useEffect, useState, useCallback } from "react"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import StudentsSearch from "./lists/students-search"
import StudentsTable from "./lists/students-table"
import StudentsPagination from "./lists/students-pagination"
import { StudentsListSkeleton } from "./common/loading-skeletons"
import { trackSearch, trackPageView } from "@/lib/analytics"
import type { StudentsResponse, StudentWithMobile } from "@/lib/data/students"

interface StudentsClientProps {
  initialStudents: StudentWithMobile[]
  initialPagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  initialSearch?: string
  initialStatus?: string
}

export function StudentsClient({ 
  initialStudents, 
  initialPagination, 
  initialSearch = '',
  initialStatus = 'active'
}: StudentsClientProps) {
  const { academicYear } = useAcademicYear()
  const { navigateTo, goToStudent } = useAcademicYearNavigation()
  const [students, setStudents] = useState<StudentWithMobile[]>(initialStudents)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [isSearching, setIsSearching] = useState(false)
  const [page, setPage] = useState(initialPagination.page)
  const [includeInactive, setIncludeInactive] = useState(initialStatus !== 'active')
  const [pagination, setPagination] = useState(initialPagination)

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
    // Only fetch if the search or filters have changed from initial state
    if (debouncedSearch !== initialSearch || 
        page !== initialPagination.page ||
        includeInactive !== (initialStatus !== 'active')) {
      fetchStudents()
    }
  }, [fetchStudents, initialSearch, initialPagination.page, initialStatus])

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
        />
        
        <StudentsTable
          students={students}
          loading={loading}
          onStudentClick={goToStudent}
          academicYear={academicYear ?? undefined}
        />
      </div>

      <StudentsPagination
        pagination={pagination}
        currentPage={page}
        onPageChange={setPage}
      />
    </main>
  )
}