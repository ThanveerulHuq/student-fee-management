import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// POST /api/admin/fee-structures/[id]/copy - Copy fee structure to different academic year/class
export async function POST(
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
    const { academicYearId, classId, name } = body

    // Validate required fields
    if (!academicYearId || !classId) {
      return NextResponse.json(
        { error: 'Academic year and class are required' },
        { status: 400 }
      )
    }

    // Check if source fee structure exists
    const sourceStructure = await prisma.feeStructure.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!sourceStructure) {
      return NextResponse.json(
        { error: 'Source fee structure not found' },
        { status: 404 }
      )
    }

    // Check if target fee structure already exists
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
        { error: 'Fee structure already exists for target academic year and class' },
        { status: 409 }
      )
    }

    // Fetch target academic year and class info for denormalization
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

    // Create new fee structure by copying from source
    const newStructure = await prisma.feeStructure.create({
      data: {
        academicYearId,
        classId,
        name: name || `${classInfo.className} - ${academicYear.year}`,
        description: sourceStructure.description,
        isActive: true,
        
        // Updated academic year data
        academicYear: {
          year: academicYear.year,
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
          isActive: academicYear.isActive
        },
        
        // Updated class data
        class: {
          className: classInfo.className,
          isActive: classInfo.isActive
        },
        
        // Copy fee items (generate new IDs)
        feeItems: sourceStructure.feeItems.map((item, _) => ({
          ...item,
          id: new ObjectId().toString()
        })),
        
        // Copy scholarship items (generate new IDs)
        scholarshipItems: sourceStructure.scholarshipItems.map((item, _) => ({
          ...item,
          id: new ObjectId().toString()
        })),
        
        // Copy computed totals
        totalFees: sourceStructure.totalFees,
        totalScholarships: sourceStructure.totalScholarships
      }
    })

    return NextResponse.json(newStructure, { status: 201 })
  } catch (error) {
    console.error('Error copying fee structure:', error)
    return NextResponse.json(
      { error: 'Failed to copy fee structure' },
      { status: 500 }
    )
  }
}