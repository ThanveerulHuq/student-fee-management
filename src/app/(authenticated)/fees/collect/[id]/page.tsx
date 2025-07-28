'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Receipt, 
  User, 
  Calendar,
  IndianRupee,
  Hash,
  Phone,
  BookOpen,
  CreditCard
} from 'lucide-react'
import { toast } from 'sonner'
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
  totals: {
    fees: {
      total: number
      paid: number
      due: number
    }
    scholarships: {
      applied: number
    }
    netAmount: {
      total: number
      paid: number
      due: number
    }
  }
  feeStatus: {
    status: string
    overdueAmount: number
  }
  fees: Array<{
    id: string
    templateName: string
    templateCategory: string
    amount: number
    amountPaid: number
    amountDue: number
    isCompulsory: boolean
    isWaived: boolean
  }>
  scholarships: Array<{
    templateName: string
    amount: number
    isActive: boolean
  }>
}

interface PaymentFormData {
  paymentMethod: 'CASH' | 'ONLINE' | 'CHEQUE'
  remarks: string
  paymentItems: Record<string, number>
}

export default function FeePaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    paymentMethod: 'CASH',
    remarks: '',
    paymentItems: {}
  })

  useEffect(() => {
    fetchEnrollment()
  }, [resolvedParams.id])

  const fetchEnrollment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/enrollments/${resolvedParams.id}`)
      if (response.ok) {
        const enrollment = await response.json()
        setEnrollment(enrollment)
      } else {
        toast.error('Failed to fetch student details')
        router.push('/fees/collect')
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error)
      toast.error('Error fetching student details')
      router.push('/fees/collect')
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentAmount = (feeId: string, amount: number) => {
    setPaymentForm(prev => ({
      ...prev,
      paymentItems: {
        ...prev.paymentItems,
        [feeId]: amount
      }
    }))
  }

  const getTotalPaymentAmount = () => {
    return Object.values(paymentForm.paymentItems).reduce((sum, amount) => sum + (amount || 0), 0)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!enrollment) {
      toast.error('No student selected')
      return
    }

    const paymentItems = Object.entries(paymentForm.paymentItems)
      .filter(([_, amount]) => amount > 0)
      .map(([feeId, amount]) => ({ feeId, amount }))

    if (paymentItems.length === 0) {
      toast.error('Please enter payment amounts')
      return
    }

    const totalAmount = getTotalPaymentAmount()

    try {
      setSubmitting(true)
      const response = await fetch('/api/fees/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEnrollmentId: enrollment.id,
          totalAmount,
          paymentMethod: paymentForm.paymentMethod,
          remarks: paymentForm.remarks,
          paymentItems
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Payment recorded successfully')
        
        // Navigate to receipt page
        router.push(`/receipt/${data.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Error recording payment')
    } finally {
      setSubmitting(false)
    }
  }

  const validatePaymentAmount = (feeId: string, amount: number): string | null => {
    const fee = enrollment?.fees?.find(f => f.id === feeId)
    if (!fee) return 'Fee not found'
    
    if (amount < 0) return 'Amount cannot be negative'
    const amountDue = fee.amountDue || 0
    if (amount > amountDue) return `Amount cannot exceed due amount of ₹${amountDue.toFixed(2)}`
    
    return null
  }

  if (loading) {
    return <LoaderWrapper fullScreen label="Loading student details..." />
  }

  if (!enrollment) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Student not found</p>
          <Button onClick={() => router.push('/fees/collect')} className="mt-4">
            Back to Students
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/fees/collect')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <CreditCard className="w-8 h-8 mr-3 text-green-600" />
              Collect Fees
            </h1>
            <p className="text-muted-foreground">Record fee payment for student</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {enrollment.student.firstName} {enrollment.student.lastName}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    <span>Admission No: {enrollment.student.admissionNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Father: {enrollment.student.fatherName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Phone: {enrollment.student.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Class: {enrollment.class.className} - {enrollment.section}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Academic Year: {enrollment.academicYear.year}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fee Summary */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  Fee Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Fees</span>
                    <span>₹{enrollment.totals?.fees?.total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scholarships</span>
                    <span className="text-green-600">-₹{enrollment.totals?.scholarships?.applied?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Net Amount</span>
                    <span>₹{enrollment.totals?.netAmount?.total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Already Paid</span>
                    <span className="text-green-600">₹{enrollment.totals?.netAmount?.paid?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Amount Due</span>
                    <span className="text-red-600">₹{enrollment.totals?.netAmount?.due?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Scholarships */}
              {(enrollment.scholarships?.length || 0) > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Applied Scholarships</h4>
                    <div className="space-y-1">
                      {enrollment.scholarships?.filter(s => s.isActive).map((scholarship, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{scholarship.templateName}</span>
                          <span className="text-green-600">₹{scholarship.amount?.toFixed(2) || '0.00'}</span>
                        </div>
                      )) || []}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePayment}>
            <Card>
              <CardHeader>
                <CardTitle>Fee Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fee Items */}
                <div>
                  <h4 className="font-semibold mb-3">Select Fees to Pay</h4>
                  <div className="space-y-3">
                    {(enrollment.fees || []).filter(fee => (fee.amountDue || 0) > 0).map(fee => (
                      <Card key={fee.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{fee.templateName}</p>
                              <div className="text-sm text-muted-foreground mt-1">
                                <span>Total: ₹{fee.amount?.toFixed(2) || '0.00'}</span>
                                <span className="mx-2">•</span>
                                <span>Paid: ₹{fee.amountPaid?.toFixed(2) || '0.00'}</span>
                                <span className="mx-2">•</span>
                                <span>Due: ₹{fee.amountDue?.toFixed(2) || '0.00'}</span>
                                {fee.isCompulsory && (
                                  <Badge variant="secondary" className="ml-2">Compulsory</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`fee-${fee.id}`}>₹</Label>
                              <Input
                                id={`fee-${fee.id}`}
                                type="number"
                                value={paymentForm.paymentItems[fee.id] || ''}
                                onChange={(e) => {
                                  const amount = parseFloat(e.target.value) || 0
                                  const validation = validatePaymentAmount(fee.id, amount)
                                  if (!validation) {
                                    updatePaymentAmount(fee.id, amount)
                                  }
                                }}
                                placeholder="0.00"
                                max={fee.amountDue || 0}
                                min="0"
                                step="0.01"
                                className="w-32"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updatePaymentAmount(fee.id, fee.amountDue || 0)}
                              >
                                Full
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select 
                      value={paymentForm.paymentMethod} 
                      onValueChange={(value: 'CASH' | 'ONLINE' | 'CHEQUE') => 
                        setPaymentForm({ ...paymentForm, paymentMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="ONLINE">Online Transfer</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="totalAmount">Total Payment Amount</Label>
                    <div className="flex items-center">
                      <span className="mr-2">₹</span>
                      <Input
                        value={getTotalPaymentAmount().toFixed(2)}
                        readOnly
                        className="font-bold text-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/fees/collect')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={getTotalPaymentAmount() <= 0 || submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    {submitting ? 'Processing...' : `Record Payment (₹${getTotalPaymentAmount().toFixed(2)})`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}