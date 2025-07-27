'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

import { 
  Trash2, 
  Edit, 
  Plus, 
  MoreHorizontal,
  IndianRupee
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

type FeeCategory = 'REGULAR' | 'OPTIONAL' | 'ACTIVITY' | 'EXAMINATION' | 'LATE_FEE'

interface FeeTemplate {
  id: string
  name: string
  description?: string
  category: FeeCategory
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

const categoryColors = {
  REGULAR: 'bg-blue-100 text-blue-800',
  OPTIONAL: 'bg-green-100 text-green-800',
  ACTIVITY: 'bg-purple-100 text-purple-800',
  EXAMINATION: 'bg-orange-100 text-orange-800',
  LATE_FEE: 'bg-red-100 text-red-800'
}

const categoryLabels = {
  REGULAR: 'Regular',
  OPTIONAL: 'Optional',
  ACTIVITY: 'Activity',
  EXAMINATION: 'Examination',
  LATE_FEE: 'Late Fee'
}

export default function FeeTemplatesPage() {
  const [templates, setTemplates] = useState<FeeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<FeeTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as FeeCategory,
    order: 0
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/fee-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      } else {
        toast.error('Failed to fetch fee templates')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching fee templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category) {
      toast.error('Name and category are required')
      return
    }

    try {
      const url = editingTemplate 
        ? `/api/admin/fee-templates/${editingTemplate.id}`
        : '/api/admin/fee-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingTemplate ? 'Template updated successfully' : 'Template created successfully')
        handleDialogClose(false)
        fetchTemplates()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save template')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error saving template')
    }
  }

  const handleEdit = (template: FeeTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      order: template.order
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (template: FeeTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/fee-templates/${template.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Template deleted successfully')
        fetchTemplates()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete template')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting template')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '' as FeeCategory,
      order: 0
    })
    setEditingTemplate(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  if (loading) {
    return (
      <main className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading fee templates...</div>
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
                <IndianRupee className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Fee Templates</h1>
                <p className="text-gray-600 text-sm">Manage fee types that can be used across the system</p>
              </div>
            </div>
            
            {/* Create Button */}
            <Sheet open={isDialogOpen} onOpenChange={handleDialogClose}>
              <SheetTrigger asChild>
                <Button onClick={() => {setIsDialogOpen(true); resetForm()}} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto p-0" style={{ width: '500px', maxWidth: '90vw' }}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                  <SheetHeader className="p-0">
                    <SheetTitle className="text-xl font-semibold text-gray-900">
                      {editingTemplate ? 'Edit Fee Template' : 'Create Fee Template'}
                    </SheetTitle>
                  </SheetHeader>
                </div>
                
                <div className="px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., School Fee, Transport Fee"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                      <Select value={formData.category} onValueChange={(value: FeeCategory) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REGULAR">Regular</SelectItem>
                          <SelectItem value="OPTIONAL">Optional</SelectItem>
                          <SelectItem value="ACTIVITY">Activity</SelectItem>
                          <SelectItem value="EXAMINATION">Examination</SelectItem>
                          <SelectItem value="LATE_FEE">Late Fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="order" className="text-sm font-medium text-gray-700">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
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
                          {editingTemplate ? 'Update' : 'Create'} Template
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
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <IndianRupee className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No fee templates found</h3>
              <p className="text-gray-600 mb-4 text-sm max-w-sm mx-auto">
                Create fee templates to define standard fee types that can be used across the system.
              </p>
              <Button onClick={() => { setIsDialogOpen(true); resetForm(); }} className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-3 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <IndianRupee className="w-4 h-4 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <Badge className={`${categoryColors[template.category]} text-xs`}>
                              {categoryLabels[template.category]}
                            </Badge>
                            {!template.isActive && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Inactive</Badge>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Order</div>
                            <div className="font-medium">{template.order}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(template)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}