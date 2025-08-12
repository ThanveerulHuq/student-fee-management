"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, RotateCcw } from "lucide-react"
import { StudentEnrollmentWithTotals } from '@/types/enrollment'

interface ReactivateStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: StudentEnrollmentWithTotals | null
  onConfirm: () => Promise<void>
  loading: boolean
}

export function ReactivateStudentDialog({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
  loading
}: ReactivateStudentDialogProps) {
  if (!enrollment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-600" />
            Reactivate Enrollment
          </DialogTitle>
          <DialogDescription>
            This will reactivate the enrollment and mark the student as active.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <RotateCcw className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Student Information</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="font-medium">Name:</span> {enrollment.student.name}</p>
                  <p><span className="font-medium">Admission No:</span> {enrollment.student.admissionNumber}</p>
                  <p><span className="font-medium">Father's Name:</span> {enrollment.student.fatherName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-600 mt-0.5">⚠️</div>
              <div className="flex-1 text-sm text-amber-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>The enrollment and student will be marked as active</li>
                  <li>Student will become available for fee collection and reports</li>
                  <li>All previous enrollment data will remain unchanged</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reactivating...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivate Enrollment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}