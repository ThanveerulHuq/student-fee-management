"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { type StudentFormData } from "@/lib/validations/student"
import MobileNumbersField from "./mobile-numbers-field"

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
      <div className="space-y-8">
        {/* Parent Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Mobile Numbers */}
        <MobileNumbersField loading={loading} />
      </div>
      </div>
  )
}