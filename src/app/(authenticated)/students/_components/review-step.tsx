"use client"

import React, { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  FileText,
  Star,
  MessageCircle,
  Hash
} from "lucide-react"
import { StudentFormData } from "@/lib/validations/student"
import { MobileNumber } from "@/generated/prisma"
import { calculateAge } from "@/lib/utils/age"

interface SiblingInfo {
  id: string
  name: string
  admissionNo: string
}

interface ReviewStepProps {
  loading?: boolean
}

export default function ReviewStep({ loading = false }: ReviewStepProps) {
  const form = useFormContext<StudentFormData>()
  const values = form.getValues()
  const [siblings, setSiblings] = useState<SiblingInfo[]>([])
  const [loadingSiblings, setLoadingSiblings] = useState(false)

  useEffect(() => {
    if (values.siblingIds && values.siblingIds.length > 0) {
      const fetchSiblings = async () => {
        setLoadingSiblings(true)
        try {
          const promises = values.siblingIds.map(async (siblingId) => {
            const response = await fetch(`/api/students/${siblingId}`)
            if (response.ok) {
              const sibling = await response.json()
              return {
                id: sibling.id,
                name: sibling.name,
                admissionNo: sibling.admissionNo
              }
            }
            return null
          })
          
          const results = await Promise.all(promises)
          const validSiblings = results.filter((s): s is SiblingInfo => s !== null)
          setSiblings(validSiblings)
        } catch (error) {
          console.error("Error loading siblings:", error)
        } finally {
          setLoadingSiblings(false)
        }
      }

      fetchSiblings()
    }
  }, [values.siblingIds])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided"
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getFormattedAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "Not provided"
    const age = calculateAge(dateOfBirth)
    return `${age} years`
  }

  const InfoItem = ({ 
    label, 
    value, 
    icon: Icon,
  }: { 
    label: string
    value: string | undefined
    icon: React.ElementType
    isPrimary?: boolean
    isWhatsApp?: boolean
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


  const mobileNumberItem = (mobileNumber: MobileNumber, index: number) => {
    return (<div className="flex items-start space-x-3 py-2">
    <InfoItem 
      label={`Mobile Number ${index + 1}`} 
      value={mobileNumber.number} 
      icon={Phone} 
    />
    <div className="flex items-center space-x-2 mt-2"> 
    {mobileNumber.isPrimary && (
      <Star className="h-4 w-4 text-yellow-500 ml-2" />
    )}
    {mobileNumber.isWhatsApp && (
      <MessageCircle className="h-4 w-4 text-green-500 ml-2" />
    )}
    </div>
    </div>
  )}  

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
      </div>

      {/* Verification Message */}
      <div className="flex items-center justify-center space-x-2 mb-6 p-3 bg-orange-50/50 border border-orange-200 rounded-lg">
        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
        <span className="text-sm font-medium text-orange-700">
          Please verify all information is correct before submitting
        </span>
        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information Card */}
          <Card className="shadow-sm border-blue-100">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
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
                  value={getFormattedAge(values.dateOfBirth)} 
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
                {values.penNumber && (
                  <InfoItem 
                    label="PEN Number" 
                    value={values.penNumber} 
                    icon={Hash} 
                  />
                )}
                {values.udiseNumber && (
                  <InfoItem 
                    label="UDISE Number" 
                    value={values.udiseNumber} 
                    icon={Hash} 
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
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
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
                {values.mobileNumbers?.map((mobileNumber, index) => (
                  mobileNumberItem({ ...mobileNumber, label: mobileNumber.label ?? null }, index)
                ))}
                {/* Sibling Information */}
                {(siblings.length > 0 || loadingSiblings || (values.siblingIds && values.siblingIds.length > 0)) && (
                  <div className="flex items-start space-x-3 py-2 md:col-span-2">
                    <Users className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-grow">
                      <dt className="text-sm font-medium text-gray-600">Siblings Studying in School</dt>
                      <dd className="text-sm text-gray-900 mt-2">
                        {loadingSiblings ? (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                            <span>Loading siblings...</span>
                          </div>
                        ) : siblings.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {siblings.map((sibling) => (
                              <Badge key={sibling.id} variant="outline" className="text-sm">
                                {sibling.name} ({sibling.admissionNo})
                              </Badge>
                            ))}
                          </div>
                        ) : values.siblingIds && values.siblingIds.length > 0 ? (
                          <span className="text-gray-400 italic">Selected but unable to load details</span>
                        ) : (
                          <span className="text-gray-400 italic">No siblings selected</span>
                        )}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Additional Information Card */}
          <Card className="shadow-sm border-green-100">
            <CardHeader className="bg-green-50/50">
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Globe className="h-5 w-5" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
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
                {values.previousSchool && (
                  <InfoItem 
                    label="Previous School" 
                    value={values.previousSchool} 
                    icon={GraduationCap} 
                  />
                )}
                <div className="flex items-start space-x-3 py-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <dt className="text-sm font-medium text-gray-600">Address</dt>
                    <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                      {values.address || <span className="text-gray-400 italic">Not provided</span>}
                    </dd>
                  </div>
                </div>
                {values.remarks && (
                  <div className="flex items-start space-x-3 py-2 md:col-span-2">
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
      </div>

    </div>
  )
}

