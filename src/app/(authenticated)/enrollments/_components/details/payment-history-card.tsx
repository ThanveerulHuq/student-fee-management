"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Receipt, ExternalLink, CreditCard } from "lucide-react"

interface PaymentRecord {
  paymentId: string
  amount: number
  paymentDate: string
  receiptNo: string
  paymentMethod: string
  feeTemplateName?: string
}

interface StudentEnrollment {
  id: string
  fees: Array<{
    id: string
    templateName: string
    recentPayments: Array<{
      paymentId: string
      amount: number
      paymentDate: string
      receiptNo: string
      paymentMethod: string
    }>
  }>
}

interface PaymentHistoryCardProps {
  enrollment: StudentEnrollment
}

export default function PaymentHistoryCard({ enrollment }: PaymentHistoryCardProps) {
  // Collect all payments from all fees and deduplicate by paymentId
  const allPayments = new Map<string, PaymentRecord>()
  
  enrollment.fees.forEach(fee => {
    fee.recentPayments.forEach(payment => {
      if (!allPayments.has(payment.paymentId)) {
        allPayments.set(payment.paymentId, {
          ...payment,
          feeTemplateName: fee.templateName
        })
      }
    })
  })

  // Convert to array and sort by payment date (most recent first)
  const payments = Array.from(allPayments.values()).sort((a, b) => 
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'ONLINE':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'CHEQUE':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        <div className="text-center py-6 text-gray-500">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No payments recorded yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        <div className="text-sm text-gray-600">
          {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
        </div>
      </div>

      <div className="space-y-2">
        {payments.map((payment) => (
          <div 
            key={payment.paymentId} 
            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              {/* Left side - Receipt info */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Receipt #{payment.receiptNo}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDate(payment.paymentDate)}
                  </div>
                </div>
              </div>

              {/* Middle - Amount and Method */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-medium text-gray-900 text-sm">
                    ₹{payment.amount.toFixed(2)}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPaymentMethodColor(payment.paymentMethod)}`}
                  >
                    {payment.paymentMethod}
                  </Badge>
                </div>
              </div>

              {/* Right side - View Receipt Link */}
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => {
                    // Open receipt in new tab
                    window.open(`/receipts/${payment.paymentId}`, '_blank')
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Receipt
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {payments.length > 5 && (
        <div className="mt-3 pt-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-blue-600 hover:text-blue-700"
            onClick={() => {
              // Navigate to detailed payment history page
              window.open(`/enrollments/${enrollment.id}/payments`, '_blank')
            }}
          >
            View All Payment History
          </Button>
        </div>
      )}
    </div>
  )
}