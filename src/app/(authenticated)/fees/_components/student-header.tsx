'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Receipt, CreditCard } from 'lucide-react'
import { StudentEnrollment } from '@/types/enrollment'

interface StudentHeaderProps {
  enrollment: StudentEnrollment
  onBack: () => void
}

export default function StudentHeader({ enrollment, onBack }: StudentHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
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
  )
}