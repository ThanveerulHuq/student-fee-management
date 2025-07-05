"use client"

import { useState, useEffect, useCallback } from "react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import EnhancedPageHeader from "@/components/ui/enhanced-page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Save, UserPlus } from "lucide-react"

interface Student {
  id: string
  name: string
  admissionNo: string
  gender: string
  age: number
}

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
}

interface Class {
  id: string
  className: string
  order: number
}

interface CommonFee {
  schoolFee: number
  bookFee: number
}

interface EnrollStudentPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EnrollStudentPage({ params }: EnrollStudentPageProps) {
  const { navigateTo } = useAcademicYearNavigation()
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setStudentId(p.id))
  }, [params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [student, setStudent] = useState<Student | null>(null)
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [commonFee, setCommonFee] = useState<CommonFee | null>(null)

  const [formData, setFormData] = useState({
    academicYearId: "",
    classId: "",
    section: "",
    uniformFee: 0,
    islamicStudies: 0,
    vanFee: 0,
    scholarship: 0,
  })

  const fetchStudent = useCallback(async () => {
    if (!studentId) return
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
      }
    } catch (error) {
      console.error("Error fetching student:", error)
    }
  }, [studentId])

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/academic-years?active=true")
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(data)
      }
    } catch (error) {
      console.error("Error fetching academic years:", error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes?active=true")
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchCommonFee = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/fee-structures?academicYearId=${formData.academicYearId}&classId=${formData.classId}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setCommonFee({
            schoolFee: data[0].schoolFee,
            bookFee: data[0].bookFee,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching common fee:", error)
    }
  }, [formData.academicYearId, formData.classId])

  useEffect(() => {
    fetchStudent()
    fetchAcademicYears()
    fetchClasses()
  }, [fetchStudent])

  useEffect(() => {
    if (formData.academicYearId && formData.classId) {
      fetchCommonFee()
    }
  }, [formData.academicYearId, formData.classId, fetchCommonFee])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Fee") || name === "scholarship" 
        ? (value === "" ? 0 : Number(value)) 
        : value,
    }))
  }

  const calculateTotal = () => {
    if (!commonFee) return 0
    
    const schoolFee = Number(commonFee.schoolFee || 0)
    const bookFee = Number(commonFee.bookFee || 0) 
    const uniformFee = Number(formData.uniformFee || 0)
    const islamicStudies = Number(formData.islamicStudies || 0)
    const vanFee = Number(formData.vanFee || 0)
    const scholarship = Number(formData.scholarship || 0)
    
    return schoolFee + bookFee + uniformFee + islamicStudies + vanFee - scholarship
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")

      if (!studentId) return
      
      const submitData = {
        studentId,
        ...formData,
        enrollmentDate: new Date(),
        isActive: true,
      }

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        navigateTo(`/students/${studentId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to enroll student")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedPageHeader 
        title="Enroll Student"
        showBackButton={true}
        backPath={`/students/${studentId}`}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Student Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Student Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="text-lg font-semibold">{student.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Admission No</Label>
                <p className="text-lg font-semibold">{student.admissionNo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Gender</Label>
                <p className="text-lg font-semibold">{student.gender}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Age</Label>
                <p className="text-lg font-semibold">{student.age} years</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}

              {/* Academic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="academicYearId">Academic Year *</Label>
                  <select
                    id="academicYearId"
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.year} {year.isActive && "(Active)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classId">Class *</Label>
                  <select
                    id="classId"
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section *</Label>
                  <Input
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g., A, B, C"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Fee Structure */}
              {commonFee && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Fee Structure</h3>
                  
                  {/* Common Fees (Read-only) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label>School Fee</Label>
                      <Input
                        value={`₹${commonFee.schoolFee}`}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Book Fee</Label>
                      <Input
                        value={`₹${commonFee.bookFee}`}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Additional Fees */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="uniformFee">Uniform Fee</Label>
                      <Input
                        id="uniformFee"
                        name="uniformFee"
                        type="number"
                        min="0"
                        value={formData.uniformFee}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="islamicStudies">Islamic Studies Fee</Label>
                      <Input
                        id="islamicStudies"
                        name="islamicStudies"
                        type="number"
                        min="0"
                        value={formData.islamicStudies}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vanFee">Van/Transport Fee</Label>
                      <Input
                        id="vanFee"
                        name="vanFee"
                        type="number"
                        min="0"
                        value={formData.vanFee}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scholarship">Scholarship/Discount</Label>
                      <Input
                        id="scholarship"
                        name="scholarship"
                        type="number"
                        min="0"
                        value={formData.scholarship}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Total Fee */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-blue-900">
                        Total Annual Fee:
                      </span>
                      <span className="text-2xl font-bold text-blue-900">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigateTo(`/students/${studentId}`)}
                  disabled={loading || !studentId}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !commonFee}>
                  {loading ? (
                    "Enrolling..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enroll Student
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}