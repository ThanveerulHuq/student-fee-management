"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Plus, Search, Users } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface StudentsSearchProps {
  searchTerm: string
  includeInactive: boolean
  isSearching: boolean
  onSearchChange: (term: string) => void
  onIncludeInactiveChange: (include: boolean) => void
  onAddStudent: () => void
  totalStudents: number
}

export default function StudentsSearch({ 
  searchTerm,
  includeInactive,
  isSearching,
  onSearchChange,
  onIncludeInactiveChange,
  onAddStudent,
  totalStudents
}: StudentsSearchProps) {
  return (
    <>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {includeInactive ? "All Students" : "Active Students"}
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {totalStudents} {totalStudents === 1 ? 'student' : 'students'} found
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
              <Checkbox
                id="include-inactive"
                checked={includeInactive}
                onCheckedChange={(checked) => onIncludeInactiveChange(checked === true)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300"
              />
              <Label 
                htmlFor="include-inactive" 
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                Include inactive
              </Label>
            </div>
            <Button 
              onClick={onAddStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-8 py-6 bg-white border-b border-gray-100">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by name, admission number, or father&apos;s name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-20 h-13 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-base bg-gray-50/50 focus:bg-white transition-colors"
            />
            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300 bg-white">
                  {3 - searchTerm.length} more
                </Badge>
              </div>
            )}
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500 bg-blue-50/30 px-4 py-2 rounded-lg border border-blue-100">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            <span>Click on any student row to view details and manage their information</span>
          </div>
        </div>
      </div>
    </>
  )
}