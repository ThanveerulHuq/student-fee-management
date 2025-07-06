"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  CreditCard,
  User,
  Calculator,
  Receipt
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/receipt"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import EnhancedPageHeader from "@/components/ui/enhanced-page-header"
import SecondaryHeader from "@/components/ui/secondary-header"

interface StudentEnrollment {
  id: string
  section: string
  student: {
    id: string
    name: string
    admissionNo: string
    fatherName: string
    mobileNo1: string
  }
  academicYear: {
    year: string
    isActive: boolean
  }
  class: {
    className: string
  }
  feeBreakdown: {
    schoolFee: { total: number; paid: number; outstanding: number }
    bookFee: { total: number; paid: number; outstanding: number }
    uniformFee: { total: number; paid: number; outstanding: number }
    islamicStudies: { total: number; paid: number; outstanding: number }
    vanFee: { total: number; paid: number; outstanding: number }
    scholarship: number
    totalFee: number
    totalPaid: number
    outstanding: number
  }
}

function FeeCollectContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { academicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()
  const enrollmentId = searchParams.get("enrollmentId")
  const studentId = searchParams.get("studentId")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null)
  const [availableEnrollments, setAvailableEnrollments] = useState<StudentEnrollment[]>([])

  const [paymentData, setPaymentData] = useState({
    enrollmentId: enrollmentId || "",
    schoolFee: 0,
    bookFee: 0,
    uniformFee: 0,
    islamicStudies: 0,
    vanFee: 0,
    totalAmountPaid: 0,
    paymentMethod: "CASH",
    remarks: "",
  })

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentDetails(enrollmentId)
    } else if (studentId) {
      fetchStudentEnrollments(studentId)
    }
  }, [enrollmentId, studentId])

  useEffect(() => {
    // Calculate total when individual fees change
    const total = 
      paymentData.schoolFee +
      paymentData.bookFee +
      paymentData.uniformFee +
      paymentData.islamicStudies +
      paymentData.vanFee

    setPaymentData(prev => ({ ...prev, totalAmountPaid: total }))
  }, [paymentData.schoolFee, paymentData.bookFee, paymentData.uniformFee, paymentData.islamicStudies, paymentData.vanFee])

  const fetchEnrollmentDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/enrollments/${id}`)
      if (response.ok) {
        const data = await response.json()
        
        // Calculate fee breakdown
        const feeBreakdown = {
          schoolFee: {
            total: data.commonFee.schoolFee,
            paid: data.paidFee?.schoolFeePaid || 0,
            outstanding: Math.max(0, data.commonFee.schoolFee - (data.paidFee?.schoolFeePaid || 0)),
          },
          bookFee: {
            total: data.commonFee.bookFee,
            paid: data.paidFee?.bookFeePaid || 0,
            outstanding: Math.max(0, data.commonFee.bookFee - (data.paidFee?.bookFeePaid || 0)),
          },
          uniformFee: {
            total: data.uniformFee,
            paid: data.paidFee?.uniformFeePaid || 0,
            outstanding: Math.max(0, data.uniformFee - (data.paidFee?.uniformFeePaid || 0)),
          },
          islamicStudies: {
            total: data.islamicStudies,
            paid: data.paidFee?.islamicStudiesPaid || 0,
            outstanding: Math.max(0, data.islamicStudies - (data.paidFee?.islamicStudiesPaid || 0)),
          },
          vanFee: {
            total: data.vanFee,
            paid: data.paidFee?.vanFeePaid || 0,
            outstanding: Math.max(0, data.vanFee - (data.paidFee?.vanFeePaid || 0)),
          },
          scholarship: data.scholarship,
          totalFee: data.commonFee.schoolFee + data.commonFee.bookFee + data.uniformFee + data.islamicStudies + data.vanFee - data.scholarship,
          totalPaid: data.paidFee?.totalPaid || 0,
          outstanding: 0,
        }
        
        feeBreakdown.outstanding = Math.max(0, feeBreakdown.totalFee - feeBreakdown.totalPaid)

        setEnrollment({ ...data, feeBreakdown })
        setPaymentData(prev => ({ ...prev, enrollmentId: id }))
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error)
      setError("Failed to load enrollment details")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentEnrollments = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fees/student/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableEnrollments(data.enrollments.filter((e: { feeBreakdown: { outstanding: number } }) => e.feeBreakdown.outstanding > 0))
      }
    } catch (error) {
      console.error("Error fetching student enrollments:", error)
      setError("Failed to load student enrollments")
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollmentSelect = (id: string) => {
    setPaymentData(prev => ({ ...prev, enrollmentId: id }))
    fetchEnrollmentDetails(id)
  }

  const handleFeeChange = (feeType: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setPaymentData(prev => ({ ...prev, [feeType]: numValue }))
  }

  const handlePayFullAmount = () => {
    if (!enrollment) return

    setPaymentData(prev => ({
      ...prev,
      schoolFee: enrollment.feeBreakdown.schoolFee.outstanding,
      bookFee: enrollment.feeBreakdown.bookFee.outstanding,
      uniformFee: enrollment.feeBreakdown.uniformFee.outstanding,
      islamicStudies: enrollment.feeBreakdown.islamicStudies.outstanding,
      vanFee: enrollment.feeBreakdown.vanFee.outstanding,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!enrollment) {
      setError("Please select an enrollment")
      return
    }

    if (paymentData.totalAmountPaid <= 0) {
      setError("Payment amount must be greater than 0")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/fees/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentYearId: paymentData.enrollmentId,
          schoolFee: paymentData.schoolFee,
          bookFee: paymentData.bookFee,
          uniformFee: paymentData.uniformFee,
          islamicStudies: paymentData.islamicStudies,
          vanFee: paymentData.vanFee,
          totalAmountPaid: paymentData.totalAmountPaid,
          paymentMethod: paymentData.paymentMethod,
          remarks: paymentData.remarks,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Payment collected successfully! Receipt No: ${result.receiptNo}`)
        
        // Reset form
        setPaymentData({
          enrollmentId: "",
          schoolFee: 0,
          bookFee: 0,
          uniformFee: 0,
          islamicStudies: 0,
          vanFee: 0,
          totalAmountPaid: 0,
          paymentMethod: "CASH",
          remarks: "",
        })
        
        // Redirect to receipt page after 2 seconds
        setTimeout(() => {
          router.push(`/fees/receipt/${result.id}?academicYear=${academicYear?.id}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to collect payment")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedPageHeader 
        title="Dhaarussalam Matriculation Higher Secondary School"
      />
      <SecondaryHeader 
        title="Collect Fee Payment" 
        showBackButton={true}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Selection */}
          {availableEnrollments.length > 0 && (
            <div className="lg:col-span-3">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select Enrollment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableEnrollments.map((enroll) => (
                      <Card
                        key={enroll.id}
                        className={`cursor-pointer transition-colors ${
                          paymentData.enrollmentId === enroll.id 
                            ? "ring-2 ring-blue-500 bg-blue-50" 
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleEnrollmentSelect(enroll.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{enroll.academicYear.year}</span>
                              <Badge variant="outline">{enroll.class.className}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Section: {enroll.section}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Outstanding:</span>
                              <span className="font-semibold text-red-600">
                                {formatCurrency(enroll.feeBreakdown.outstanding)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Student Information */}
          {enrollment && (
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Student Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-lg font-semibold">{enrollment.student.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Admission No</Label>
                      <p className="text-lg font-semibold">{enrollment.student.admissionNo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Father&apos;s Name</Label>
                      <p className="text-sm">{enrollment.student.fatherName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Mobile</Label>
                      <p className="text-sm">{enrollment.student.mobileNo1}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                      <div className="flex items-center space-x-2">
                        <span>{enrollment.academicYear.year}</span>
                        {enrollment.academicYear.isActive && (
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Class & Section</Label>
                      <p className="text-sm">{enrollment.class.className} - {enrollment.section}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Collection Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        {error}
                      </Alert>
                    )}

                    {success && (
                      <Alert className="border-green-200 bg-green-50 text-green-800">
                        {success}
                      </Alert>
                    )}

                    {/* Fee Breakdown */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Fee Breakdown</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePayFullAmount}
                        >
                          Pay Full Outstanding
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* School Fee */}
                        <div className="space-y-2">
                          <Label htmlFor="schoolFee">
                            School Fee (Outstanding: {formatCurrency(enrollment.feeBreakdown.schoolFee.outstanding)})
                          </Label>
                          <Input
                            id="schoolFee"
                            type="number"
                            min="0"
                            max={enrollment.feeBreakdown.schoolFee.outstanding}
                            step="0.01"
                            value={paymentData.schoolFee}
                            onChange={(e) => handleFeeChange("schoolFee", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        {/* Book Fee */}
                        <div className="space-y-2">
                          <Label htmlFor="bookFee">
                            Book Fee (Outstanding: {formatCurrency(enrollment.feeBreakdown.bookFee.outstanding)})
                          </Label>
                          <Input
                            id="bookFee"
                            type="number"
                            min="0"
                            max={enrollment.feeBreakdown.bookFee.outstanding}
                            step="0.01"
                            value={paymentData.bookFee}
                            onChange={(e) => handleFeeChange("bookFee", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        {/* Uniform Fee */}
                        <div className="space-y-2">
                          <Label htmlFor="uniformFee">
                            Uniform Fee (Outstanding: {formatCurrency(enrollment.feeBreakdown.uniformFee.outstanding)})
                          </Label>
                          <Input
                            id="uniformFee"
                            type="number"
                            min="0"
                            max={enrollment.feeBreakdown.uniformFee.outstanding}
                            step="0.01"
                            value={paymentData.uniformFee}
                            onChange={(e) => handleFeeChange("uniformFee", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        {/* Islamic Studies */}
                        <div className="space-y-2">
                          <Label htmlFor="islamicStudies">
                            Islamic Studies (Outstanding: {formatCurrency(enrollment.feeBreakdown.islamicStudies.outstanding)})
                          </Label>
                          <Input
                            id="islamicStudies"
                            type="number"
                            min="0"
                            max={enrollment.feeBreakdown.islamicStudies.outstanding}
                            step="0.01"
                            value={paymentData.islamicStudies}
                            onChange={(e) => handleFeeChange("islamicStudies", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        {/* Van Fee */}
                        <div className="space-y-2">
                          <Label htmlFor="vanFee">
                            Van Fee (Outstanding: {formatCurrency(enrollment.feeBreakdown.vanFee.outstanding)})
                          </Label>
                          <Input
                            id="vanFee"
                            type="number"
                            min="0"
                            max={enrollment.feeBreakdown.vanFee.outstanding}
                            step="0.01"
                            value={paymentData.vanFee}
                            onChange={(e) => handleFeeChange("vanFee", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <select
                            id="paymentMethod"
                            value={paymentData.paymentMethod}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            disabled={loading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="CASH">Cash</option>
                            <option value="ONLINE">Online</option>
                            <option value="CHEQUE">Cheque</option>
                          </select>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-blue-900">
                            Total Payment:
                          </span>
                          <span className="text-2xl font-bold text-blue-900">
                            {formatCurrency(paymentData.totalAmountPaid)}
                          </span>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks (Optional)</Label>
                        <textarea
                          id="remarks"
                          rows={3}
                          value={paymentData.remarks}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, remarks: e.target.value }))}
                          disabled={loading}
                          placeholder="Any additional notes..."
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigateTo('/fees')}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading || paymentData.totalAmountPaid <= 0}
                      >
                        {loading ? (
                          "Processing..."
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Collect Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Fee Summary Sidebar */}
          {enrollment && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Fee Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Annual Fee:</span>
                      <span className="font-medium">{formatCurrency(enrollment.feeBreakdown.totalFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Paid:</span>
                      <span className="font-medium text-green-600">{formatCurrency(enrollment.feeBreakdown.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-medium">Outstanding:</span>
                      <span className="font-bold text-red-600">{formatCurrency(enrollment.feeBreakdown.outstanding)}</span>
                    </div>
                  </div>

                  {enrollment.feeBreakdown.scholarship > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-800">Scholarship Applied:</span>
                        <span className="font-medium text-green-800">
                          -{formatCurrency(enrollment.feeBreakdown.scholarship)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5" />
                    <span>Payment Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2">{formatDate(new Date())}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Collected By:</span>
                    <span className="ml-2">{(session?.user as { username?: string })?.username}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Method:</span>
                    <span className="ml-2">{paymentData.paymentMethod}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function FeeCollectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <FeeCollectContent />
    </Suspense>
  )
}