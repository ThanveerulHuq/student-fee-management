"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown,
  ChevronRight,
  Info
} from "lucide-react"
import { StudentEnrollment } from '@/types/enrollment'

interface EnrollmentDetailsSectionProps {
  enrollment: StudentEnrollment
}

export default function EnrollmentDetailsSection({ enrollment }: EnrollmentDetailsSectionProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN")
  }

  return (
    <div className="bg-white p-2 px-12 border-b border-gray-200">
      {/* Toggle Button */}
      <button
        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group w-full"
      >
        <Info className="w-4 h-4" />
        <span className="font-medium">Student Details</span>
        {isDetailsExpanded ? (
          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
        ) : (
          <ChevronRight className="w-4 h-4 transition-transform duration-200" />
        )}
      </button>
      
      {/* Expandable Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isDetailsExpanded ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {/* Admission Number */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission Number</span>
              <span className="font-mono font-semibold text-gray-900">#{enrollment.student.admissionNumber}</span>
            </div>
            
            {/* Father's Name */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father's Name</span>
              <span className="font-medium text-gray-900">{enrollment.student.fatherName}</span>
            </div>
            
            {/* Phone Number */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Number</span>
              <span className="font-mono font-medium text-gray-900">{enrollment.student.mobileNo}</span>
            </div>
            
            {/* Enrollment Date */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrollment Date</span>
              <span className="font-medium text-gray-900">{formatDate(enrollment.enrollmentDate)}</span>
            </div>
            
            {/* Student Status */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student Status</span>
              <div>
                <Badge 
                  variant="outline" 
                  className={enrollment.student.status === 'ACTIVE' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                  }
                >
                  {enrollment.student.status}
                </Badge>
              </div>
            </div>
            
            {/* Enrollment ID */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrollment ID</span>
              <span className="font-mono text-xs text-gray-600">{enrollment.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}