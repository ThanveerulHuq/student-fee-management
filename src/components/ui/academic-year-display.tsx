"use client"

import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"

interface AcademicYearDisplayProps {
  className?: string
  showIcon?: boolean
  variant?: "default" | "secondary" | "outline"
}

export default function AcademicYearDisplay({ 
  className = "", 
  showIcon = true,
  variant = "default"
}: AcademicYearDisplayProps) {
  const { data: session } = useSession()

  if (!session?.user?.academicYear) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <CalendarDays className="h-4 w-4 text-gray-500" />}
      <Badge variant={variant} className="text-sm">
        Academic Year: {session.user.academicYear.year}
      </Badge>
    </div>
  )
}