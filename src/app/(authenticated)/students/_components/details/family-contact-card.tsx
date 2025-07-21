"use client"

import { User, Phone, MapPin } from "lucide-react"

interface Student {
  fatherName: string
  motherName: string
  mobileNo1: string
  mobileNo2?: string
  address: string
}

interface FamilyContactCardProps {
  student: Student
}

export default function FamilyContactCard({ student }: FamilyContactCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Family & Contact</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father&apos;s Name</label>
          <p className="text-sm font-medium text-gray-900 mt-1">{student.fatherName}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mother&apos;s Name</label>
          <p className="text-sm font-medium text-gray-900 mt-1">{student.motherName}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Mobile</label>
          <div className="flex items-center space-x-2 mt-1">
            <Phone className="h-4 w-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-900 font-mono">{student.mobileNo1}</p>
          </div>
        </div>
        {student.mobileNo2 && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secondary Mobile</label>
            <div className="flex items-center space-x-2 mt-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 font-mono">{student.mobileNo2}</p>
            </div>
          </div>
        )}
        <div className={student.mobileNo2 ? "md:col-span-2" : "md:col-span-2"}>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
          <div className="flex items-start space-x-2 mt-1">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <p className="text-sm font-medium text-gray-900">{student.address}</p>
          </div>
        </div>
      </div>
    </div>
  )
}