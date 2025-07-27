"use client"

import { useState, useEffect, Suspense } from "react"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Search, User, Hash, Phone } from "lucide-react"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import LoaderOne from "@/components/ui/loader-one"

interface Student {
  id: string
  name: string
  admissionNo: string
  gender: string
  age: number
  fatherName: string
  mobileNo1: string
  isActive: boolean
}

function EnrollSearchContent() {
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  
  // Student search state
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Fetch all students for search
  useEffect(() => {
    fetchStudents()
  }, [])

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const filtered = students.filter(student => 
          student.isActive && (
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
        setFilteredStudents(filtered)
        setIsSearching(false)
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setFilteredStudents([])
      setIsSearching(false)
    }
  }, [searchTerm, students])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const handleStudentSelect = (student: Student) => {
    navigateTo(`/enroll/${student.id}`)
  }

  if (!academicYear) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select an academic year from the header to proceed with enrollment.
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
              <Search className="h-5 w-5" />
              <span>Select Student to Enroll</span>
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
                  placeholder="Search by student name, father name, or admission number..."
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
                    <p>Start typing to search for students...</p>
                  </div>
                ) : filteredStudents.length === 0 && !isSearching ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No students found matching your search.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <Card 
                        key={student.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <User className="w-8 h-8 text-blue-600" />
                              <div>
                                <h4 className="font-semibold">{student.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Hash className="w-3 h-3 mr-1" />
                                    {student.admissionNo}
                                  </span>
                                  <span>Father: {student.fatherName}</span>
                                  <span className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {student.mobileNo1}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Select
                            </Button>
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
                    Can&apos;t find the student? Make sure they are registered in the system.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
  )
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<LoaderWrapper fullScreen label="Loading..." />}>
      <EnrollSearchContent />
    </Suspense>
  )
}