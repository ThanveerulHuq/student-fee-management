"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Phone, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { type StudentFormData } from "@/lib/validations/student"

interface FamilyInfoStepProps {
  loading: boolean
}

export default function FamilyInfoStep({ loading }: FamilyInfoStepProps) {
  const { register, formState: { errors } } = useFormContext<StudentFormData>()
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 -mx-8 -mt-8 mb-8 p-6 rounded-t-2xl">
        <h2 className="flex items-center space-x-2 text-green-900 text-lg font-semibold">
          <Users className="h-5 w-5" />
          <span>Family Information</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-none">
          {/* Father's Name */}
          <div className="space-y-2">
            <Label htmlFor="fatherName" className="text-sm font-medium text-gray-700">
              Father&apos;s Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fatherName"
                {...register("fatherName")}
                disabled={loading}
                placeholder="Enter father's full name"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500",
                  errors.fatherName ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.fatherName && (
              <p className="text-sm text-red-600">{errors.fatherName.message}</p>
            )}
          </div>

          {/* Mother's Name */}
          <div className="space-y-2">
            <Label htmlFor="motherName" className="text-sm font-medium text-gray-700">
              Mother&apos;s Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="motherName"
                {...register("motherName")}
                disabled={loading}
                placeholder="Enter mother's full name"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500",
                  errors.motherName ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.motherName && (
              <p className="text-sm text-red-600">{errors.motherName.message}</p>
            )}
          </div>

          {/* Primary Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobileNo1" className="text-sm font-medium text-gray-700">
              Primary Mobile *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="mobileNo1"
                {...register("mobileNo1")}
                disabled={loading}
                placeholder="10 digit mobile number"
                type="tel"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500",
                  errors.mobileNo1 ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.mobileNo1 && (
              <p className="text-sm text-red-600">{errors.mobileNo1.message}</p>
            )}
          </div>

          {/* Secondary Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobileNo2" className="text-sm font-medium text-gray-700">
              Secondary Mobile
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="mobileNo2"
                {...register("mobileNo2")}
                disabled={loading}
                placeholder="10 digit mobile number (optional)"
                type="tel"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500",
                  errors.mobileNo2 ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.mobileNo2 && (
              <p className="text-sm text-red-600">{errors.mobileNo2.message}</p>
            )}
          </div>
        </div>
      </div>
  )
}