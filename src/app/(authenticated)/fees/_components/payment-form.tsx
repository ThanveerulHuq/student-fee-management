'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Receipt, IndianRupee, CreditCard } from 'lucide-react'
import FeeItem from './fee-item'

interface PaymentFormData {
  paymentMethod: 'CASH' | 'ONLINE' | 'CHEQUE'
  remarks: string
  paymentItems: Record<string, number>
}

interface Fee {
  id: string
  templateName: string
  amount: number
  amountPaid: number
  amountDue: number
}

interface PaymentFormProps {
  fees: Fee[]
  paymentForm: PaymentFormData
  onPaymentFormChange: (form: PaymentFormData) => void
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
  validatePaymentAmount: (feeId: string, amount: number) => string | null
  getTotalPaymentAmount: () => number
  onCancel: () => void
}

export default function PaymentForm({
  fees,
  paymentForm,
  onPaymentFormChange,
  onSubmit,
  submitting,
  validatePaymentAmount,
  getTotalPaymentAmount,
  onCancel
}: PaymentFormProps) {
  const updatePaymentAmount = (feeId: string, amount: number) => {
    onPaymentFormChange({
      ...paymentForm,
      paymentItems: {
        ...paymentForm.paymentItems,
        [feeId]: amount
      }
    })
  }

  const dueFees = fees.filter(fee => (fee.amountDue || 0) > 0)

  return (
    <form onSubmit={onSubmit}>
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
          <div className="space-y-3">
            {dueFees.map(fee => (
              <FeeItem
                key={fee.id}
                fee={fee}
                paymentAmount={paymentForm.paymentItems[fee.id] || 0}
                onAmountChange={(amount) => updatePaymentAmount(fee.id, amount)}
                onFullPayment={() => updatePaymentAmount(fee.id, fee.amountDue || 0)}
                validateAmount={(amount) => validatePaymentAmount(fee.id, amount)}
              />
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="rounded-lg p-4 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h5>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="paymentMethod" className="text-xs text-gray-500 font-medium min-w-fit">Payment Method *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select 
                      value={paymentForm.paymentMethod} 
                      onValueChange={(value: 'CASH' | 'ONLINE' | 'CHEQUE') => 
                        onPaymentFormChange({ ...paymentForm, paymentMethod: value })
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
                    onChange={(e) => onPaymentFormChange({ ...paymentForm, remarks: e.target.value })}
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
              onClick={onCancel}
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
  )
}