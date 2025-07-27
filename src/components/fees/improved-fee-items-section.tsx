"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  IndianRupee, 
  RotateCcw, 
  Save,
  AlertCircle
} from "lucide-react"
import ImprovedFeeItemCard from "./improved-fee-item-card"

interface FeeItem {
  id: string
  templateId: string
  templateName: string
  templateCategory: string
  amount: number
  isCompulsory: boolean
  isEditableDuringEnrollment: boolean
  order: number
}

interface ImprovedFeeItemsSectionProps {
  feeItems: FeeItem[]
  customFees: Record<string, number>
  onCustomFeesChange: (customFees: Record<string, number>) => void
  disabled?: boolean
  autoSave?: boolean
}

export default function ImprovedFeeItemsSection({
  feeItems,
  customFees,
  onCustomFeesChange,
  disabled = false,
  autoSave = false
}: ImprovedFeeItemsSectionProps) {
  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Calculate totals
  const totals = feeItems.reduce((acc, item) => {
    const finalAmount = customFees[item.templateId] !== undefined 
      ? customFees[item.templateId] 
      : item.amount
    
    if (item.isCompulsory) {
      acc.compulsory += finalAmount
    } else {
      acc.optional += finalAmount
    }
    acc.total += finalAmount
    return acc
  }, { compulsory: 0, optional: 0, total: 0 })

  const defaultTotal = feeItems.reduce((sum, item) => sum + item.amount, 0)
  const hasModifications = Object.keys(customFees).length > 0
  

  const handleAmountChange = useCallback((templateId: string, amount: number) => {
    const newCustomFees = { ...customFees }
    
    if (amount === feeItems.find(item => item.templateId === templateId)?.amount) {
      // Reset to default - remove from customFees
      delete newCustomFees[templateId]
    } else {
      newCustomFees[templateId] = amount
    }

    if (autoSave) {
      onCustomFeesChange(newCustomFees)
    } else {
      setPendingChanges(prev => ({ ...prev, [templateId]: amount }))
      setHasUnsavedChanges(true)
    }
  }, [customFees, feeItems, onCustomFeesChange, autoSave])

  const handleSaveChanges = () => {
    const newCustomFees = { ...customFees }
    
    Object.entries(pendingChanges).forEach(([templateId, amount]) => {
      const defaultAmount = feeItems.find(item => item.templateId === templateId)?.amount
      if (amount === defaultAmount) {
        delete newCustomFees[templateId]
      } else {
        newCustomFees[templateId] = amount
      }
    })

    onCustomFeesChange(newCustomFees)
    setPendingChanges({})
    setHasUnsavedChanges(false)
  }

  const handleResetAll = () => {
    onCustomFeesChange({})
    setPendingChanges({})
    setHasUnsavedChanges(false)
  }

  const handleDiscardChanges = () => {
    setPendingChanges({})
    setHasUnsavedChanges(false)
  }

  const editableItemsCount = feeItems.filter(item => item.isEditableDuringEnrollment).length
  const modifiedItemsCount = Object.keys(customFees).length

  return (
    <div className="space-y-4">
      {/* Simple header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold flex items-center">
          <IndianRupee className="h-5 w-5 mr-2" />
          Fee Items
        </h4>
        {modifiedItemsCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {modifiedItemsCount} modified
          </Badge>
        )}
      </div>

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You have unsaved changes to fee amounts.</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleDiscardChanges}>
                Discard
              </Button>
              <Button size="sm" onClick={handleSaveChanges}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Fee items list - two cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {feeItems
          .sort((a, b) => {
            // Sort by: compulsory first, then by order, then by name
            if (a.isCompulsory !== b.isCompulsory) {
              return a.isCompulsory ? -1 : 1
            }
            if (a.order !== b.order) {
              return a.order - b.order
            }
            return a.templateName.localeCompare(b.templateName)
          })
          .map((item) => (
            <ImprovedFeeItemCard
              key={item.id}
              item={item}
              customAmount={customFees[item.templateId]}
              onAmountChange={handleAmountChange}
              disabled={disabled}
            />
          ))}
      </div>

      {/* Action buttons */}
      {hasModifications && (
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            disabled={disabled}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All to Default
          </Button>
        </div>
      )}
    </div>
  )
}