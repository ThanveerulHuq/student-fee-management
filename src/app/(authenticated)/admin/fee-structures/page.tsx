'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Trash2, 
  Edit, 
  Plus, 
  Copy, 
  Settings, 
  GraduationCap,
  IndianRupee,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface Class {
  id: string
  className: string
  order: number
  isActive: boolean
}

interface FeeTemplate {
  id: string
  name: string
  category: string
  order: number
  isActive: boolean
}

interface ScholarshipTemplate {
  id: string
  name: string
  type: string
  order: number
  isActive: boolean
}

interface FeeItem {
  id?: string
  templateId: string
  templateName?: string
  templateCategory?: string
  amount: number
  isCompulsory: boolean
  isEditableDuringEnrollment: boolean
  order: number
}

interface ScholarshipItem {
  id?: string
  templateId: string
  templateName?: string
  templateType?: string
  amount: number
  isAutoApplied: boolean
  order: number
}

interface FeeStructure {
  id: string
  name: string
  description?: string
  academicYearId: string
  classId: string
  isActive: boolean
  academicYear: {
    year: string
    startDate: string
    endDate: string
    isActive: boolean
  }
  class: {
    className: string
    order: number
    isActive: boolean
  }
  feeItems: FeeItem[]
  scholarshipItems: ScholarshipItem[]
  totalFees: {
    compulsory: number
    optional: number
    total: number
  }
  totalScholarships: {
    autoApplied: number
    manual: number
    total: number
  }
  createdAt: string
  updatedAt: string
}

