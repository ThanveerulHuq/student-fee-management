"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
}

interface AcademicYearSelectorProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  showLabel?: boolean
}

export default function AcademicYearSelector({ 
  value, 
  onValueChange, 
  disabled = false,
  showLabel = true
}: AcademicYearSelectorProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await fetch('/api/academic-years')
        if (response.ok) {
          const data = await response.json()
          setAcademicYears(data)
          
          // Auto-select active academic year if no value is set
          if (!value) {
            const activeYear = data.find((year: AcademicYear) => year.isActive)
            if (activeYear) {
              onValueChange(activeYear.id)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch academic years:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAcademicYears()
  }, [value, onValueChange])

  if (loading) {
    return (
      <div className="space-y-2">
        {showLabel && <Label>Academic Year</Label>}
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {showLabel && <Label htmlFor="academic-year">Academic Year</Label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="academic-year">
          <SelectValue placeholder="Select academic year" />
        </SelectTrigger>
        <SelectContent>
          {academicYears.map((year) => (
            <SelectItem key={year.id} value={year.id}>
              {year.year} {year.isActive && "(Active)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}