'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen } from 'lucide-react'

interface FeeItemProps {
  fee: {
    id: string
    templateName: string
    amount: number
    amountPaid: number
    amountDue: number
  }
  paymentAmount: number
  onAmountChange: (amount: number) => void
  onFullPayment: () => void
  validateAmount: (amount: number) => string | null
}

export default function FeeItem({ 
  fee, 
  paymentAmount, 
  onAmountChange, 
  onFullPayment, 
  validateAmount 
}: FeeItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors bg-white">
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
              value={paymentAmount || ''}
              onChange={(e) => {
                const amount = parseFloat(e.target.value) || 0
                const validation = validateAmount(amount)
                if (!validation) {
                  onAmountChange(amount)
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
            onClick={onFullPayment}
            className="h-10 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
            Full
          </Button>
        </div>
      </div>
    </div>
  )
}