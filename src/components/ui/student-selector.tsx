"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Student {
  id: string
  name: string
  admissionNo: string
  fatherName: string
  mobileNo1: string
  class?: {
    className: string
  }
}

interface StudentSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  showLabel?: boolean
  placeholder?: string
  className?: string
}

export default function StudentSelector({ 
  value, 
  onValueChange, 
  disabled = false,
  showLabel = true,
  placeholder = "Select student",
  className = ""
}: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students?active=true&limit=500')
        if (response.ok) {
          const data = await response.json()
          setStudents(data.students || [])
          setFilteredStudents(data.students || [])
        }
      } catch (error) {
        console.error('Failed to fetch students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.fatherName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [searchQuery, students])

  const selectedStudent = students.find(student => student.id === value)

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && <Label>Student</Label>}
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && <Label htmlFor="student">Student</Label>}
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger id="student">
            <SelectValue>
              {selectedStudent ? (
                <div className="flex items-center justify-between w-full">
                  <span>{selectedStudent.name}</span>
                  <span className="text-sm text-gray-500">
                    ({selectedStudent.admissionNo})
                  </span>
                </div>
              ) : (
                placeholder
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or admission number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? "No students found matching your search" : "No students available"}
                </div>
              ) : (
                <>
                  <SelectItem value="ALL">All Students</SelectItem>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex flex-col items-start">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.admissionNo} • {student.fatherName}
                          {student.class && ` • ${student.class.className}`}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}