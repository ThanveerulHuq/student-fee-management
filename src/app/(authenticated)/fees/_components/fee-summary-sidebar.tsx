'use client'

import { IndianRupee } from 'lucide-react'
import { StudentEnrollment } from '@/types/enrollment'

interface FeeSummarySidebarProps {
  enrollment: StudentEnrollment
}

export default function FeeSummarySidebar({ enrollment }: FeeSummarySidebarProps) {
  return (
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
  )
}