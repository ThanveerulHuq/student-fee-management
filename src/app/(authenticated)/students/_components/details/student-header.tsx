"use client"

import { Button } from "@/components/ui/button"
import { IStudent } from "@/lib/models"
import { 
  Edit, 
  UserPlus, 
  UserMinus,
  ArrowLeft
} from "lucide-react"


interface StudentHeaderProps {
  student: IStudent
  onEdit: () => void
  onEnroll: () => void
  onDeactivate: () => void
  onReactivate: () => void
  onBack: () => void
}

export default function StudentHeader({
  student,
  onEdit,
  onEnroll,
  onDeactivate,
  onReactivate,
  onBack
}: StudentHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 p-2"
              title="Back to Students"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student?.name}</h1>
              <p className="text-sm text-gray-600">Student Details • Admission #{student?.admissionNo}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onEnroll}
              className="border-gray-300"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Enroll
            </Button>
            <Button
              variant="outline"
              onClick={onEdit}
              className="border-gray-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {student?.isActive ? (
              <Button
                variant="outline"
                onClick={onDeactivate}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onReactivate}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}