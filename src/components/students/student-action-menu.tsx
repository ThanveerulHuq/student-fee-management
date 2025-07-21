"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, UserMinus, UserPlus, MoreHorizontal } from "lucide-react"

interface Student {
  id: string
  name: string
  admissionNo: string
  isActive: boolean
}

interface StudentActionMenuProps {
  student: Student
  onEdit: () => void
  onDeactivate: () => void
  onReactivate: () => void
}

export function StudentActionMenu({ 
  student, 
  onEdit, 
  onDeactivate, 
  onReactivate 
}: StudentActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {student.isActive && (
          <DropdownMenuItem onClick={() => handleAction(onEdit)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </DropdownMenuItem>
        )}
        
        {student.isActive && <DropdownMenuSeparator />}
        
        {student.isActive ? (
          <DropdownMenuItem 
            onClick={() => handleAction(onDeactivate)}
            className="text-red-600 focus:text-red-600"
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Deactivate Student
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={() => handleAction(onReactivate)}
            className="text-blue-600 focus:text-blue-600"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Reactivate Student
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}