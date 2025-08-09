"use client"

import { User, Phone, MapPin, Star, MessageCircle } from "lucide-react"
import { MobileNumber } from "@/generated/prisma"

interface Student {
  fatherName: string
  motherName: string
  mobileNumbers: Array<MobileNumber>
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
        {student.mobileNumbers.map((mobileNumber, index) => (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mobile Number {index + 1}</label>
            <div className="flex items-center space-x-2 mt-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 font-mono">{mobileNumber.number}</p>
              {mobileNumber.isPrimary && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
              {mobileNumber.isWhatsApp && (
                <MessageCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}