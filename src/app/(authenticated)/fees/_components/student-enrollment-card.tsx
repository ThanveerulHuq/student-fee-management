'use client'

import { Card, CardContent } from '@/components/ui/card'
import { User, BookOpen, CreditCard } from 'lucide-react'
import { StudentEnrollmentBasic } from '@/types/enrollment'

interface StudentEnrollmentCardProps {
  enrollment: StudentEnrollmentBasic
  onClick: () => void
}

export default function StudentEnrollmentCard({ enrollment, onClick }: StudentEnrollmentCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200 border-2 hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {enrollment.student.name}
              </h4>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>Father: {enrollment.student.fatherName}</span>
                <span className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {enrollment.class.className} - {enrollment.section}
                </span>
              </div>
            </div>
          </div>
          <div className="text-green-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}