import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/flexible-enrollments/fee-structure - Get fee structure for enrollment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYearId')
    const classId = searchParams.get('classId')

    if (!academicYearId || !classId) {
      return NextResponse.json(
        { error: 'Academic year and class are required' },
        { status: 400 }
      )
    }

    // Get the fee structure for this academic year and class
    const feeStructure = await prisma.feeStructure.findUnique({
      where: {
        academicYearId_classId: {
          academicYearId,
          classId
        }
      }
    })

    if (!feeStructure) {
      return NextResponse.json(
        { error: 'No fee structure found for this academic year and class' },
        { status: 404 }
      )
    }

    if (!feeStructure.isActive) {
      return NextResponse.json(
        { error: 'Fee structure is not active' },
        { status: 400 }
      )
    }

    // Return fee structure with computed summaries
    const response = {
      id: feeStructure.id,
      name: feeStructure.name,
      description: feeStructure.description,
      academicYear: feeStructure.academicYear,
      class: feeStructure.class,
      feeItems: feeStructure.feeItems.map(item => ({
        id: item.id,
        templateId: item.templateId,
        templateName: item.templateName,
        templateCategory: item.templateCategory,
        amount: item.amount,
        isCompulsory: item.isCompulsory,
        isEditableDuringEnrollment: item.isEditableDuringEnrollment,
        order: item.order
      })),
      scholarshipItems: feeStructure.scholarshipItems.map(item => ({
        id: item.id,
        templateId: item.templateId,
        templateName: item.templateName,
        templateType: item.templateType,
        amount: item.amount,
        isAutoApplied: item.isAutoApplied,
        order: item.order
      })),
      totalFees: feeStructure.totalFees,
      totalScholarships: feeStructure.totalScholarships,
      netAmount: feeStructure.totalFees.total - feeStructure.totalScholarships.total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching fee structure for enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee structure' },
      { status: 500 }
    )
  }
}