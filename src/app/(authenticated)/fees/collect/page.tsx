'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Receipt, 
  User, 
  Calendar,
  IndianRupee,
  Hash,
  Phone,
  BookOpen,
  CreditCard,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { useAcademicYear } from '@/contexts/academic-year-context'

interface StudentEnrollment {
  id: string
  studentId: string
  academicYearId: string
  classId: string
  section: string
  enrollmentDate: string
  isActive: boolean
  student: {
    admissionNumber: string
    firstName: string
    lastName: string
    fatherName: string
    phone: string
    class: string
    status: string
  }
  academicYear: {
    year: string
  }
  class: {
    className: string
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
    amount: number
    amountPaid: number
    amountDue: number
    isCompulsory: boolean
    isWaived: boolean
    recentPayments: Array<{
      paymentId: string
      amount: number
      paymentDate: string
      receiptNo: string
      paymentMethod: string
    }>
  }>
  scholarships: Array<{
    templateName: string
    amount: number
    isActive: boolean
  }>
}

interface Payment {
  id: string
  receiptNo: string
  studentEnrollmentId: string
  totalAmount: number
  paymentDate: string
  paymentMethod: string
  remarks?: string
  createdBy: string
  status: string
  student: {
    admissionNumber: string
    firstName: string
    lastName: string
    fatherName: string
    phone: string
  }
  academicYear: {
    year: string
  }
  paymentItems: Array<{
    id: string
    feeId: string
    feeTemplateId: string
    feeTemplateName: string
    amount: number
    feeBalance: number
  }>
}

const statusColors = {
  PAID: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
  WAIVED: 'bg-gray-100 text-gray-800'
}

