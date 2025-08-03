'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CreditCard } from 'lucide-react'
import { useAcademicYear, useAcademicYearNavigation } from '@/contexts/academic-year-context'
import LoaderWrapper from '@/components/ui/loader-wrapper'
import { StudentEnrollmentBasic } from '@/types/enrollment'
import StudentSearch from '../_components/student-search'
import StudentEnrollmentCard from '../_components/student-enrollment-card'
import EmptyState from '../_components/empty-states'

export default function CollectFeePage() {
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  const [enrollments, setEnrollments] = useState<StudentEnrollmentBasic[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<StudentEnrollmentBasic[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  const fetchEnrollments = useCallback(async () => {
    if (!academicYear) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/enrollments?academicYearId=${academicYear.id}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }, [academicYear])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  // Filter enrollments based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const filtered = enrollments.filter(enrollment => {
          const searchLower = searchTerm.toLowerCase()
          return (
            `${enrollment.student.name}`.toLowerCase().includes(searchLower) ||
            enrollment.student.admissionNumber.toLowerCase().includes(searchLower) ||
            enrollment.student.fatherName.toLowerCase().includes(searchLower)
          )
        })
        setFilteredEnrollments(filtered)
        setIsSearching(false)
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setFilteredEnrollments([])
      setIsSearching(false)
    }
  }, [searchTerm, enrollments])

  if (loading) {
    return <LoaderWrapper fullScreen label="Loading students..." />
  }

  if (!academicYear) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select an academic year from the header to proceed with fee collection.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span>Collect Fees</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Academic Year: <strong>{academicYear.year}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <StudentSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isSearching={isSearching}
            />

            <div className="max-h-96 overflow-y-auto">
              {searchTerm.trim() === '' ? (
                <EmptyState type="initial" />
              ) : filteredEnrollments.length === 0 && !isSearching ? (
                <EmptyState type="no-results" />
              ) : (
                <div className="space-y-3">
                  {filteredEnrollments.map((enrollment) => (
                    <StudentEnrollmentCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      onClick={() => navigateTo(`/fees/collect/${enrollment.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {searchTerm.trim() !== '' && (
              <div className="border-t pt-4 text-center">
                <p className="text-sm text-gray-600">
                  Can&apos;t find the student? Make sure they are enrolled in the current academic year.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}