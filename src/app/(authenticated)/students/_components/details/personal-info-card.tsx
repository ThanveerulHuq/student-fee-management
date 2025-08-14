"use client"

import { Badge } from "@/components/ui/badge"
import { calculateAge } from "@/lib/utils/age"
import { IStudent } from "@/lib/models"

interface Student {
  id: string
  admissionNo: string
  aadharNo?: string
  emisNo?: string
  penNumber?: string
  udiseNumber?: string
  name: string
  gender: string
  dateOfBirth: string
  age?: number // Make age optional since it's calculated dynamically
  community: string
  motherTongue: string
  religion: string
  caste: string
  nationality: string
  admissionDate: string
  previousSchool?: string
  remarks?: string
}

interface PersonalInfoCardProps {
  student: IStudent
}

export default function PersonalInfoCard({ student }: PersonalInfoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  // Calculate age dynamically from date of birth
  const currentAge = calculateAge(student.dateOfBirth)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Personal Details Card */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${
                    student.gender === 'MALE' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-pink-50 text-pink-700 border-pink-200'
                  }`}
                >
                  {student.gender}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(student.dateOfBirth)} ({currentAge} years)</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission Date</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(student.admissionDate)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Community</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{student.community}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Religion</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{student.religion}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Caste</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{student.caste}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nationality</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{student.nationality}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mother Tongue</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{student.motherTongue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Card */}
      {(student.aadharNo || student.emisNo || student.penNumber || student.udiseNumber || student.previousSchool || student.remarks) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Additional Information</h4>
          <div className="space-y-4">
            {student.aadharNo && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aadhar Number</label>
                <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{student.aadharNo}</p>
              </div>
            )}
            {student.emisNo && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">EMIS Number</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{student.emisNo}</p>
              </div>
            )}
            {student.penNumber && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">PEN Number</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{student.penNumber}</p>
              </div>
            )}
            {student.udiseNumber && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">UDISE Number</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{student.udiseNumber}</p>
              </div>
            )}
            {student.previousSchool && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previous School</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{student.previousSchool}</p>
              </div>
            )}
            {student.remarks && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{student.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}