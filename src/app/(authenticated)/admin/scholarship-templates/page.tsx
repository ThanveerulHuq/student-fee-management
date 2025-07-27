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
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

type ScholarshipType = 'MERIT' | 'NEED_BASED' | 'GOVERNMENT' | 'SPORTS' | 'MINORITY' | 'GENERAL'

interface ScholarshipTemplate {
  id: string
  name: string
  description?: string
  type: ScholarshipType
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

const typeColors = {
  MERIT: 'bg-yellow-100 text-yellow-800',
  NEED_BASED: 'bg-blue-100 text-blue-800',
  GOVERNMENT: 'bg-green-100 text-green-800',
  SPORTS: 'bg-orange-100 text-orange-800',
  MINORITY: 'bg-purple-100 text-purple-800',
  GENERAL: 'bg-gray-100 text-gray-800'
}

const typeLabels = {
  MERIT: 'Merit Based',
  NEED_BASED: 'Need Based',
  GOVERNMENT: 'Government',
  SPORTS: 'Sports',
  MINORITY: 'Minority',
  GENERAL: 'General'
}

export default function ScholarshipTemplatesPage() {
  const [templates, setTemplates] = useState<ScholarshipTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ScholarshipTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '' as ScholarshipType,
    order: 0
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/scholarship-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      } else {
        toast.error('Failed to fetch scholarship templates')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error fetching scholarship templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type) {
      toast.error('Name and type are required')
      return
    }

    try {
      const url = editingTemplate 
        ? `/api/admin/scholarship-templates/${editingTemplate.id}`
        : '/api/admin/scholarship-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingTemplate ? 'Scholarship template updated successfully' : 'Scholarship template created successfully')
        handleDialogClose(false)
        fetchTemplates()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save scholarship template')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error saving scholarship template')
    }
  }

  const handleEdit = (template: ScholarshipTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      type: template.type,
      order: template.order
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (template: ScholarshipTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/scholarship-templates/${template.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Scholarship template deleted successfully')
        fetchTemplates()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete scholarship template')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting scholarship template')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '' as ScholarshipType,
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
            <div className="text-lg">Loading scholarship templates...</div>
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
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Scholarship Templates</h1>
                <p className="text-gray-600 text-sm">Manage scholarship types that can be applied to students</p>
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
                      {editingTemplate ? 'Edit Scholarship Template' : 'Create Scholarship Template'}
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
                        placeholder="e.g., Merit Scholarship, Sports Scholarship"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type *</Label>
                      <Select value={formData.type} onValueChange={(value: ScholarshipType) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select scholarship type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MERIT">Merit Based</SelectItem>
                          <SelectItem value="NEED_BASED">Need Based</SelectItem>
                          <SelectItem value="GOVERNMENT">Government</SelectItem>
                          <SelectItem value="SPORTS">Sports</SelectItem>
                          <SelectItem value="MINORITY">Minority</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description of the scholarship"
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
                <Award className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No scholarship templates found</h3>
              <p className="text-gray-600 mb-4 text-sm max-w-sm mx-auto">
                Create scholarship templates to offer different types of financial assistance to students.
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
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-yellow-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <Badge className={`${typeColors[template.type]} text-xs`}>
                              {typeLabels[template.type]}
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