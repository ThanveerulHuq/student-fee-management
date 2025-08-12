"use client"

import { useState, useEffect } from "react"
import { User, Phone, MapPin, Star, MessageCircle, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MobileNumber } from "@/generated/prisma"

interface Student {
  fatherName: string
  motherName: string
  mobileNumbers: Array<MobileNumber>
  address: string
  siblingIds: string[]
}

interface SiblingInfo {
  id: string
  name: string
  admissionNo: string
}

interface FamilyContactCardProps {
  student: Student
}

export default function FamilyContactCard({ student }: FamilyContactCardProps) {
  const [siblings, setSiblings] = useState<SiblingInfo[]>([])
  const [loadingSiblings, setLoadingSiblings] = useState(false)

  useEffect(() => {
    if (student.siblingIds && student.siblingIds.length > 0) {
      const fetchSiblings = async () => {
        setLoadingSiblings(true)
        try {
          const promises = student.siblingIds.map(async (siblingId) => {
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
  }, [student.siblingIds])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Family & Contact</h3>
      </div>
      
      {/* Parent Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father&apos;s Name</label>
          <p className="text-sm font-medium text-gray-900 mt-1">{student.fatherName}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mother&apos;s Name</label>
          <p className="text-sm font-medium text-gray-900 mt-1">{student.motherName}</p>
        </div>
      </div>

      {/* Mobile Numbers */}
      <div className="mb-6">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Contact Numbers</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {student.mobileNumbers.map((mobileNumber, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 font-mono">{mobileNumber.number}</p>
              {mobileNumber.label && (
                <Badge variant="outline" className="text-xs">{mobileNumber.label}</Badge>
              )}
              {mobileNumber.isPrimary && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
              {mobileNumber.isWhatsApp && (
                <MessageCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sibling Information */}
      {(siblings.length > 0 || loadingSiblings) && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Users className="h-4 w-4 text-gray-500" />
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Siblings Studying in School</label>
          </div>
          {loadingSiblings ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
              <span>Loading siblings...</span>
            </div>
          ) : siblings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {siblings.map((sibling) => (
                <div key={sibling.id} className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-sm">
                    {sibling.name} ({sibling.admissionNo})
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No siblings found</p>
          )}
        </div>
      )}
    </div>
  )
}