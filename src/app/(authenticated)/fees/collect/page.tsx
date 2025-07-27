'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  User, 
  Calendar,
  IndianRupee,
  Hash,
  Phone,
  BookOpen,
  CreditCard
} from 'lucide-react'
import { useAcademicYear, useAcademicYearNavigation } from '@/contexts/academic-year-context'
import LoaderWrapper from '@/components/ui/loader-wrapper'

interface StudentEnrollment {
  id: string
  studentId: string
  section: string
  student: {
    admissionNumber: string
    firstName: string
    lastName: string
    fatherName: string
    phone: string
    status: string
  }
  academicYear: {
    id: string
    year: string
  }
  class: {
    className: string
    order: number
  }
}

export default function CollectFeePage() {
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

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

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      enrollment.student.firstName.toLowerCase().includes(searchLower) ||
      enrollment.student.lastName.toLowerCase().includes(searchLower) ||
      enrollment.student.admissionNumber.toLowerCase().includes(searchLower) ||
      enrollment.student.fatherName.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <LoaderWrapper fullScreen label="Loading students..." />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-green-600" />
            Collect Fees
          </h1>
          <p className="text-muted-foreground">Select a student to collect fees</p>
          {academicYear && (
            <div className="flex items-center mt-2">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm font-medium">Academic Year: {academicYear.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by student name, admission number, or father name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredEnrollments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No students enrolled in current academic year.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateTo(`/fees/collect/${enrollment.id}`)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <User className="w-8 h-8 text-green-600" />
                    <div>
                      <CardTitle className="text-xl">
                        {enrollment.student.firstName} {enrollment.student.lastName}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Hash className="w-4 h-4 mr-1" />
                          {enrollment.student.admissionNumber}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {enrollment.student.fatherName}
                        </span>
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {enrollment.student.phone}
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {enrollment.class.className} - {enrollment.section}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateTo(`/fees/collect/${enrollment.id}`)
                      }}
                    >
                      Collect Fees
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}