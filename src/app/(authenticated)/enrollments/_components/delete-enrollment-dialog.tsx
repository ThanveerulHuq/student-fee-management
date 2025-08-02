"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StudentEnrollment {
  id: string
  student: {
    firstName: string
    lastName: string
    admissionNumber: string
  }
  class: {
    className: string
  }
  section: string
}

interface DeleteEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: StudentEnrollment | null
  onConfirm: () => void
  loading?: boolean
}

export function DeleteEnrollmentDialog({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
  loading = false,
}: DeleteEnrollmentDialogProps) {
  if (!enrollment) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Delete Enrollment
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Are you sure you want to delete the enrollment for{" "}
            <span className="font-medium text-gray-900">
              {enrollment.student.firstName} {enrollment.student.lastName}
            </span>{" "}
            (Admission No: {enrollment.student.admissionNumber}) from{" "}
            <span className="font-medium text-gray-900">
              {enrollment.class.className}-{enrollment.section}
            </span>?
          </DialogDescription>
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This will deactivate the enrollment. The student data will be preserved for record-keeping purposes.
            </p>
          </div>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? "Deleting..." : "Delete Enrollment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}