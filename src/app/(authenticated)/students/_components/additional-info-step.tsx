"use client"

import { FieldErrors, UseFormRegister } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Languages, Church, Users2, MapPin, School, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { type StudentFormData } from "@/lib/validations/student"

interface AdditionalInfoStepProps {
  register: UseFormRegister<StudentFormData>
  errors: FieldErrors<StudentFormData>
  loading: boolean
}

export default function AdditionalInfoStep({ register, errors, loading }: AdditionalInfoStepProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
        <CardTitle className="flex items-center space-x-2 text-purple-900">
          <FileText className="h-5 w-5" />
          <span>Additional Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community */}
            <div className="space-y-2">
              <Label htmlFor="community" className="text-sm font-medium text-gray-700">
                Community *
              </Label>
              <div className="relative">
                <Users2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="community"
                  {...register("community")}
                  disabled={loading}
                  placeholder="Enter community"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                    errors.community ? "border-red-500 focus:border-red-500" : ""
                  )}
                />
              </div>
              {errors.community && (
                <p className="text-sm text-red-600">{errors.community.message}</p>
              )}
            </div>

            {/* Mother Tongue */}
            <div className="space-y-2">
              <Label htmlFor="motherTongue" className="text-sm font-medium text-gray-700">
                Mother Tongue *
              </Label>
              <div className="relative">
                <Languages className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="motherTongue"
                  {...register("motherTongue")}
                  disabled={loading}
                  placeholder="Enter mother tongue"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                    errors.motherTongue ? "border-red-500 focus:border-red-500" : ""
                  )}
                />
              </div>
              {errors.motherTongue && (
                <p className="text-sm text-red-600">{errors.motherTongue.message}</p>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Religion */}
            <div className="space-y-2">
              <Label htmlFor="religion" className="text-sm font-medium text-gray-700">
                Religion *
              </Label>
              <div className="relative">
                <Church className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="religion"
                  {...register("religion")}
                  disabled={loading}
                  placeholder="Enter religion"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                    errors.religion ? "border-red-500 focus:border-red-500" : ""
                  )}
                />
              </div>
              {errors.religion && (
                <p className="text-sm text-red-600">{errors.religion.message}</p>
              )}
            </div>

            {/* Caste */}
            <div className="space-y-2">
              <Label htmlFor="caste" className="text-sm font-medium text-gray-700">
                Caste *
              </Label>
              <div className="relative">
                <Users2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="caste"
                  {...register("caste")}
                  disabled={loading}
                  placeholder="Enter caste"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                    errors.caste ? "border-red-500 focus:border-red-500" : ""
                  )}
                />
              </div>
              {errors.caste && (
                <p className="text-sm text-red-600">{errors.caste.message}</p>
              )}
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">
                Nationality *
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="nationality"
                  {...register("nationality")}
                  disabled={loading}
                  placeholder="Enter nationality"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                    errors.nationality ? "border-red-500 focus:border-red-500" : ""
                  )}
                />
              </div>
              {errors.nationality && (
                <p className="text-sm text-red-600">{errors.nationality.message}</p>
              )}
            </div>

            {/* Previous School */}
            <div className="space-y-2">
              <Label htmlFor="previousSchool" className="text-sm font-medium text-gray-700">
                Previous School
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="previousSchool"
                  {...register("previousSchool")}
                  disabled={loading}
                  placeholder="Enter previous school name"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                    errors.previousSchool ? "border-red-500 focus:border-red-500" : ""
                  )}
                />
              </div>
              {errors.previousSchool && (
                <p className="text-sm text-red-600">{errors.previousSchool.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Address *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="address"
                rows={3}
                {...register("address")}
                disabled={loading}
                placeholder="Complete address with landmark"
                className={cn(
                  "pl-10 pt-3 resize-none transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                  errors.address ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
              Remarks
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="remarks"
                rows={3}
                {...register("remarks")}
                disabled={loading}
                placeholder="Additional notes or comments"
                className={cn(
                  "pl-10 pt-3 resize-none transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                  errors.remarks ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.remarks && (
              <p className="text-sm text-red-600">{errors.remarks.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}