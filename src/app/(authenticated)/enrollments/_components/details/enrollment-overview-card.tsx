"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  User, 
  Calendar, 
  Phone, 
  GraduationCap, 
  Edit,
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { StudentEnrollment } from '@/types/enrollment'

interface EnrollmentOverviewCardProps {
  enrollment: StudentEnrollment
  onEdit?: () => void
}

export default function EnrollmentOverviewCard({ enrollment, onEdit }: EnrollmentOverviewCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN")
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-IN")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Student Information Card */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
        {/* Header with quick actions */}
        <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="h-8">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        {/* Content with tighter spacing */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                  Full Name
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Student's official full name</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {enrollment.student.name}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission Number</label>
                <p className="text-sm font-medium text-gray-900 mt-1 font-mono bg-gray-50 p-1 rounded inline-block">
                  {enrollment.student.admissionNumber}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father's Name</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{enrollment.student.fatherName}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                <div className="flex items-center mt-1 bg-gray-50 p-1.5 rounded w-fit">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-900 font-mono">{enrollment.student.mobileNo}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  {enrollment.student.status === 'ACTIVE' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${
                      enrollment.student.status === 'ACTIVE' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {enrollment.student.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Information Card */}
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Enrollment Details</h3>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Academic Year</label>
            <div className="flex items-center space-x-2 mt-1 bg-gray-50 p-1.5 rounded w-fit">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-900">{enrollment.academicYear.year}</p>
              {enrollment.academicYear.isActive && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  Current
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class & Section</label>
            <p className="text-sm font-medium text-gray-900 mt-1 bg-gray-50 p-1.5 rounded inline-block">
              {enrollment.class.className} - {enrollment.section}
            </p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrollment Date</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(enrollment.enrollmentDate)}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrollment Status</label>
            <div className="flex items-center space-x-2 mt-1">
              {enrollment.isActive ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${
                  enrollment.isActive 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {enrollment.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}