"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Edit3, 
  Check, 
  X, 
  IndianRupee, 
  Lock,
  Unlock,
  RotateCcw
} from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { FeeItem } from "@/types/fee"

interface FeeItemCardProps {
  item: FeeItem
  customAmount?: number
  onAmountChange: (templateId: string, amount: number) => void
  disabled?: boolean
}

export default function FeeItemCard({
  item,
  customAmount,
  onAmountChange,
  disabled = false
}: FeeItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const finalAmount = customAmount !== undefined && item.isEditableDuringEnrollment 
    ? customAmount 
    : item.amount

  useEffect(() => {
    if (customAmount !== undefined && customAmount !== item.amount) {
      setHasChanges(true)
    } else {
      setHasChanges(false)
    }
  }, [customAmount, item.amount])

  const handleEdit = () => {
    setEditValue(finalAmount.toString())
    setIsEditing(true)
    setError("")
    // Focus input after state update
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const validateInput = (value: string): boolean => {
    if (value === "") return true // Allow empty for reset to default
    
    const numValue = Number(value)
    if (isNaN(numValue)) {
      setError("Please enter a valid number")
      return false
    }
    
    if (numValue < 0) {
      setError("Amount cannot be negative")
      return false
    }
    
    if (numValue > 1000000) {
      setError("Amount cannot exceed ₹10,00,000")
      return false
    }
    
    setError("")
    return true
  }

  const handleSave = () => {
    if (!validateInput(editValue)) return
    
    const newAmount = editValue === "" ? item.amount : Number(editValue)
    onAmountChange(item.templateId, newAmount)
    setIsEditing(false)
    setError("")
  }

  const handleCancel = () => {
    setEditValue("")
    setIsEditing(false)
    setError("")
  }

  const handleReset = () => {
    onAmountChange(item.templateId, item.amount)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      handleSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      handleCancel()
    }
  }

  const handleInputChange = (value: string) => {
    setEditValue(value)
    // Clear error when user starts typing
    if (error) setError("")
  }


  return (
    <Card className={cn(
      "group transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-500 rounded-md bg-blue-50",
      hasChanges && "border-l-4 border-l-amber-500 bg-amber-50",
      error && "ring-2 ring-red-500 ring-opacity-50"
    )}>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Left section - Fee info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-gray-900 truncate text-sm">
                {item.templateName}
              </h5>
              {hasChanges && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  Modified
                </Badge>
              )}
            </div>

            {/* Progressive disclosure - show details only when editing or modified */}
            {(isEditing || hasChanges) && (
              <div className="text-xs text-gray-500 mb-1">
                Default: {formatCurrency(item.amount)}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="text-xs text-red-600 mb-1">
                {error}
              </div>
            )}
          </div>

          {/* Right section - Amount and actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Amount display/edit */}
            <div className="text-right">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      ref={inputRef}
                      id={`fee-amount-${item.templateId}`}
                      name={`fee-amount-${item.templateId}`}
                      type="number"
                      min="0"
                      step="1"
                      value={editValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className={cn(
                        "w-24 h-7 pl-6 text-right text-sm",
                        error && "border-red-500 focus:ring-red-500"
                      )}
                      placeholder="0"
                      disabled={disabled}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <IndianRupee className="h-3 w-3 text-gray-600" />
                  <span className={cn(
                    "text-sm font-semibold ml-1",
                    hasChanges ? "text-amber-700" : "text-gray-900"
                  )}>
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
                    disabled={disabled}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  {item.isEditableDuringEnrollment ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleEdit}
                      className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-700"
                      disabled={disabled}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  ) : (
                    <div className="h-6 w-6 flex items-center justify-center">
                      <Lock className="h-3 w-3 text-gray-400" />
                    </div>
                  )}
                  
                  {hasChanges && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleReset}
                      className="h-6 w-6 p-0 hover:bg-gray-100 hover:text-gray-700"
                      disabled={disabled}
                      title="Reset to default"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}