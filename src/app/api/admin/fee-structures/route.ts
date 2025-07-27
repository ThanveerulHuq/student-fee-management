import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET /api/admin/fee-structures - List fee structures with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const academicYearId = url.searchParams.get('academicYearId')
    const classId = url.searchParams.get('classId')
    const isActive = url.searchParams.get('isActive')

    const whereClause: Record<string, unknown> = {}
    if (academicYearId) whereClause.academicYearId = academicYearId
    if (classId) whereClause.classId = classId
    if (isActive !== null) whereClause.isActive = isActive === 'true'

    const feeStructures = await prisma.feeStructure.findMany({
      where: whereClause,
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(feeStructures)
  } catch (error) {
    console.error('Error fetching fee structures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee structures' },
      { status: 500 }
    )
  }
}

// POST /api/admin/fee-structures - Create new fee structure
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      academicYearId, 
      classId, 
      name, 
      description, 
      feeItems, 
      scholarshipItems 
    } = body

    // Validate required fields
    if (!academicYearId || !classId || !name) {
      return NextResponse.json(
        { error: 'Academic year, class, and name are required' },
        { status: 400 }
      )
    }

    // Check if fee structure already exists for this academic year and class
    const existingStructure = await prisma.feeStructure.findUnique({
      where: {
        academicYearId_classId: {
          academicYearId,
          classId
        }
      }
    })

    if (existingStructure) {
      return NextResponse.json(
        { error: 'Fee structure already exists for this academic year and class' },
        { status: 409 }
      )
    }

    // Fetch academic year and class info for denormalization
    const [academicYear, classInfo] = await Promise.all([
      prisma.academicYear.findUnique({ where: { id: academicYearId } }),
      prisma.class.findUnique({ where: { id: classId } })
    ])

    if (!academicYear || !classInfo) {
      return NextResponse.json(
        { error: 'Invalid academic year or class' },
        { status: 400 }
      )
    }

    // Process fee items with template data
    const processedFeeItems = await Promise.all(
      (feeItems || []).map(async (item: { templateId: string; amount: number; isCompulsory?: boolean; isEditableDuringEnrollment?: boolean; order?: number }, _) => {
        const template = await prisma.feeTemplate.findUnique({
          where: { id: item.templateId }
        })
        
        if (!template) {
          throw new Error(`Fee template not found: ${item.templateId}`)
        }

        return {
          id: new ObjectId().toString(), // Generate proper MongoDB ObjectID
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

    // Process scholarship items with template data
    const processedScholarshipItems = await Promise.all(
      (scholarshipItems || []).map(async (item: { templateId: string; amount: number; isAutoApplied?: boolean; order?: number }, _) => {
        const template = await prisma.scholarshipTemplate.findUnique({
          where: { id: item.templateId }
        })
        
        if (!template) {
          throw new Error(`Scholarship template not found: ${item.templateId}`)
        }

        return {
          id: new ObjectId().toString(), // Generate proper MongoDB ObjectID
          templateId: item.templateId,
          templateName: template.name,
          templateType: template.type,
          amount: item.amount,
          isAutoApplied: item.isAutoApplied ?? false,
          order: item.order ?? template.order
        }
      })
    )

    // Calculate totals
    const compulsoryTotal = processedFeeItems
      .filter(item => item.isCompulsory)
      .reduce((sum, item) => sum + item.amount, 0)
    
    const optionalTotal = processedFeeItems
      .filter(item => !item.isCompulsory)
      .reduce((sum, item) => sum + item.amount, 0)

    const autoAppliedScholarships = processedScholarshipItems
      .filter(item => item.isAutoApplied)
      .reduce((sum, item) => sum + item.amount, 0)

    const manualScholarships = processedScholarshipItems
      .filter(item => !item.isAutoApplied)
      .reduce((sum, item) => sum + item.amount, 0)

    const feeStructure = await prisma.feeStructure.create({
      data: {
        academicYearId,
        classId,
        name,
        description,
        isActive: true,
        
        // Embedded academic year data
        academicYear: {
          year: academicYear.year,
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
          isActive: academicYear.isActive
        },
        
        // Embedded class data
        class: {
          className: classInfo.className,
          order: classInfo.order,
          isActive: classInfo.isActive
        },
        
        // Fee items
        feeItems: processedFeeItems,
        
        // Scholarship items
        scholarshipItems: processedScholarshipItems,
        
        // Computed totals
        totalFees: {
          compulsory: compulsoryTotal,
          optional: optionalTotal,
          total: compulsoryTotal + optionalTotal
        },
        
        totalScholarships: {
          autoApplied: autoAppliedScholarships,
          manual: manualScholarships,
          total: autoAppliedScholarships + manualScholarships
        }
      }
    })

    return NextResponse.json(feeStructure, { status: 201 })
  } catch (error) {
    console.error('Error creating fee structure:', error)
    return NextResponse.json(
      { error: 'Failed to create fee structure' },
      { status: 500 }
    )
  }
}