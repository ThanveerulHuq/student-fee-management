import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/scholarship-templates/[id] - Get specific scholarship template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const template = await prisma.scholarshipTemplate.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Scholarship template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching scholarship template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scholarship template' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/scholarship-templates/[id] - Update scholarship template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { name, description, type, order, isActive } = body

    // Check if template exists
    const existingTemplate = await prisma.scholarshipTemplate.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Scholarship template not found' },
        { status: 404 }
      )
    }

    // Check if name conflicts with another template
    if (name && name !== existingTemplate.name) {
      const nameConflict = await prisma.scholarshipTemplate.findUnique({
        where: { name }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Scholarship template with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updatedTemplate = await prisma.scholarshipTemplate.update({
      where: { id: resolvedParams.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating scholarship template:', error)
    return NextResponse.json(
      { error: 'Failed to update scholarship template' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/scholarship-templates/[id] - Delete scholarship template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    // Check if template exists
    const existingTemplate = await prisma.scholarshipTemplate.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Scholarship template not found' },
        { status: 404 }
      )
    }

    // Instead of hard delete, mark as inactive
    const deletedTemplate = await prisma.scholarshipTemplate.update({
      where: { id: resolvedParams.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'Scholarship template deactivated successfully',
      template: deletedTemplate
    })
  } catch (error) {
    console.error('Error deleting scholarship template:', error)
    return NextResponse.json(
      { error: 'Failed to delete scholarship template' },
      { status: 500 }
    )
  }
}