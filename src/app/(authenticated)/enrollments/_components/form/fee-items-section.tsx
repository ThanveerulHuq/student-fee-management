"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save,
  AlertCircle
} from "lucide-react"
import FeeItemCard from "./fee-item-card"
import { FeeItem } from "@/types/fee"

interface FeeItemsSectionProps {
  feeItems: FeeItem[]
  customFees: Record<string, number>
  onCustomFeesChange: (customFees: Record<string, number>) => void
  disabled?: boolean
  autoSave?: boolean
}

export default function FeeItemsSection({
  feeItems,
  customFees,
  onCustomFeesChange,
  disabled = false,
  autoSave = false
}: FeeItemsSectionProps) {
  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)


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


  const handleDiscardChanges = () => {
    setPendingChanges({})
    setHasUnsavedChanges(false)
  }

  return (
    <div className="space-y-4">

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You have unsaved changes to fee amounts.</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleDiscardChanges}>
                Discard
              </Button>
              <Button type="button" size="sm" onClick={handleSaveChanges}>
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
            <FeeItemCard
              key={item.id}
              item={item}
              customAmount={customFees[item.templateId]}
              onAmountChange={handleAmountChange}
              disabled={disabled}
            />
          ))}
      </div>

    </div>
  )
}