"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Separator } from "@/components/ui/separator"
import { Save, Award, AlertTriangle, Info, ArrowLeft, RotateCcw } from "lucide-react"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import FeeItemsSection from "../../_components/form/fee-items-section"
import ScholarshipItemsSection from "../../_components/form/scholarship-items-section"
import { toast } from "sonner"
import type { Student, Class } from "@/generated/prisma"
import type { FeeItem, ScholarshipItem } from "@/types/fee"


interface FeeStructure {
  id: string
  name: string
  description?: string
  academicYearId: string
  classId: string
  feeItems: FeeItem[]
  scholarshipItems: ScholarshipItem[]
  totalFees: {
    compulsory: number
    optional: number
    total: number
  }
  totalScholarships: {
    autoApplied: number
    manual: number
    total: number
  }
}

interface Enrollment {
  id: string
  studentId: string
  academicYearId: string
  classId: string
  section: string
  customFees: Record<string, number>
  customScholarships: Record<string, number>
  selectedScholarships: string[]
  enrollmentDate: string
  isActive: boolean
  student: Student
}

export default function EditEnrollmentPage() {
  const params = useParams()
  const enrollmentId = params.id as string
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [fetchingFeeStructure, setFetchingFeeStructure] = useState(false)
  const [error, setError] = useState("")
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null)

  const [formData, setFormData] = useState({
    classId: "",
    section: "",
    customFees: {} as Record<string, number>,
    customScholarships: {} as Record<string, number>,
    selectedScholarships: [] as string[],
  })

  const fetchEnrollment = useCallback(async () => {
    if (!enrollmentId) return
    
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollment(data)
        
        // Transform enrollment fees to customFees format
        const customFees: Record<string, number> = {}
        if (data.fees) {
          data.fees.forEach((fee: any) => {
            // If current amount differs from original amount, it's a custom fee
            if (fee.amount !== fee.originalAmount) {
              customFees[fee.templateId] = fee.amount
            }
          })
        }
        
        // Transform enrollment scholarships to customScholarships format
        const customScholarships: Record<string, number> = {}
        const selectedScholarships: string[] = []
        if (data.scholarships) {
          data.scholarships.forEach((scholarship: any) => {
            // If current amount differs from original amount, it's a custom scholarship
            if (scholarship.amount !== scholarship.originalAmount) {
              customScholarships[scholarship.templateId] = scholarship.amount
            }
            // If scholarship is active and not auto-applied, it's selected
            if (scholarship.isActive && !scholarship.isAutoApplied) {
              selectedScholarships.push(scholarship.id)
            }
          })
        }
        
        setFormData({
          classId: data.classId,
          section: data.section,
          customFees,
          customScholarships,
          selectedScholarships,
        })
      } else {
        setError("Enrollment not found")
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error)
      setError("Failed to load enrollment information")
    }
  }, [enrollmentId])

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch("/api/classes?active=true")
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }, [])

  useEffect(() => {
    if (!enrollmentId) {
      setError("No enrollment ID provided")
      return
    }

    const loadData = async () => {
      setFetchingData(true)
      await Promise.all([fetchEnrollment(), fetchClasses()])
      setFetchingData(false)
    }

    loadData()
  }, [enrollmentId, fetchEnrollment, fetchClasses])

  const fetchFeeStructure = useCallback(async () => {
    if (!academicYear?.id || !formData.classId) {
      setFeeStructure(null)
      return
    }

    try {
      setFetchingFeeStructure(true)
      const response = await fetch(
        `/api/admin/fee-structures?academicYearId=${academicYear.id}&classId=${formData.classId}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setFeeStructure(data[0])
        } else {
          setFeeStructure(null)
        }
      }
    } catch (error) {
      console.error("Error fetching fee structure:", error)
      setFeeStructure(null)
    } finally {
      setFetchingFeeStructure(false)
    }
  }, [academicYear?.id, formData.classId])

  useEffect(() => {
    fetchFeeStructure()
  }, [fetchFeeStructure])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCustomFeesChange = (customFees: Record<string, number>) => {
    setFormData(prev => ({
      ...prev,
      customFees
    }))
  }

  const handleCustomScholarshipsChange = (customScholarships: Record<string, number>) => {
    setFormData(prev => ({
      ...prev,
      customScholarships
    }))
  }

  const handleResetAllToDefault = () => {
    setFormData(prev => ({
      ...prev,
      customFees: {},
      customScholarships: {},
      selectedScholarships: []
    }))
  }

  const handleScholarshipToggle = (scholarshipId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedScholarships: checked
        ? [...prev.selectedScholarships, scholarshipId]
        : prev.selectedScholarships.filter(id => id !== scholarshipId)
    }))
  }

  const calculateTotals = () => {
    if (!feeStructure) return { totalFees: 0, totalScholarships: 0, netAmount: 0 }

    const totalFees = feeStructure.feeItems.reduce((sum, item) => {
      const customAmount = formData.customFees[item.templateId]
      const finalAmount = (customAmount !== undefined && item.isEditableDuringEnrollment) 
        ? customAmount 
        : item.amount
      return sum + finalAmount
    }, 0)

    const autoScholarships = feeStructure.scholarshipItems
      .filter(item => item.isAutoApplied)
      .reduce((sum, item) => {
        const customAmount = formData.customScholarships[item.templateId]
        const finalAmount = (customAmount !== undefined && item.isEditableDuringEnrollment) 
          ? customAmount 
          : item.amount
        return sum + finalAmount
      }, 0)

    const manualScholarships = feeStructure.scholarshipItems
      .filter(item => formData.selectedScholarships.includes(item.id!))
      .reduce((sum, item) => {
        const customAmount = formData.customScholarships[item.templateId]
        const finalAmount = (customAmount !== undefined && item.isEditableDuringEnrollment) 
          ? customAmount 
          : item.amount
        return sum + finalAmount
      }, 0)

    const totalScholarships = autoScholarships + manualScholarships

    return {
      totalFees,
      totalScholarships,
      netAmount: totalFees - totalScholarships
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!enrollment || !feeStructure || !academicYear) return

    try {
      setLoading(true)
      setError("")

      const submitData = {
        classId: formData.classId,
        section: formData.section,
        customFees: formData.customFees,
        customScholarships: formData.customScholarships,
        selectedScholarships: formData.selectedScholarships,
        isActive: true,
      }

      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Enrollment updated successfully")
        navigateTo(`/enrollments/${result.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update enrollment")
      }
    } catch (error) {
      console.error("Update error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!enrollmentId) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No enrollment ID provided. Please select an enrollment to edit.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!academicYear) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select an academic year from the header to proceed with editing.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (fetchingData || !enrollment) {
    return <LoaderWrapper fullScreen label="Loading enrollment..." />
  }

  const totals = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo(`/enrollments/${enrollmentId}`)}
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Back to Enrollment Details"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{enrollment.student.name}</h1>
                <p className="text-sm text-gray-600">Edit Enrollment</p>
              </div>
            </div>
            
            {/* Student Details in Same Line */}
            <div className="hidden md:flex items-center space-x-50">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission No</Label>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{enrollment.student.admissionNo}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father&apos;s Name</Label>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{enrollment.student.fatherName}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</Label>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{enrollment.student.mobileNo1}</p>
              </div>
            </div>
          </div>
          
          {/* Mobile: Student Details Below */}
          <div className="md:hidden mt-4 grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission No</Label>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{enrollment.student.admissionNo}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father&apos;s Name</Label>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{enrollment.student.fatherName}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</Label>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{enrollment.student.mobileNo1}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full py-3 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">

          {/* Enrollment Form */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Academic Year</Label>
                  <p className="text-base font-semibold mt-1 flex items-center h-9">{academicYear.year}</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="classId" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class *</Label>
                  <select
                    id="classId"
                    value={formData.classId}
                    onChange={(e) => handleChange("classId", e.target.value)}
                    required
                    disabled={loading}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="section" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Section *</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => handleChange("section", e.target.value)}
                    placeholder="e.g., A, B, C"
                    required
                    disabled={loading}
                    className="h-9"
                  />
                </div>

              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Fee Structure Loading */}
                {fetchingFeeStructure && (
                  <div className="py-4">
                    <LoaderWrapper center label="Loading fee structure..." />
                  </div>
                )}

                {/* Fee Structure Not Found */}
                {!fetchingFeeStructure && formData.classId && !feeStructure && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No fee structure found for the selected class in {academicYear.year}. 
                      Please contact the admin to set up a fee structure first.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Fee Structure Display */}
                {!fetchingFeeStructure && feeStructure && (
                  <div className="border-t pt-4 space-y-4">
                    {/* Improved Fee Items Section */}
                    <FeeItemsSection
                      feeItems={feeStructure.feeItems}
                      customFees={formData.customFees}
                      onCustomFeesChange={handleCustomFeesChange}
                      disabled={loading}
                      autoSave={true}
                    />

                    {/* Scholarship Items */}
                    {feeStructure.scholarshipItems.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium mb-3 flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          Available Scholarships
                        </h4>
                        <ScholarshipItemsSection
                          scholarshipItems={feeStructure.scholarshipItems}
                          customScholarships={formData.customScholarships}
                          onCustomScholarshipsChange={handleCustomScholarshipsChange}
                          selectedScholarships={formData.selectedScholarships}
                          onScholarshipToggle={handleScholarshipToggle}
                          disabled={loading}
                          autoSave={true}
                        />
                      </div>
                    )}

                    {/* Reset All Button */}
                    {(Object.keys(formData.customFees).length > 0 || Object.keys(formData.customScholarships).length > 0 || formData.selectedScholarships.length > 0) && (
                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResetAllToDefault}
                          disabled={loading}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset All to Default
                        </Button>
                      </div>
                    )}

                    <Separator />

                    {/* Fee Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3">Fee Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Fees:</span>
                          <span className="font-semibold">₹{totals.totalFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                          <span>Total Scholarships:</span>
                          <span className="font-semibold">-₹{totals.totalScholarships.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Net Amount:</span>
                          <span>₹{totals.netAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigateTo(`/enrollments/${enrollmentId}`)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !feeStructure || fetchingFeeStructure}
                  >
                    {loading ? (
                      "Updating..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Enrollment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}