"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronDown, X, Users, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Student {
  id: string
  name: string
  admissionNo: string
  fatherName: string
}

interface MultiSelectStudentsProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  currentStudentId?: string // To exclude current student from selection
  disabled?: boolean
}

export function MultiSelectStudents({
  value = [],
  onChange,
  placeholder = "Select siblings...",
  currentStudentId,
  disabled = false
}: MultiSelectStudentsProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  
  const debouncedSearch = useDebounce(search, 300)

  // Fetch students when search changes
  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setStudents([])
      return
    }

    const fetchStudents = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/students/search?q=${encodeURIComponent(debouncedSearch)}&limit=20`)
        if (response.ok) {
          const data = await response.json()
          // Filter out current student if provided
          const filteredStudents = currentStudentId 
            ? data.students.filter((s: Student) => s.id !== currentStudentId)
            : data.students
          setStudents(filteredStudents)
        }
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [debouncedSearch, currentStudentId])

  // Load selected student details when value changes
  useEffect(() => {
    if (value.length === 0) {
      setSelectedStudents([])
      return
    }

    const loadSelectedStudents = async () => {
      try {
        const promises = value.map(async (studentId) => {
          const response = await fetch(`/api/students/${studentId}`)
          if (response.ok) {
            const student = await response.json()
            return {
              id: student.id,
              name: student.name,
              admissionNo: student.admissionNo,
              fatherName: student.fatherName
            }
          }
          return null
        })
        
        const results = await Promise.all(promises)
        const validStudents = results.filter((s): s is Student => s !== null)
        setSelectedStudents(validStudents)
      } catch (error) {
        console.error("Error loading selected students:", error)
      }
    }

    loadSelectedStudents()
  }, [value])

  const handleSelect = (student: Student) => {
    if (value.includes(student.id)) {
      // Remove from selection
      const newValue = value.filter(id => id !== student.id)
      onChange(newValue)
    } else {
      // Add to selection
      const newValue = [...value, student.id]
      onChange(newValue)
    }
  }

  const handleRemove = (studentId: string) => {
    const newValue = value.filter(id => id !== studentId)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className={cn(value.length === 0 && "text-muted-foreground")}>
                {value.length === 0 
                  ? placeholder 
                  : `${value.length} sibling${value.length === 1 ? '' : 's'} selected`
                }
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search students by name or admission number..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {search.trim().length < 2 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search for students
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="p-6 text-center text-sm">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Searching...</span>
                  </div>
                ) : (
                  <>
                    <CommandGroup>
                      {students.map((student) => (
                        <CommandItem
                          key={student.id}
                          onSelect={() => handleSelect(student)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value.includes(student.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {student.admissionNo} • {student.fatherName}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Students Display */}
      {selectedStudents.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Selected Siblings:</div>
          <div className="flex flex-wrap gap-2">
            {selectedStudents.map((student) => (
              <Badge
                key={student.id}
                variant="outline"
                className="flex items-center space-x-2 py-1 px-2"
              >
                <span>{student.name} ({student.admissionNo})</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(student.id)}
                    className="ml-1 hover:bg-gray-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}