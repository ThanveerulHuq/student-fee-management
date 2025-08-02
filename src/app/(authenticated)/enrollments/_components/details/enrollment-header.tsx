"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  IndianRupee,
  ArrowLeft,
  GraduationCap
} from "lucide-react"

interface StudentEnrollment {
  id: string
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
    startDate: string
    endDate: string
    isActive: boolean
  }
  class: {
    className: string
    order: number
    isActive: boolean
  }
  feeStatus: {
    status: string
    overdueAmount: number
  }
}

interface EnrollmentHeaderProps {
  enrollment: StudentEnrollment
  onEdit: () => void
  onCollectFees: () => void
  onBack: () => void
}

const statusColors = {
  PAID: 'bg-green-100 text-green-800 border-green-200',
  PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OVERDUE: 'bg-red-100 text-red-800 border-red-200',
  WAIVED: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function EnrollmentHeader({
  enrollment,
  onEdit,
  onCollectFees,
  onBack
}: EnrollmentHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Primary Info + Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 p-2"
              title="Back to Enrollments"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
              {/* Student Name */}
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {enrollment.student.firstName} {enrollment.student.lastName}
                </h1>
              </div>
              
              {/* Class & Section and Academic Year */}
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Class:</span>
                  <span className="font-semibold text-gray-900">{enrollment.class.className} - {enrollment.section}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Year:</span>
                  <span className="font-semibold text-gray-900">{enrollment.academicYear.year}</span>
                  {enrollment.academicYear.isActive && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3 lg:flex-shrink-0">
            <Button
              variant="outline"
              onClick={onCollectFees}
              className="border-green-300 text-green-600 hover:bg-green-50"
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              Collect Fees
            </Button>
            <Button
              variant="outline"
              onClick={onEdit}
              className="border-gray-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}