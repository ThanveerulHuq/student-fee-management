"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { 
  User, 
  Users, 
  MapPin, 
  Phone, 
  Calendar, 
  IdCard, 
  Globe, 
  Heart, 
  GraduationCap,
  FileText
} from "lucide-react"
import { StudentFormData } from "@/lib/validations/student"

interface ReviewStepProps {
  loading?: boolean
}

export default function ReviewStep({ loading = false }: ReviewStepProps) {
  const form = useFormContext<StudentFormData>()
  const values = form.getValues()

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided"
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "Not provided"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} years`
  }

  const InfoItem = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string
    value: string | undefined
    icon: React.ElementType 
  }) => (
    <div className="flex items-start space-x-3 py-2">
      <Icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="flex-grow">
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className="text-sm text-gray-900 mt-1">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </dd>
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 ${loading ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Review Information</h2>
        </div>
        <p className="text-gray-600">
          Please review all the information below before submitting
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information Card */}
        <Card className="shadow-sm border-blue-100">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="space-y-1">
              <InfoItem 
                label="Admission Number" 
                value={values.admissionNo} 
                icon={IdCard} 
              />
              <InfoItem 
                label="Admission Date" 
                value={formatDate(values.admissionDate)} 
                icon={Calendar} 
              />
              <InfoItem 
                label="Student Name" 
                value={values.name} 
                icon={User} 
              />
              <InfoItem 
                label="Gender" 
                value={values.gender} 
                icon={User} 
              />
              <InfoItem 
                label="Date of Birth" 
                value={formatDate(values.dateOfBirth)} 
                icon={Calendar} 
              />
              <InfoItem 
                label="Age" 
                value={calculateAge(values.dateOfBirth)} 
                icon={Calendar} 
              />
              {values.aadharNo && (
                <InfoItem 
                  label="Aadhar Number" 
                  value={values.aadharNo} 
                  icon={IdCard} 
                />
              )}
              {values.emisNo && (
                <InfoItem 
                  label="EMIS Number" 
                  value={values.emisNo} 
                  icon={IdCard} 
                />
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Family Information Card */}
        <Card className="shadow-sm border-purple-100">
          <CardHeader className="bg-purple-50/50">
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Users className="h-5 w-5" />
              <span>Family Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="space-y-1">
              <InfoItem 
                label="Father's Name" 
                value={values.fatherName} 
                icon={User} 
              />
              <InfoItem 
                label="Mother's Name" 
                value={values.motherName} 
                icon={User} 
              />
              <InfoItem 
                label="Primary Mobile Number" 
                value={values.mobileNo1} 
                icon={Phone} 
              />
              {values.mobileNo2 && (
                <InfoItem 
                  label="Secondary Mobile Number" 
                  value={values.mobileNo2} 
                  icon={Phone} 
                />
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card className="shadow-sm border-green-100">
          <CardHeader className="bg-green-50/50">
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Globe className="h-5 w-5" />
              <span>Additional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="space-y-1">
              <InfoItem 
                label="Community" 
                value={values.community} 
                icon={Users} 
              />
              <InfoItem 
                label="Mother Tongue" 
                value={values.motherTongue} 
                icon={Globe} 
              />
              <InfoItem 
                label="Religion" 
                value={values.religion} 
                icon={Heart} 
              />
              <InfoItem 
                label="Caste" 
                value={values.caste} 
                icon={Users} 
              />
              <InfoItem 
                label="Nationality" 
                value={values.nationality} 
                icon={Globe} 
              />
              <div className="flex items-start space-x-3 py-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-grow">
                  <dt className="text-sm font-medium text-gray-600">Address</dt>
                  <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                    {values.address || <span className="text-gray-400 italic">Not provided</span>}
                  </dd>
                </div>
              </div>
              {values.previousSchool && (
                <InfoItem 
                  label="Previous School" 
                  value={values.previousSchool} 
                  icon={GraduationCap} 
                />
              )}
              {values.remarks && (
                <div className="flex items-start space-x-3 py-2">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <dt className="text-sm font-medium text-gray-600">Remarks</dt>
                    <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                      {values.remarks}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="shadow-sm border-orange-100 bg-orange-50/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-sm font-medium text-orange-700">
                Please verify all information is correct before submitting
              </span>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
            <p className="text-xs text-orange-600">
              You can go back to previous steps to make changes if needed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}