import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/database'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import { FeeItem, ScholarshipItem } from '@/types/fee'

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

    await db.connect()
    
    const feeStructures = await db.feeStructure
      .find(whereClause)
      .sort({ createdAt: -1 })
      .lean()
    
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

    await db.connect()

    // Check if fee structure already exists for this academic year and class
    const existingStructure = await db.feeStructure.findOne({
      academicYearId,
      classId
    })

    if (existingStructure) {
      return NextResponse.json(
        { error: 'Fee structure already exists for this academic year and class' },
        { status: 409 }
      )
    }

    // Fetch academic year and class info for denormalization
    const [academicYear, classInfo] = await Promise.all([
      db.academicYear.findById(academicYearId).lean(),
      db.class.findById(classId).lean()
    ])

    if (!academicYear || !classInfo) {
      return NextResponse.json(
        { error: 'Invalid academic year or class' },
        { status: 400 }
      )
    }

    // Process fee items with template data
    const processedFeeItems = await Promise.all(
      (feeItems || []).map(async (item: FeeItem) => {
        const template = await db.feeTemplate.findById(item.templateId).lean()
        
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
      (scholarshipItems || []).map(async (item: ScholarshipItem) => {
        const template = await db.scholarshipTemplate.findById(item.templateId).lean()
        
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
          isEditableDuringEnrollment: item.isEditableDuringEnrollment ?? false,
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

    const feeStructure = await db.feeStructure.create({
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
    })

    return NextResponse.json(feeStructure.toObject(), { status: 201 })
  } catch (error) {
    console.error('Error creating fee structure:', error)
    return NextResponse.json(
      { error: 'Failed to create fee structure' },
      { status: 500 }
    )
  }
}