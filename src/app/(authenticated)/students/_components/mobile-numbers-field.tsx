"use client"

import * as React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Plus, Trash2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { type StudentFormData, type MobileNumberData } from "@/lib/validations/student"

interface MobileNumbersFieldProps {
  loading: boolean
}

export default function MobileNumbersField({ loading }: MobileNumbersFieldProps) {
  const { register, control, formState: { errors }, watch, setValue, getValues } = useFormContext<StudentFormData>()
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mobileNumbers",
  })

  const mobileNumbers = watch("mobileNumbers") || []

  // Add first mobile number if none exist
  React.useEffect(() => {
    if (fields.length === 0) {
      append({
        number: "",
        isPrimary: true,
        isWhatsApp: false,
        label: "Primary"
      })
    }
  }, [fields.length, append])

  const handleAddMobile = () => {
    if (fields.length < 5) {
      append({
        number: "",
        isPrimary: false,
        isWhatsApp: false,
        label: ""
      })
    }
  }

  const handleRemoveMobile = (index: number) => {
    if (fields.length > 1) {
      const currentValues = getValues("mobileNumbers") || []
      const mobileToRemove = currentValues[index]
      
      // If removing primary mobile, make the first remaining one primary
      if (mobileToRemove?.isPrimary && fields.length > 1) {
        const remainingIndex = index === 0 ? 1 : 0
        setValue(`mobileNumbers.${remainingIndex}.isPrimary`, true)
      }
      
      remove(index)
    }
  }

  const handlePrimaryChange = (index: number, checked: boolean) => {
    if (checked) {
      // Unmark all other mobiles as primary
      const currentValues = getValues("mobileNumbers") || []
      currentValues.forEach((_, i) => {
        setValue(`mobileNumbers.${i}.isPrimary`, i === index)
      })
    } else {
      // Don't allow unmarking if it's the only mobile or all would be unmarked
      const currentValues = getValues("mobileNumbers") || []
      const primaryCount = currentValues.filter(m => m.isPrimary).length
      if (primaryCount <= 1 && currentValues.length > 0) {
        // Keep at least one as primary
        setValue(`mobileNumbers.${index}.isPrimary`, true)
        return
      }
      setValue(`mobileNumbers.${index}.isPrimary`, false)
    }
  }

  const mobileNumbersError = errors.mobileNumbers

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          Mobile Numbers *
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMobile}
          disabled={loading || fields.length >= 5}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Mobile
        </Button>
      </div>

      {/* Global error message */}
      {mobileNumbersError && typeof mobileNumbersError.message === 'string' && (
        <p className="text-sm text-red-600">{mobileNumbersError.message}</p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const mobile = mobileNumbers[index] || {}
          const fieldError = errors.mobileNumbers?.[index]
          
          return (
            <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mobile Number Input */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600">
                    Mobile Number {index === 0 ? '*' : ''}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      {...register(`mobileNumbers.${index}.number`)}
                      disabled={loading}
                      placeholder="10 digit mobile number"
                      type="tel"
                      className={cn(
                        "pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500",
                        fieldError?.number ? "border-red-500 focus:border-red-500" : ""
                      )}
                    />
                  </div>
                  {fieldError?.number && (
                    <p className="text-xs text-red-600">{fieldError.number.message}</p>
                  )}
                </div>

                {/* Label Input */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600">Label</Label>
                  <Select
                    value={mobile.label || ""}
                    onValueChange={(value) => setValue(`mobileNumbers.${index}.label`, value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select label" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primary">Primary</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Controls */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600">Options</Label>
                  <div className="flex flex-col space-y-2">
                    {/* Primary Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`primary-${index}`}
                        checked={mobile.isPrimary || false}
                        onCheckedChange={(checked) => handlePrimaryChange(index, checked === true)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`primary-${index}`}
                        className="text-xs font-medium text-blue-700 cursor-pointer"
                      >
                        Primary
                      </Label>
                    </div>

                    {/* WhatsApp Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`whatsapp-${index}`}
                        checked={mobile.isWhatsApp || false}
                        onCheckedChange={(checked) => setValue(`mobileNumbers.${index}.isWhatsApp`, checked === true)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`whatsapp-${index}`}
                        className="text-xs font-medium text-green-700 cursor-pointer flex items-center"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Label>
                    </div>

                    {/* Remove Button */}
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMobile(index)}
                        disabled={loading}
                        className="text-red-600 hover:bg-red-50 h-6 px-2 self-start"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {fields.length < 5 && (
        <div className="text-xs text-gray-500 text-center py-2">
          You can add up to 5 mobile numbers
        </div>
      )}
    </div>
  )
}