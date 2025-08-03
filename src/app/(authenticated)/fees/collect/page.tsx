'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  User, 
  Calendar,
  AlertTriangle,
  Hash,
  Phone,
  BookOpen,
  CreditCard
} from 'lucide-react'
import { useAcademicYear, useAcademicYearNavigation } from '@/contexts/academic-year-context'
import LoaderWrapper from '@/components/ui/loader-wrapper'
import LoaderOne from '@/components/ui/loader-one'
import { StudentEnrollmentBasic } from '@/types/enrollment'

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by student name, admission number, or father name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoaderOne />
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {searchTerm.trim() === '' ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Start typing to search for students to collect fees...</p>
                </div>
              ) : filteredEnrollments.length === 0 && !isSearching ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No students found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEnrollments.map((enrollment) => (
                    <Card 
                      key={enrollment.id} 
                      className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200 border-2 hover:shadow-md"
                      onClick={() => navigateTo(`/fees/collect/${enrollment.id}`)}
                    >
                      <CardContent className="p-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {enrollment.student.name}
                              </h4>
                              <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span>Father: {enrollment.student.fatherName}</span>
                                <span className="flex items-center">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {enrollment.class.className} - {enrollment.section}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-green-600">
                            <CreditCard className="w-5 h-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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