"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserMinus, AlertTriangle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface Student {
  id: string
  name: string
  admissionNo: string
  isActive: boolean
  enrollments?: Array<{
    class: { className: string }
    academicYear: { year: string }
  }>
}

interface DeactivateStudentDialogProps {
  student: Student
  isOpen: boolean
  onConfirm: (data: { reason?: string }) => Promise<void>
  onCancel: () => void
}

const DEACTIVATION_REASONS = [
  "Transferred to Another School",
  "Graduated", 
  "Disciplinary Action",
  "Financial Issues",
  "Medical Leave",
  "Other"
] as const

export function DeactivateStudentDialog({
  student,
  isOpen,
  onConfirm,
  onCancel
}: DeactivateStudentDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [customReason, setCustomReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const reason = selectedReason === "Other" ? customReason : selectedReason
      await onConfirm({ reason: reason || undefined })
      
      // Reset form
      setSelectedReason("")
      setCustomReason("")
    } catch (error) {
      console.error("Error deactivating student:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedReason("")
    setCustomReason("")
    onCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserMinus className="h-5 w-5 text-red-600" />
            <span>Deactivate Student</span>
          </DialogTitle>
          <DialogDescription>
            This action will deactivate the student but preserve all academic records and enrollments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Student Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium">{student.name}</div>
            <div className="text-sm text-gray-600">Admission No: {student.admissionNo}</div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Deactivation (Optional)</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason (optional)" />
              </SelectTrigger>
              <SelectContent>
                {DEACTIVATION_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Please specify</Label>
              <Input
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason..."
                maxLength={200}
              />
            </div>
          )}

          {/* Information Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Enrollments will remain active for historical data. 
              The student will be marked as inactive but all academic records will be preserved.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            Deactivate Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}