"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX } from "lucide-react"

type StatusValue = 'all' | 'active' | 'inactive'

interface StatusFilterProps {
  value: StatusValue
  onChange: (value: StatusValue) => void
  counts?: {
    total: number
    active: number
    inactive: number
  }
}

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  const filters = [
    {
      value: 'all' as const,
      label: 'All Students',
      icon: Users,
      count: counts?.total || 0,
    },
    {
      value: 'active' as const,
      label: 'Active',
      icon: UserCheck,
      count: counts?.active || 0,
    },
    {
      value: 'inactive' as const,
      label: 'Inactive',
      icon: UserX,
      count: counts?.inactive || 0,
    },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = value === filter.value

        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(filter.value)}
            className="h-9"
          >
            <Icon className="mr-2 h-4 w-4" />
            {filter.label}
            <Badge 
              variant={isActive ? "secondary" : "outline"} 
              className="ml-2 text-xs"
            >
              {filter.count}
            </Badge>
          </Button>
        )
      })}
    </div>
  )
}