export default function FeeStructuresPage() {
  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [feeTemplates, setFeeTemplates] = useState<FeeTemplate[]>([])
  const [scholarshipTemplates, setScholarshipTemplates] = useState<ScholarshipTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
  const [expandedStructures, setExpandedStructures] = useState<Set<string>>(new Set())
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicYearId: '',
    classId: '',
    feeItems: [] as FeeItem[],
    scholarshipItems: [] as ScholarshipItem[]
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchStructures()
  }, [selectedAcademicYear])

  // Auto-generate structure name when class and academic year are selected
  useEffect(() => {
    if (formData.classId && formData.academicYearId && !editingStructure) {
      const selectedClass = classes.find(c => c.id === formData.classId)
      const selectedAcademicYearData = academicYears.find(ay => ay.id === formData.academicYearId)
      
      if (selectedClass && selectedAcademicYearData) {
        const generatedName = `${selectedClass.className} - ${selectedAcademicYearData.year}`
        setFormData(prev => ({ ...prev, name: generatedName }))
      }
    }
  }, [formData.classId, formData.academicYearId, classes, academicYears, editingStructure])

  const fetchData = useCallback(async () => {
    try {
      const [academicYearsRes, classesRes, feeTemplatesRes, scholarshipTemplatesRes] = await Promise.all([
        fetch('/api/academic-years'),
        fetch('/api/classes'),
        fetch('/api/admin/fee-templates'),
        fetch('/api/admin/scholarship-templates')
      ])

      if (academicYearsRes.ok) {
        const data = await academicYearsRes.json()
        setAcademicYears(data)
        if (data.length > 0 && !selectedAcademicYear) {
          // Find active academic year first, fallback to first one
          const activeYear = data.find((year: AcademicYear) => year.isActive) || data[0]
          setSelectedAcademicYear(activeYear.id)
        }
      }

      if (classesRes.ok) {
        const data = await classesRes.json()
        setClasses(data)
      }

      if (feeTemplatesRes.ok) {
        const data = await feeTemplatesRes.json()
        setFeeTemplates(data.filter((t: FeeTemplate) => t.isActive))
      }

      if (scholarshipTemplatesRes.ok) {
        const data = await scholarshipTemplatesRes.json()
        setScholarshipTemplates(data.filter((t: ScholarshipTemplate) => t.isActive))
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching data')
    }
  }, [selectedAcademicYear])

  const fetchStructures = useCallback(async () => {
    try {
      const url = selectedAcademicYear 
        ? `/api/admin/fee-structures?academicYearId=${selectedAcademicYear}`
        : '/api/admin/fee-structures'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setStructures(data)
      } else {
        toast.error('Failed to fetch fee structures')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching fee structures')
    } finally {
      setLoading(false)
    }
  }, [selectedAcademicYear])

  const addFeeItem = () => {
    setFormData({
      ...formData,
      feeItems: [
        ...formData.feeItems,
        {
          templateId: '',
          amount: 0,
          isCompulsory: true,
          isEditableDuringEnrollment: false,
          order: formData.feeItems.length + 1
        }
      ]
    })
  }

  const updateFeeItem = (index: number, updates: Partial<FeeItem>) => {
    const newFeeItems = [...formData.feeItems]
    newFeeItems[index] = { ...newFeeItems[index], ...updates }
    
    // Update template name if template changed
    if (updates.templateId) {
      const template = feeTemplates.find(t => t.id === updates.templateId)
      if (template) {
        newFeeItems[index].templateName = template.name
        newFeeItems[index].templateCategory = template.category
      }
    }
    
    setFormData({ ...formData, feeItems: newFeeItems })
  }

  const removeFeeItem = (index: number) => {
    setFormData({
      ...formData,
      feeItems: formData.feeItems.filter((_, i) => i !== index)
    })
  }

  const addScholarshipItem = () => {
    setFormData({
      ...formData,
      scholarshipItems: [
        ...formData.scholarshipItems,
        {
          templateId: '',
          amount: 0,
          isAutoApplied: false,
          order: formData.scholarshipItems.length + 1
        }
      ]
    })
  }

  const updateScholarshipItem = (index: number, updates: Partial<ScholarshipItem>) => {
    const newScholarshipItems = [...formData.scholarshipItems]
    newScholarshipItems[index] = { ...newScholarshipItems[index], ...updates }
    
    // Update template name if template changed
    if (updates.templateId) {
      const template = scholarshipTemplates.find(t => t.id === updates.templateId)
      if (template) {
        newScholarshipItems[index].templateName = template.name
        newScholarshipItems[index].templateType = template.type
      }
    }
    
    setFormData({ ...formData, scholarshipItems: newScholarshipItems })
  }

  const removeScholarshipItem = (index: number) => {
    setFormData({
      ...formData,
      scholarshipItems: formData.scholarshipItems.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.academicYearId || !formData.classId) {
      toast.error('Name, academic year, and class are required')
      return
    }

    if (formData.feeItems.length === 0) {
      toast.error('At least one fee item is required')
      return
    }

    // Validate fee items
    for (const item of formData.feeItems) {
      if (!item.templateId || item.amount < 0) {
        toast.error('All fee items must have a template and valid amount')
        return
      }
    }

    // Validate scholarship items
    for (const item of formData.scholarshipItems) {
      if (!item.templateId || item.amount < 0) {
        toast.error('All scholarship items must have a template and valid amount')
        return
      }
    }

    try {
      const url = editingStructure 
        ? `/api/admin/fee-structures/${editingStructure.id}`
        : '/api/admin/fee-structures'
      
      const method = editingStructure ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingStructure ? 'Fee structure updated successfully' : 'Fee structure created successfully')
        handleDialogClose(false)
        fetchStructures()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save fee structure')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error saving fee structure')
    }
  }

  const handleEdit = (structure: FeeStructure) => {
    setEditingStructure(structure)
    setFormData({
      name: structure.name,
      description: structure.description || '',
      academicYearId: structure.academicYearId,
      classId: structure.classId,
      feeItems: structure.feeItems,
      scholarshipItems: structure.scholarshipItems
    })
    setIsDialogOpen(true)
  }

  const handleCopy = async (structure: FeeStructure) => {
    const academicYear = academicYears.find(ay => ay.id !== structure.academicYearId)
    const className = classes.find(c => c.id !== structure.classId)
    
    if (!academicYear || !className) {
      toast.error('No other academic year or class available for copying')
      return
    }

    try {
      const response = await fetch(`/api/admin/fee-structures/${structure.id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYearId: academicYear.id,
          classId: className.id,
          name: `${className.className} - ${academicYear.year} (Copy)`
        })
      })

      if (response.ok) {
        toast.success('Fee structure copied successfully')
        fetchStructures()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to copy fee structure')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error copying fee structure')
    }
  }

  const handleDelete = async (structure: FeeStructure) => {
    if (!confirm(`Are you sure you want to delete "${structure.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/fee-structures/${structure.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Fee structure deleted successfully')
        fetchStructures()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete fee structure')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting fee structure')
    }
  }

  const resetForm = () => {
    // Find active academic year for default selection
    const activeYear = academicYears.find(year => year.isActive)
    
    setFormData({
      name: '',
      description: '',
      academicYearId: activeYear?.id || '',
      classId: '',
      feeItems: [],
      scholarshipItems: []
    })
    setEditingStructure(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const calculateTotals = () => {
    const compulsoryFees = formData.feeItems
      .filter(item => item.isCompulsory)
      .reduce((sum, item) => sum + item.amount, 0)
    
    const optionalFees = formData.feeItems
      .filter(item => !item.isCompulsory)
      .reduce((sum, item) => sum + item.amount, 0)

    const autoScholarships = formData.scholarshipItems
      .filter(item => item.isAutoApplied)
      .reduce((sum, item) => sum + item.amount, 0)

    const manualScholarships = formData.scholarshipItems
      .filter(item => !item.isAutoApplied)
      .reduce((sum, item) => sum + item.amount, 0)

    return {
      compulsoryFees,
      optionalFees,
      totalFees: compulsoryFees + optionalFees,
      autoScholarships,
      manualScholarships,
      totalScholarships: autoScholarships + manualScholarships,
      netAmount: (compulsoryFees + optionalFees) - (autoScholarships + manualScholarships)
    }
  }

  const totals = calculateTotals()

  const toggleExpanded = (structureId: string) => {
    const newExpanded = new Set(expandedStructures)
    if (newExpanded.has(structureId)) {
      newExpanded.delete(structureId)
    } else {
      newExpanded.add(structureId)
    }
    setExpandedStructures(newExpanded)
  }

  if (loading) {
    return (
      <main className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading fee structures...</div>
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
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Fee Structures</h1>
                <p className="text-gray-600 text-sm">Configure fee structures for classes</p>
              </div>
            </div>
            
            {/* Create Button */}
            <Sheet open={isDialogOpen} onOpenChange={handleDialogClose}>
              <SheetTrigger asChild>
                <Button onClick={() => {setIsDialogOpen(true); resetForm()}} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Fee Structure
                </Button>
              </SheetTrigger>
                              <SheetContent className="overflow-y-auto p-0" style={{ width: '700px', maxWidth: '90vw' }}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                  <SheetHeader className="p-0">
                    <SheetTitle className="text-xl font-semibold text-gray-900">
                      {editingStructure ? 'Edit Fee Structure' : 'Create Fee Structure'}
                    </SheetTitle>
                  </SheetHeader>
                </div>
                
                <div className="px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="academicYear" className="text-sm font-medium text-gray-700">Academic Year *</Label>
                        <Select 
                          value={formData.academicYearId} 
                          onValueChange={(value) => setFormData({ ...formData, academicYearId: value })}
                          disabled={!!editingStructure}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.map(year => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.year} {year.isActive && '(Active)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="class" className="text-sm font-medium text-gray-700">Class *</Label>
                        <Select 
                          value={formData.classId} 
                          onValueChange={(value) => setFormData({ ...formData, classId: value })}
                          disabled={!!editingStructure}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map(cls => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.className}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    </div>

                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Structure Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Class 1 - 2024-25"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Fee Items */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <IndianRupee className="w-5 h-5 mr-2 text-blue-600" />
                        Fee Items
                      </h3>
                      <Button type="button" variant="outline" onClick={addFeeItem} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Fee
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.feeItems.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Fee Template *</Label>
                                <Select 
                                  value={item.templateId} 
                                  onValueChange={(value) => updateFeeItem(index, { templateId: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {feeTemplates.map(template => (
                                      <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-gray-700">Amount *</Label>
                                <Input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => updateFeeItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.isCompulsory}
                                    onCheckedChange={(checked) => updateFeeItem(index, { isCompulsory: checked })}
                                    id={`compulsory-${index}`}
                                  />
                                  <Label htmlFor={`compulsory-${index}`} className="text-sm text-gray-700">
                                    Compulsory
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.isEditableDuringEnrollment}
                                    onCheckedChange={(checked) => updateFeeItem(index, { isEditableDuringEnrollment: checked })}
                                    id={`editable-${index}`}
                                  />
                                  <Label htmlFor={`editable-${index}`} className="text-sm text-gray-700">
                                    Editable during enrollment
                                  </Label>
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFeeItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Scholarship Items */}
                  <div className="bg-green-50 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-green-600" />
                        Scholarship Items
                      </h3>
                      <Button type="button" variant="outline" onClick={addScholarshipItem} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Scholarship
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.scholarshipItems.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Scholarship Template *</Label>
                                <Select 
                                  value={item.templateId} 
                                  onValueChange={(value) => updateScholarshipItem(index, { templateId: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {scholarshipTemplates.map(template => (
                                      <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-gray-700">Amount *</Label>
                                <Input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => updateScholarshipItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={item.isAutoApplied}
                                  onCheckedChange={(checked) => updateScholarshipItem(index, { isAutoApplied: checked })}
                                  id={`auto-apply-${index}`}
                                />
                                <Label htmlFor={`auto-apply-${index}`} className="text-sm text-gray-700">
                                  Auto-apply to all eligible students
                                </Label>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeScholarshipItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-5">Structure Summary</h3>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Total Fees</p>
                        <p className="font-semibold text-lg">₹{totals.totalFees.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Compulsory: ₹{totals.compulsoryFees.toFixed(2)} | 
                          Optional: ₹{totals.optionalFees.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Total Scholarships</p>
                        <p className="font-semibold text-lg text-green-600">-₹{totals.totalScholarships.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Auto: ₹{totals.autoScholarships.toFixed(2)} | 
                          Manual: ₹{totals.manualScholarships.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Net Amount</p>
                        <p className="font-bold text-xl text-blue-600">₹{totals.netAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 mt-8">
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {editingStructure ? 'Update' : 'Create'} Structure
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
          {structures.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No fee structures found</h3>
              <p className="text-gray-600 mb-4 text-sm max-w-sm mx-auto">
                Create fee structures to define fees and scholarships for each class.
              </p>
              <Button onClick={() => { setIsDialogOpen(true); resetForm(); }} className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create First Fee Structure
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {structures.map((structure) => (
                <div key={structure.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  {/* Collapsed Row */}
                  <div className="p-3 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(structure.id)}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          {expandedStructures.has(structure.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <h3 className="font-medium text-gray-900">{structure.name}</h3>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {structure.academicYear.year}
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {structure.class.className}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Fees</div>
                            <div className="font-medium">₹{structure.totalFees.total.toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Scholarships</div>
                            <div className="font-medium text-green-600">-₹{structure.totalScholarships.total.toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Net Amount</div>
                            <div className="font-semibold text-blue-600">₹{(structure.totalFees.total - structure.totalScholarships.total).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {structure.isActive ? (
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
                            <DropdownMenuItem onClick={() => handleEdit(structure)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(structure)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(structure)}
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
                  {expandedStructures.has(structure.id) && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      {structure.description && (
                        <p className="text-sm text-gray-600 mb-4 bg-white p-3 rounded border">{structure.description}</p>
                      )}
                      
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1 text-blue-600" />
                            Fee Items ({structure.feeItems.length})
                          </h4>
                          <div className="space-y-2">
                            {structure.feeItems.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                                <span className="text-gray-700 flex items-center">
                                  {item.templateName}
                                  {item.isCompulsory && <span className="ml-1 text-xs text-red-600">*</span>}
                                </span>
                                <span className="font-medium">₹{item.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Award className="w-4 h-4 mr-1 text-green-600" />
                            Scholarships ({structure.scholarshipItems.length})
                          </h4>
                          <div className="space-y-2">
                            {structure.scholarshipItems.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                                <span className="text-gray-700 flex items-center">
                                  {item.templateName}
                                  {item.isAutoApplied && <span className="ml-1 text-xs text-green-600">(Auto)</span>}
                                </span>
                                <span className="font-medium text-green-600">-₹{item.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
                          <div className="space-y-2 text-sm bg-white p-3 rounded border">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Fees</span>
                              <span className="font-medium">₹{structure.totalFees.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Scholarships</span>
                              <span className="font-medium text-green-600">-₹{structure.totalScholarships.total.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Net Amount</span>
                              <span className="text-blue-600">₹{(structure.totalFees.total - structure.totalScholarships.total).toFixed(2)}</span>
                            </div>
                          </div>
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