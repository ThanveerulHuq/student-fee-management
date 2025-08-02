"use client"

import { Badge } from "@/components/ui/badge"
import { IndianRupee, CheckCircle } from "lucide-react"

interface StudentEnrollment {
  fees: Array<{
    id: string
    feeItemId: string
    templateId: string
    templateName: string
    templateCategory: string
    amount: number
    originalAmount: number
    amountPaid: number
    amountDue: number
    isCompulsory: boolean
    isWaived: boolean
    waivedReason?: string
    waivedBy?: string
    waivedDate?: string
    order: number
    recentPayments: Array<{
      paymentId: string
      amount: number
      paymentDate: string
      receiptNo: string
      paymentMethod: string
    }>
  }>
  scholarships: Array<{
    id: string
    scholarshipItemId: string
    templateId: string
    templateName: string
    templateType: string
    amount: number
    originalAmount: number
    isAutoApplied: boolean
    appliedDate: string
    appliedBy: string
    isActive: boolean
    remarks?: string
  }>
  totals: {
    fees: {
      compulsory: number
      optional: number
      total: number
      paid: number
      due: number
    }
    scholarships: {
      applied: number
      autoApplied: number
      manual: number
    }
    netAmount: {
      total: number
      paid: number
      due: number
    }
  }
}

interface FeeDetailsCardProps {
  enrollment: StudentEnrollment
}



export default function FeeDetailsCard({ enrollment }: FeeDetailsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  const sortedFees = [...enrollment.fees].sort((a, b) => a.order - b.order)

  return (
    <div className="bg-white p-4 px-12 border border-gray-200 rounded-lg">
      <div className="flex items-center mb-4">
        <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
          <IndianRupee className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Fee Details</h3>
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Fees</div>
          <div className="text-lg font-bold text-gray-900">₹{enrollment.totals.fees.total.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scholarships</div>
          <div className="text-lg font-bold text-green-600">₹{enrollment.totals.scholarships.applied.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Amount</div>
          <div className="text-lg font-bold text-gray-900">₹{enrollment.totals.netAmount.total.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Balance Due</div>
          <div className="text-lg font-bold text-red-600">₹{enrollment.totals.netAmount.due.toFixed(2)}</div>
        </div>
      </div>

      {/* Fee and Scholarship Items */}
      <div className="space-y-2">
        {/* Fee Items */}
        {sortedFees.map((fee) => (
          <div key={fee.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Fee Name with Status Icon */}
              <div className="flex items-center space-x-2">
                {fee.amountDue <= 0 && (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{fee.templateName}</h4>
                  {fee.isWaived && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs mt-1">
                      Waived
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Scholarships column - empty for fee items */}
              <div></div>
              
              {/* Net Amount - Fee Amount */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">₹{fee.amount.toFixed(2)}</div>
              </div>
              
              {/* Balance Due */}
              <div className="text-center">
                <div className={`text-sm font-medium ${fee.amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{fee.amountDue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Scholarship Items */}
        {enrollment.scholarships.map((scholarship) => (
          <div key={scholarship.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors border-green-200 bg-green-50/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Scholarship Name with Status Icon */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{scholarship.templateName}</h4>
                  <div className="text-xs text-gray-600 mt-1">
                    Applied on {formatDate(scholarship.appliedDate)} by {scholarship.appliedBy}
                  </div>
                </div>
              </div>
              
              {/* Scholarships Amount */}
              <div className="text-center">
                <div className="text-sm font-medium text-green-600">₹{scholarship.amount.toFixed(2)}</div>
              </div>
              
              {/* Net Amount - empty for scholarships */}
              <div></div>
              
              {/* Balance Due - empty for scholarships */}
              <div></div>
            </div>
          </div>
        ))}
      </div>

      {enrollment.fees.length === 0 && enrollment.scholarships.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <IndianRupee className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No fee or scholarship items found for this enrollment</p>
        </div>
      )}
    </div>
  )
}