"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, CheckCircle, AlertTriangle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface Student {
  id: string
  name: string
  admissionNo: string
  isActive: boolean
  enrollments?: Array<{
    class: { className: string }
    academicYear: { year: string }
  }>
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

interface ReactivateStudentDialogProps {
  student: Student
  isOpen: boolean
  onConfirm: (data: {
    restoreEnrollments?: boolean
    academicYearId?: string
    classId?: string
  }) => Promise<void>
  onCancel: () => void
}

export function ReactivateStudentDialog({
  student,
  isOpen,
  onConfirm,
  onCancel
}: ReactivateStudentDialogProps) {
  const [createNewEnrollment, setCreateNewEnrollment] = useState(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Fetch academic years and classes when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      setIsLoadingData(true)
      const [academicYearsRes, classesRes] = await Promise.all([
        fetch("/api/academic-years"),
        fetch("/api/classes")
      ])

      if (academicYearsRes.ok && classesRes.ok) {
        const [academicYearsData, classesData] = await Promise.all([
          academicYearsRes.json(),
          classesRes.json()
        ])

        setAcademicYears(academicYearsData.academicYears || [])
        setClasses(classesData.classes || [])

        // Auto-select current academic year if available
        const currentYear = academicYearsData.academicYears?.find((ay: AcademicYear) => ay.isActive)
        if (currentYear) {
          setSelectedAcademicYear(currentYear.id)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const data: {
        restoreEnrollments?: boolean
        academicYearId?: string
        classId?: string
      } = {}

      if (createNewEnrollment && selectedAcademicYear && selectedClass) {
        data.academicYearId = selectedAcademicYear
        data.classId = selectedClass
      }

      await onConfirm(data)
      
      // Reset form
      setCreateNewEnrollment(false)
      setSelectedAcademicYear("")
      setSelectedClass("")
    } catch (error) {
      console.error("Error reactivating student:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setCreateNewEnrollment(false)
    setSelectedAcademicYear("")
    setSelectedClass("")
    onCancel()
  }

  const canSubmit = !createNewEnrollment || (selectedAcademicYear && selectedClass)

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span>Reactivate Student</span>
          </DialogTitle>
          <DialogDescription>
            Reactivate this student and optionally create a new enrollment for the current academic year.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Student Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium">{student.name}</div>
            <div className="text-sm text-gray-600">Admission No: {student.admissionNo}</div>
          </div>

          {/* Existing Enrollments Info */}
          {student.enrollments && student.enrollments.length > 0 && (
            <div className="space-y-2">
              <Label>Previous Enrollments</Label>
              <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                {student.enrollments.map((enrollment, index) => (
                  <div key={index} className="text-sm">
                    {enrollment.class.className} - {enrollment.academicYear.year}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Enrollment Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createEnrollment"
                checked={createNewEnrollment}
                onCheckedChange={(checked) => setCreateNewEnrollment(checked === true)}
              />
              <Label htmlFor="createEnrollment">
                Create new enrollment for current academic year
              </Label>
            </div>

            {createNewEnrollment && (
              <div className="space-y-3 pl-6">
                {isLoadingData ? (
                  <div className="flex items-center space-x-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-gray-600">Loading academic data...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.year} {year.isActive && "(Current)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes
                            .sort((a, b) => a.order - b.order)
                            .map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.className}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Success Alert */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              The student will be reactivated and can access the system normally. 
              All previous data and enrollments will be preserved.
            </AlertDescription>
          </Alert>

          {/* Warning for missing enrollment */}
          {!createNewEnrollment && (!student.enrollments || student.enrollments.length === 0) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> This student has no existing enrollments. 
                Consider creating a new enrollment to assign them to a class.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !canSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            Reactivate Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}