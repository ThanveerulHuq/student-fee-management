"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, XCircle } from "lucide-react"

interface StudentStatusBadgeProps {
  student: {
    isActive: boolean
    updatedAt?: string
  }
  showDeactivationInfo?: boolean
}

export function StudentStatusBadge({ student, showDeactivationInfo = false }: StudentStatusBadgeProps) {
  if (student.isActive) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    )
  }

  const badgeContent = (
    <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
      <XCircle className="h-3 w-3 mr-1" />
      Inactive
    </Badge>
  )

  if (showDeactivationInfo && student.updatedAt) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivated: {new Date(student.updatedAt).toLocaleDateString()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}