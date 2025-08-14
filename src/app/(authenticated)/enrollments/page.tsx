'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAcademicYear } from '@/contexts/academic-year-context'
import { DeleteEnrollmentDialog } from './_components/delete-enrollment-dialog'
import { ReactivateStudentDialog } from './_components/reactivate-student-dialog'
import { StudentEnrollmentWithTotals } from '@/types/enrollment'
import EnrollmentsSearch from './_components/lists/enrollments-search'
import EnrollmentsTable from './_components/lists/enrollments-table'
import { StudentsListSkeleton } from '../students/_components/common/loading-skeletons'

interface EnrollmentsResponse {
  enrollments: StudentEnrollmentWithTotals[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function EnrollmentsPage() {
  const router = useRouter()
  const { academicYear } = useAcademicYear()
  const [enrollments, setEnrollments] = useState<StudentEnrollmentWithTotals[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<StudentEnrollmentWithTotals | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [enrollmentToReactivate, setEnrollmentToReactivate] = useState<StudentEnrollmentWithTotals | null>(null)
  const [reactivating, setReactivating] = useState(false)
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

  const fetchEnrollments = useCallback(async () => {
    if (!academicYear) return
    
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        academicYearId: academicYear.id,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(includeInactive && { includeInactive: 'true' }),
      })

      console.log({
        page: page.toString(),
        limit: "10",
        academicYearId: academicYear.id,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(includeInactive && { includeInactive: 'true' }),
      })

      const response = await fetch(`/api/enrollments?${params}`)
      if (response.ok) {
        const data: EnrollmentsResponse = await response.json()
        setEnrollments(data.enrollments)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch enrollments')
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
      toast.error('Error fetching enrollments')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, includeInactive, academicYear])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleToggleInactive = (checked: boolean) => {
    setIncludeInactive(checked)
    setPage(1) // Reset to first page when filter changes
  }

  const handleAddEnrollment = () => {
    router.push('/enrollments/enroll')
  }

  const handleEdit = (enrollment: StudentEnrollmentWithTotals) => {
    router.push(`/enrollments/edit/${enrollment.id}`)
  }

  const handleDelete = (enrollment: StudentEnrollmentWithTotals) => {
    setEnrollmentToDelete(enrollment)
    setDeleteDialogOpen(true)
  }

  const handleReactivate = (enrollment: StudentEnrollmentWithTotals) => {
    setEnrollmentToReactivate(enrollment)
    setReactivateDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!enrollmentToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/enrollments/${enrollmentToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Enrollment deleted successfully')
        setDeleteDialogOpen(false)
        setEnrollmentToDelete(null)
        fetchEnrollments()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete enrollment')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting enrollment')
    } finally {
      setDeleting(false)
    }
  }

  const handleConfirmReactivate = async () => {
    if (!enrollmentToReactivate) return

    setReactivating(true)
    try {
      const response = await fetch(`/api/enrollments/${enrollmentToReactivate.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Enrollment reactivated successfully')
        setReactivateDialogOpen(false)
        setEnrollmentToReactivate(null)
        fetchEnrollments()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to reactivate enrollment')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error reactivating enrollment')
    } finally {
      setReactivating(false)
    }
  }

  if (loading && enrollments.length === 0) {
    return <StudentsListSkeleton />
  }

  return (
    <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <EnrollmentsSearch
          searchTerm={search}
          isSearching={isSearching}
          onSearchChange={handleSearch}
          includeInactive={includeInactive}
          onIncludeInactiveChange={handleToggleInactive}
          onAddEnrollment={handleAddEnrollment}
          totalEnrollments={pagination.total}
          pagination={pagination}
          currentPage={page}
          onPageChange={setPage}
        />
        
        <EnrollmentsTable
          enrollments={enrollments}
          loading={loading}
          onEnrollmentClick={(enrollmentId) => router.push(`/enrollments/${enrollmentId}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReactivate={handleReactivate}
        />
      </div>


      {/* Delete Confirmation Dialog */}
      <DeleteEnrollmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        enrollment={enrollmentToDelete}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* Reactivate Student Dialog */}
      <ReactivateStudentDialog
        open={reactivateDialogOpen}
        onOpenChange={setReactivateDialogOpen}
        enrollment={enrollmentToReactivate}
        onConfirm={handleConfirmReactivate}
        loading={reactivating}
      />
    </main>
  )
}