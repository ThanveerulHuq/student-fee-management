'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Calendar, CalendarDays, Plus, Edit, Trash2, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createAcademicYearSchema, updateAcademicYearSchema } from '@/lib/validations/academic-year'

interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export default function AcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  const [formData, setFormData] = useState({
    year: '',
    startDate: '',
    endDate: '',
    isActive: false,
    description: ''
  })

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  const fetchAcademicYears = useCallback(async () => {
    try {
      const response = await fetch('/api/academic-years')
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(data)
      } else {
        toast.error('Failed to fetch academic years')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching academic years')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const schema = editingYear ? updateAcademicYearSchema : createAcademicYearSchema
      const validatedData = schema.parse(formData)
      
      const url = editingYear 
        ? `/api/academic-years/${editingYear.id}`
        : '/api/academic-years'
      
      const method = editingYear ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      if (response.ok) {
        toast.success(editingYear ? 'Academic year updated successfully' : 'Academic year created successfully')
        handleDialogClose(false)
        fetchAcademicYears()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save academic year')
      }
    } catch (err) {
      console.error(err)
      if (err instanceof Error && 'issues' in err) {
        const zodError = err as { issues: Array<{ message: string }> }
        toast.error(zodError.issues[0]?.message || 'Validation error')
      } else {
        toast.error('Error saving academic year')
      }
    }
  }

  const handleEdit = (academicYear: AcademicYear) => {
    setEditingYear(academicYear)
    setFormData({
      year: academicYear.year,
      startDate: academicYear.startDate.split('T')[0],
      endDate: academicYear.endDate.split('T')[0],
      isActive: academicYear.isActive,
      description: academicYear.description || ''
    })
    setIsDialogOpen(true)
  }

  const handleToggleActive = async (academicYear: AcademicYear) => {
    try {
      const response = await fetch(`/api/academic-years/${academicYear.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: academicYear.year,
          startDate: academicYear.startDate.split('T')[0],
          endDate: academicYear.endDate.split('T')[0],
          isActive: !academicYear.isActive,
          description: academicYear.description
        })
      })

      if (response.ok) {
        toast.success(academicYear.isActive ? 'Academic year deactivated' : 'Academic year activated')
        fetchAcademicYears()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update academic year')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error updating academic year')
    }
  }

  const handleDelete = async (academicYear: AcademicYear) => {
    if (!confirm(`Are you sure you want to delete "${academicYear.year}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/academic-years/${academicYear.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Academic year deleted successfully')
        fetchAcademicYears()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete academic year')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting academic year')
    }
  }

  const resetForm = () => {
    setFormData({
      year: '',
      startDate: '',
      endDate: '',
      isActive: false,
      description: ''
    })
    setEditingYear(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
      setStartDateOpen(false)
      setEndDateOpen(false)
    }
  }

  const toggleExpanded = (yearId: string) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(yearId)) {
      newExpanded.delete(yearId)
    } else {
      newExpanded.add(yearId)
    }
    setExpandedYears(newExpanded)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    return `${diffMonths} months`
  }

  if (loading) {
    return (
      <main className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading academic years...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Academic Years</h1>
                <p className="text-gray-600 text-sm">Manage academic year periods and settings</p>
              </div>
            </div>
            
            {/* Create Button */}
            <Sheet open={isDialogOpen} onOpenChange={handleDialogClose}>
              <SheetTrigger asChild>
                <Button onClick={() => {setIsDialogOpen(true); resetForm()}} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Academic Year
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto p-0" style={{ width: '500px', maxWidth: '90vw' }}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                  <SheetHeader className="p-0">
                    <SheetTitle className="text-xl font-semibold text-gray-900">
                      {editingYear ? 'Edit Academic Year' : 'Create Academic Year'}
                    </SheetTitle>
                  </SheetHeader>
                </div>
                
                <div className="px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="year" className="text-sm font-medium text-gray-700">Academic Year *</Label>
                      <Input
                        id="year"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="e.g., 2024-25"
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: YYYY-YY (e.g., 2024-25)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Start Date *</Label>
                        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !formData.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {formData.startDate ? format(new Date(formData.startDate), "PPP") : "Pick start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={formData.startDate ? new Date(formData.startDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setFormData({ ...formData, startDate: format(date, 'yyyy-MM-dd') })
                                }
                                setStartDateOpen(false)
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">End Date *</Label>
                        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !formData.endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {formData.endDate ? format(new Date(formData.endDate), "PPP") : "Pick end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={formData.endDate ? new Date(formData.endDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setFormData({ ...formData, endDate: format(date, 'yyyy-MM-dd') })
                                }
                                setEndDateOpen(false)
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        id="isActive"
                      />
                      <Label htmlFor="isActive" className="text-sm text-gray-700">
                        Set as active academic year
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description or notes"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 mt-8">
                      <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          {editingYear ? 'Update' : 'Create'} Academic Year
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {academicYears.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No academic years found</h3>
              <p className="text-gray-600 mb-4 text-sm max-w-sm mx-auto">
                Create academic years to organize students and fee structures by year.
              </p>
              <Button onClick={() => { setIsDialogOpen(true); resetForm(); }} className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create First Academic Year
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {academicYears.map((year) => (
                <div key={year.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  {/* Collapsed Row */}
                  <div className="p-3 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(year.id)}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          {expandedYears.has(year.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <h3 className="font-medium text-gray-900">{year.year}</h3>
                            <div className="text-sm text-gray-500">
                              {formatDateRange(year.startDate, year.endDate)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Duration</div>
                            <div className="font-medium">{calculateDuration(year.startDate, year.endDate)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {year.isActive ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Inactive</Badge>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(year)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(year)}>
                              <Switch className="w-4 h-4 mr-2" />
                              {year.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(year)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedYears.has(year.id) && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Details</h4>
                          <div className="space-y-2 text-sm bg-white p-3 rounded border">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Start Date</span>
                              <span className="font-medium">{format(new Date(year.startDate), 'PPP')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">End Date</span>
                              <span className="font-medium">{format(new Date(year.endDate), 'PPP')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration</span>
                              <span className="font-medium">{calculateDuration(year.startDate, year.endDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status</span>
                              <span className={`font-medium ${year.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                                {year.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">System Info</h4>
                          <div className="space-y-2 text-sm bg-white p-3 rounded border">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created</span>
                              <span className="font-medium">{format(new Date(year.createdAt), 'PPP')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Updated</span>
                              <span className="font-medium">{format(new Date(year.updatedAt), 'PPP')}</span>
                            </div>
                          </div>
                          {year.description && (
                            <div className="mt-4">
                              <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded border">{year.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}