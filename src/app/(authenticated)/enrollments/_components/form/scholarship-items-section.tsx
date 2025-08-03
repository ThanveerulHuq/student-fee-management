"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save,
  AlertCircle
} from "lucide-react"
import ScholarshipItemCard from "./scholarship-item-card"
import { ScholarshipItem } from "@/types/fee"


interface ScholarshipItemsSectionProps {
  scholarshipItems: ScholarshipItem[]
  customScholarships: Record<string, number>
  onCustomScholarshipsChange: (customScholarships: Record<string, number>) => void
  selectedScholarships?: string[]
  onScholarshipToggle?: (scholarshipId: string, checked: boolean) => void
  disabled?: boolean
  autoSave?: boolean
}

export default function ScholarshipItemsSection({
  scholarshipItems,
  customScholarships,
  onCustomScholarshipsChange,
  selectedScholarships = [],
  onScholarshipToggle,
  disabled = false,
  autoSave = false
}: ScholarshipItemsSectionProps) {
  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)


  const handleAmountChange = useCallback((templateId: string, amount: number) => {
    const newCustomScholarships = { ...customScholarships }
    
    if (amount === scholarshipItems.find(item => item.templateId === templateId)?.amount) {
      // Reset to default - remove from customScholarships
      delete newCustomScholarships[templateId]
    } else {
      newCustomScholarships[templateId] = amount
    }

    if (autoSave) {
      onCustomScholarshipsChange(newCustomScholarships)
    } else {
      setPendingChanges(prev => ({ ...prev, [templateId]: amount }))
      setHasUnsavedChanges(true)
    }
  }, [customScholarships, scholarshipItems, onCustomScholarshipsChange, autoSave])

  const handleSaveChanges = () => {
    const newCustomScholarships = { ...customScholarships }
    
    Object.entries(pendingChanges).forEach(([templateId, amount]) => {
      const defaultAmount = scholarshipItems.find(item => item.templateId === templateId)?.amount
      if (amount === defaultAmount) {
        delete newCustomScholarships[templateId]
      } else {
        newCustomScholarships[templateId] = amount
      }
    })

    onCustomScholarshipsChange(newCustomScholarships)
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
            <span>You have unsaved changes to scholarship amounts.</span>
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

      {/* Scholarship items list - two cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {scholarshipItems
          .sort((a, b) => {
            // Sort by: auto-applied first, then by order, then by name
            if (a.isAutoApplied !== b.isAutoApplied) {
              return a.isAutoApplied ? -1 : 1
            }
            if (a.order !== b.order) {
              return a.order - b.order
            }
            return a.templateName.localeCompare(b.templateName)
          })
          .map((item) => (
            <ScholarshipItemCard
              key={item.id}
              item={item}
              customAmount={customScholarships[item.templateId]}
              onAmountChange={handleAmountChange}
              isSelected={selectedScholarships.includes(item.id!)}
              onToggle={onScholarshipToggle}
              disabled={disabled}
            />
          ))}
      </div>

    </div>
  )
}