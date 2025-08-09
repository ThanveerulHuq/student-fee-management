'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import LoaderWrapper from '@/components/ui/loader-wrapper'
import { trackFeePayment } from '@/lib/analytics'
import { StudentEnrollment } from '@/types/enrollment'
import StudentHeader from '../../_components/student-header'
import PaymentForm from '../../_components/payment-form'
import FeeSummarySidebar from '../../_components/fee-summary-sidebar'

interface PaymentFormData {
  paymentMethod: 'CASH' | 'ONLINE' | 'CHEQUE'
  remarks: string
  paymentItems: Record<string, number>
  paymentDate: Date
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
    paymentItems: {},
    paymentDate: new Date()
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
          paymentItems,
          paymentDate: paymentForm.paymentDate
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
      <StudentHeader 
        enrollment={enrollment} 
        onBack={() => router.push('/fees/collect')} 
      />

      <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <PaymentForm
              fees={enrollment.fees || []}
              paymentForm={paymentForm}
              onPaymentFormChange={setPaymentForm}
              onSubmit={handlePayment}
              submitting={submitting}
              validatePaymentAmount={validatePaymentAmount}
              getTotalPaymentAmount={getTotalPaymentAmount}
              onCancel={() => router.push('/fees/collect')}
            />
          </div>
          
          <div className="lg:col-span-1">
            <FeeSummarySidebar enrollment={enrollment} />
          </div>
        </div>
      </main>
    </div>
  )
}