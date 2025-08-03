'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Receipt, 
  IndianRupee,
  BookOpen,
  CreditCard
} from 'lucide-react'
import { toast } from 'sonner'
import LoaderWrapper from '@/components/ui/loader-wrapper'
import { trackFeePayment } from '@/lib/analytics'
import { StudentEnrollment } from '@/types/enrollment'

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
        
        // Track fee payment event
        trackFeePayment()
        
        toast.success('Payment recorded successfully')
        
        // Navigate to receipt page
        router.push(`/receipts/${data.id}`)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/fees/collect')}
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Fee Collection"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {enrollment.student.name}
                  </h1>
                  <div className="bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                    <span className="text-sm font-semibold text-blue-800">{enrollment.class.className} - {enrollment.section}</span>
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    <span className="text-sm font-semibold text-green-800">{enrollment.academicYear.year}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 font-medium">Fee Collection</span>
                </div>
              </div>
            </div>
            
            {/* Student Details in Same Line */}
            <div className="flex items-center space-x-5">
              <div className="rounded-lg px-3 py-2 border border-gray-200">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission No</Label>
                <p className="text-sm font-semibold text-gray-900">{enrollment.student.admissionNumber}</p>
              </div>
              <div className="rounded-lg px-3 py-2 border border-gray-200">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father&apos;s Name</Label>
                <p className="text-sm font-semibold text-gray-900">{enrollment.student.fatherName}</p>
              </div>
              <div className="rounded-lg px-3 py-2 border border-gray-200">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</Label>
                <p className="text-sm font-semibold text-gray-900">{enrollment.student.mobileNo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handlePayment}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Receipt className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Fee Payment</h4>
                      <p className="text-sm text-gray-600">Select fees to pay and record payment</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Fee Items */}
                  <div>
                    <div className="space-y-3">
                      {(enrollment.fees || []).filter(fee => (fee.amountDue || 0) > 0).map(fee => (
                        <div key={fee.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-1.5 bg-blue-50 rounded-lg">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              </div>
                              <h5 className="font-semibold text-gray-900 min-w-0 flex-1">{fee.templateName}</h5>
                              
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="text-center">
                                  <span className="text-xs text-gray-500">Total</span>
                                  <p className="font-medium text-gray-900">₹{fee.amount?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="text-center">
                                  <span className="text-xs text-green-600">Paid</span>
                                  <p className="font-medium text-green-700">₹{fee.amountPaid?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="text-center">
                                  <span className="text-xs text-red-600">Due</span>
                                  <p className="font-medium text-red-700">₹{fee.amountDue?.toFixed(2) || '0.00'}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 ml-6">
                              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                                <Label htmlFor={`fee-${fee.id}`} className="text-sm font-medium text-gray-700">₹</Label>
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
                                  className="w-32 h-10 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updatePaymentAmount(fee.id, fee.amountDue || 0)}
                                className="h-10 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                              >
                                Full
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className=" rounded-lg p-4 border border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h5>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="paymentMethod" className="text-xs text-gray-500 font-medium min-w-fit">Payment Method *</Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Select 
                              value={paymentForm.paymentMethod} 
                              onValueChange={(value: 'CASH' | 'ONLINE' | 'CHEQUE') => 
                                setPaymentForm({ ...paymentForm, paymentMethod: value })
                              }
                            >
                              <SelectTrigger className="h-9 w-40 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">💵 Cash</SelectItem>
                                <SelectItem value="ONLINE">💳 Online Transfer</SelectItem>
                                <SelectItem value="CHEQUE">📝 Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Label htmlFor="totalAmount" className="text-xs text-gray-500 font-medium min-w-fit">Total Amount</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              value={getTotalPaymentAmount().toFixed(2)}
                              readOnly
                              className="h-9 w-32 pl-10 font-semibold text-base bg-white border-gray-300"
                            />
                          </div>
                        </div>

                        <div className="flex items-start space-x-2 flex-1">
                          <Label htmlFor="remarks" className="text-xs text-gray-500 font-medium min-w-fit pt-2">Remarks</Label>
                          <Textarea
                            id="remarks"
                            value={paymentForm.remarks}
                            onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                            placeholder="Any additional notes..."
                            rows={2}
                            className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/fees/collect')}
                      className="h-9 px-4 border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={getTotalPaymentAmount() <= 0 || submitting}
                      className="h-9 px-4 bg-green-600 hover:bg-green-700"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      {submitting ? 'Processing...' : `Record Payment (₹${getTotalPaymentAmount().toFixed(2)})`}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Fee Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h4 className="font-semibold text-sm flex items-center text-gray-900">
                  <div className="p-1.5 bg-green-100 rounded-lg mr-2">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                  </div>
                  Fee Summary
                </h4>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total Fees</span>
                    <span className="font-semibold text-gray-900 text-sm">₹{enrollment.totals?.fees?.total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Scholarships</span>
                    <span className="text-green-600 font-semibold text-sm">-₹{enrollment.totals?.scholarships?.applied?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-sm">Net Amount</span>
                      <span className="font-bold text-gray-900 text-sm">₹{enrollment.totals?.netAmount?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Already Paid</span>
                    <span className="text-green-600 font-semibold text-sm">₹{enrollment.totals?.netAmount?.paid?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                      <span className="text-red-700 font-semibold text-sm">Amount Due</span>
                      <span className="text-red-700 font-bold">₹{enrollment.totals?.netAmount?.due?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>



                {/* Scholarships */}
                {(enrollment.scholarships?.length || 0) > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <h5 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <div className="p-1 bg-yellow-100 rounded mr-2">
                        <span className="text-yellow-600 text-xs">🎓</span>
                      </div>
                      Applied Scholarships
                    </h5>
                    <div className="space-y-1">
                      {enrollment.scholarships?.filter(s => s.isActive).map((scholarship, index) => (
                        <div key={index} className="flex justify-between items-center bg-green-50 rounded-lg p-2 border border-green-100">
                          <span className="text-green-700 font-medium text-xs">{scholarship.templateName}</span>
                          <span className="text-green-700 font-semibold text-xs">₹{scholarship.amount?.toFixed(2) || '0.00'}</span>
                        </div>
                      )) || []}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}