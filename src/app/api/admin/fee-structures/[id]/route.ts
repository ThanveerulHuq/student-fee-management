import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import { FeeItem, ScholarshipItem } from '@/types/fee'

// GET /api/admin/fee-structures/[id] - Get specific fee structure
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
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!feeStructure) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(feeStructure)
  } catch (error) {
    console.error('Error fetching fee structure:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee structure' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/fee-structures/[id] - Update fee structure
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
    const { 
      name, 
      description, 
      feeItems, 
      scholarshipItems, 
      isActive 
    } = body

    // Check if fee structure exists
    const existingStructure = await prisma.feeStructure.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingStructure) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    // Update basic fields
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    // Process fee items if provided
    if (feeItems) {
      const processedFeeItems = await Promise.all(
        feeItems.map(async (item: FeeItem) => {
          const template = await prisma.feeTemplate.findUnique({
            where: { id: item.templateId }
          })
          
          if (!template) {
            throw new Error(`Fee template not found: ${item.templateId}`)
          }

          return {
            id: item.id || new ObjectId().toString(),
            templateId: item.templateId,
            templateName: template.name,
            templateCategory: template.category,
            amount: item.amount,
            isCompulsory: item.isCompulsory ?? true,
            isEditableDuringEnrollment: item.isEditableDuringEnrollment ?? false,
            order: item.order ?? template.order
          }
        })
      )

      updateData.feeItems = processedFeeItems

      // Recalculate fee totals
      const compulsoryTotal = processedFeeItems
        .filter(item => item.isCompulsory)
        .reduce((sum, item) => sum + item.amount, 0)
      
      const optionalTotal = processedFeeItems
        .filter(item => !item.isCompulsory)
        .reduce((sum, item) => sum + item.amount, 0)

      updateData.totalFees = {
        compulsory: compulsoryTotal,
        optional: optionalTotal,
        total: compulsoryTotal + optionalTotal
      }
    }

    // Process scholarship items if provided
    if (scholarshipItems) {
      const processedScholarshipItems = await Promise.all(
        scholarshipItems.map(async (item: ScholarshipItem) => {
          const template = await prisma.scholarshipTemplate.findUnique({
            where: { id: item.templateId }
          })
          
          if (!template) {
            throw new Error(`Scholarship template not found: ${item.templateId}`)
          }

          return {
            id: item.id || new ObjectId().toString(),
            templateId: item.templateId,
            templateName: template.name,
            templateType: template.type,
            amount: item.amount,
            isEditableDuringEnrollment: item.isEditableDuringEnrollment,
            isAutoApplied: item.isAutoApplied ?? false,
            order: item.order ?? template.order
          }
        })
      )

      updateData.scholarshipItems = processedScholarshipItems

      // Recalculate scholarship totals
      const autoAppliedScholarships = processedScholarshipItems
        .filter(item => item.isAutoApplied)
        .reduce((sum, item) => sum + item.amount, 0)

      const manualScholarships = processedScholarshipItems
        .filter(item => !item.isAutoApplied)
        .reduce((sum, item) => sum + item.amount, 0)

      updateData.totalScholarships = {
        autoApplied: autoAppliedScholarships,
        manual: manualScholarships,
        total: autoAppliedScholarships + manualScholarships
      }
    }

    const updatedStructure = await prisma.feeStructure.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    return NextResponse.json(updatedStructure)
  } catch (error) {
    console.error('Error updating fee structure:', error)
    return NextResponse.json(
      { error: 'Failed to update fee structure' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/fee-structures/[id] - Delete fee structure
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
    // Check if fee structure exists
    const existingStructure = await prisma.feeStructure.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingStructure) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      )
    }

    // Instead of hard delete, mark as inactive
    const deletedStructure = await prisma.feeStructure.update({
      where: { id: resolvedParams.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'Fee structure deactivated successfully',
      structure: deletedStructure
    })
  } catch (error) {
    console.error('Error deleting fee structure:', error)
    return NextResponse.json(
      { error: 'Failed to delete fee structure' },
      { status: 500 }
    )
  }
}