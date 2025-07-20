"use client"

import { Control, FieldErrors, UseFormRegister, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Calendar as CalendarIcon, CreditCard, Hash, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { type StudentFormData } from "@/lib/validations/student"

interface BasicInfoStepProps {
  register: UseFormRegister<StudentFormData>
  control: Control<StudentFormData>
  errors: FieldErrors<StudentFormData>
  loading: boolean
}

export default function BasicInfoStep({ register, control, errors, loading }: BasicInfoStepProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <User className="h-5 w-5" />
          <span>Basic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admission Number */}
          <div className="space-y-2">
            <Label htmlFor="admissionNo" className="text-sm font-medium text-gray-700">
              Admission Number *
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="admissionNo"
                {...register("admissionNo")}
                disabled={loading}
                placeholder="Enter admission number"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500",
                  errors.admissionNo ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.admissionNo && (
              <p className="text-sm text-red-600 flex items-center">
                {errors.admissionNo.message}
              </p>
            )}
          </div>

          {/* Admission Date */}
          <div className="space-y-2">
            <Label htmlFor="admissionDate" className="text-sm font-medium text-gray-700">
              Admission Date *
            </Label>
            <Controller
              name="admissionDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all duration-200",
                        !field.value && "text-muted-foreground",
                        errors.admissionDate && "border-red-500"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick admission date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Use local timezone to avoid date shifting
                          const year = date.getFullYear()
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const day = String(date.getDate()).padStart(2, '0')
                          field.onChange(`${year}-${month}-${day}`)
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.admissionDate && (
              <p className="text-sm text-red-600">{errors.admissionDate.message}</p>
            )}
          </div>

          {/* Student Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Student Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                {...register("name")}
                disabled={loading}
                placeholder="Enter student's full name"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500",
                  errors.name ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender *
            </Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={loading}
                >
                  <SelectTrigger
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-blue-500",
                      errors.gender && "border-red-500"
                    )}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Select gender" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
              Date of Birth *
            </Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all duration-200",
                        !field.value && "text-muted-foreground",
                        errors.dateOfBirth && "border-red-500"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick date of birth</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Use local timezone to avoid date shifting
                          const year = date.getFullYear()
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const day = String(date.getDate()).padStart(2, '0')
                          field.onChange(`${year}-${month}-${day}`)
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={1980}
                      toYear={new Date().getFullYear()}
                      defaultMonth={field.value ? new Date(field.value) : new Date(2010, 0)}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Aadhar Number */}
          <div className="space-y-2">
            <Label htmlFor="aadharNo" className="text-sm font-medium text-gray-700">
              Aadhar Number
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="aadharNo"
                {...register("aadharNo")}
                disabled={loading}
                placeholder="12 digit Aadhar number"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500",
                  errors.aadharNo ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.aadharNo && (
              <p className="text-sm text-red-600">{errors.aadharNo.message}</p>
            )}
          </div>

          {/* EMIS Number */}
          <div className="space-y-2">
            <Label htmlFor="emisNo" className="text-sm font-medium text-gray-700">
              EMIS Number
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="emisNo"
                {...register("emisNo")}
                disabled={loading}
                placeholder="Educational Management System ID"
                className={cn(
                  "pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500",
                  errors.emisNo ? "border-red-500 focus:border-red-500" : ""
                )}
              />
            </div>
            {errors.emisNo && (
              <p className="text-sm text-red-600">{errors.emisNo.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}