export default function FlexiblePaymentsPage() {
  const { academicYear } = useAcademicYear()
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  
  const [selectedEnrollment, setSelectedEnrollment] = useState<StudentEnrollment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'CASH' as 'CASH' | 'ONLINE' | 'CHEQUE',
    remarks: '',
    paymentItems: {} as Record<string, number>
  })

  useEffect(() => {
    fetchEnrollments()
  }, [academicYear])

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchEnrollments = useCallback(async () => {
    try {
      const url = academicYear 
        ? `/api/enrollments?academicYearId=${academicYear.id}`
        : '/api/enrollments'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments || [])
      } else {
        toast.error('Failed to fetch enrollments')
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      toast.error('Error fetching enrollments')
    } finally {
      setLoading(false)
    }
  }, [academicYear])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      if (response.ok) {
        const data = await response.json()
        fetchEnrollments()
      } else {
        toast.error('Failed to fetch payments')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Error fetching payments')
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEnrollment) {
      toast.error('No student selected')
      return
    }

    const paymentItems = Object.entries(paymentForm.paymentItems)
      .filter(([__, amount]) => amount > 0)
      .map(([feeId, amount]) => ({ feeId, amount }))

    if (paymentItems.length === 0) {
      toast.error('Please enter payment amounts')
      return
    }

    const totalAmount = paymentItems.reduce((sum, item) => sum + item.amount, 0)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEnrollmentId: selectedEnrollment.id,
          totalAmount,
          paymentMethod: paymentForm.paymentMethod,
          remarks: paymentForm.remarks,
          paymentItems
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Payment recorded successfully')
        setIsPaymentDialogOpen(false)
        resetPaymentForm()
        fetchEnrollments()
        fetchPayments()
        
        // Show receipt
        setSelectedPayment(data.payment)
        setIsReceiptDialogOpen(true)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Error recording payment')
    }
  }

  const resetPaymentForm = () => {
    setPaymentForm({
      paymentMethod: 'CASH',
      remarks: '',
      paymentItems: {}
    })
    setSelectedEnrollment(null)
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

  // Filter to show only enrollments with due amounts
  const enrollmentsWithDues = filteredEnrollments.filter(
    enrollment => enrollment.totals.netAmount.due > 0
  )

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading payment data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-green-600" />
            Fee Collection
          </h1>
          <p className="text-muted-foreground">Collect student fees with flexible payment options</p>
          {academicYear && (
            <div className="flex items-center mt-2">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm font-medium">Academic Year: {academicYear.year}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {enrollmentsWithDues.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  {searchTerm ? 'No students found matching your search.' : 'No pending fees found.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  All students have paid their fees for this academic year.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          enrollmentsWithDues.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
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
                    <Badge className={statusColors[enrollment.feeStatus.status as keyof typeof statusColors]}>
                      {enrollment.feeStatus.status}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedEnrollment(enrollment)
                      setIsPaymentDialogOpen(true)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Collect Fee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      Fee Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Fees</span>
                        <span>₹{enrollment.totals.fees.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scholarships</span>
                        <span className="text-green-600">-₹{enrollment.totals.scholarships.applied.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Net Amount</span>
                        <span>₹{enrollment.totals.netAmount.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Payment Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="text-green-600">₹{enrollment.totals.netAmount.paid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due</span>
                        <span className="text-red-600 font-bold">₹{enrollment.totals.netAmount.due.toFixed(2)}</span>
                      </div>
                      {enrollment.feeStatus.overdueAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Overdue</span>
                          <span className="text-red-600">₹{enrollment.feeStatus.overdueAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Fee Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      {enrollment.fees.filter(fee => fee.amountDue > 0).slice(0, 3).map((fee, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-muted-foreground truncate">{fee.templateName}</span>
                          <span className="text-red-600">₹{fee.amountDue.toFixed(2)}</span>
                        </div>
                      ))}
                      {enrollment.fees.filter(fee => fee.amountDue > 0).length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{enrollment.fees.filter(fee => fee.amountDue > 0).length - 3} more fees
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => {
        setIsPaymentDialogOpen(open)
        if (!open) resetPaymentForm()
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collect Fee Payment</DialogTitle>
            {selectedEnrollment && (
              <p className="text-muted-foreground">
                {selectedEnrollment.student.firstName} {selectedEnrollment.student.lastName} - 
                {selectedEnrollment.class.className} {selectedEnrollment.section}
              </p>
            )}
          </DialogHeader>
          
          {selectedEnrollment && (
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Student Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Net Amount</span>
                    <p className="font-bold text-lg">₹{selectedEnrollment.totals.netAmount.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Already Paid</span>
                    <p className="font-semibold text-green-600">₹{selectedEnrollment.totals.netAmount.paid.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount Due</span>
                    <p className="font-bold text-red-600">₹{selectedEnrollment.totals.netAmount.due.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Fee Items */}
              <div>
                <h4 className="font-semibold mb-3">Select Fees to Pay</h4>
                <div className="space-y-3">
                  {selectedEnrollment.fees.filter(fee => fee.amountDue > 0).map(fee => (
                    <Card key={fee.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{fee.templateName}</p>
                            <div className="text-sm text-muted-foreground">
                              Amount: ₹{fee.amount.toFixed(2)} | 
                              Paid: ₹{fee.amountPaid.toFixed(2)} | 
                              Due: ₹{fee.amountDue.toFixed(2)}
                              {fee.isCompulsory && <Badge className="ml-2">Compulsory</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`fee-${fee.id}`}>₹</Label>
                            <Input
                              id={`fee-${fee.id}`}
                              type="number"
                              value={paymentForm.paymentItems[fee.id] || ''}
                              onChange={(e) => updatePaymentAmount(fee.id, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              max={fee.amountDue}
                              min="0"
                              step="0.01"
                              className="w-24"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updatePaymentAmount(fee.id, fee.amountDue)}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select 
                    value={paymentForm.paymentMethod} 
                    onValueChange={(value: 'CASH' | 'ONLINE' | 'CHEQUE') => setPaymentForm({ ...paymentForm, paymentMethod: value })}
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
                      className="font-bold"
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
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={getTotalPaymentAmount() <= 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Record Payment (₹{getTotalPaymentAmount().toFixed(2)})
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Receipt</span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-bold">BlueMoon School</h3>
                <p className="text-sm text-muted-foreground">Fee Payment Receipt</p>
                <p className="text-sm font-mono">Receipt No: {selectedPayment.receiptNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Student:</strong> {selectedPayment.student.firstName} {selectedPayment.student.lastName}</p>
                  <p><strong>Admission No:</strong> {selectedPayment.student.admissionNumber}</p>
                  <p><strong>Father Name:</strong> {selectedPayment.student.fatherName}</p>
                </div>
                <div>
                  <p><strong>Payment Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                  <p><strong>Payment Method:</strong> {selectedPayment.paymentMethod}</p>
                  <p><strong>Academic Year:</strong> {selectedPayment.academicYear.year}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Payment Details</h4>
                <div className="space-y-2">
                  {selectedPayment.paymentItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.feeTemplateName}</span>
                      <span>₹{item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Amount Paid</span>
                    <span>₹{selectedPayment.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.remarks && (
                <div>
                  <h4 className="font-semibold mb-1">Remarks</h4>
                  <p className="text-sm text-muted-foreground">{selectedPayment.remarks}</p>
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>Thank you for your payment!</p>
                <p>Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}