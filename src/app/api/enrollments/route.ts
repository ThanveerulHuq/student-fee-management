import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET /api/flexible-enrollments - List enrollments with flexible fee structure
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYearId')
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const whereClause: Record<string, unknown> = { isActive: true }
    if (academicYearId) whereClause.academicYearId = academicYearId
    if (classId) whereClause.classId = classId
    if (studentId) whereClause.studentId = studentId

    const [enrollments, total] = await Promise.all([
      prisma.studentEnrollment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.studentEnrollment.count({ where: whereClause })
    ])

    return NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching flexible enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST /api/flexible-enrollments - Create new enrollment with flexible fee structure
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      studentId, 
      academicYearId, 
      classId, 
      section, 
      customFees = {}, 
      selectedScholarships = [] 
    } = body

    // Validate required fields
    if (!studentId || !academicYearId || !classId || !section) {
      return NextResponse.json(
        { error: 'Student, academic year, class, and section are required' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled for this academic year
    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: {
        studentId_academicYearId: {
          studentId,
          academicYearId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this academic year' },
        { status: 409 }
      )
    }

    // Get fee structure for the academic year and class
    const feeStructure = await prisma.feeStructure.findUnique({
      where: {
        academicYearId_classId: {
          academicYearId,
          classId
        }
      }
    })

    if (!feeStructure || !feeStructure.isActive) {
      return NextResponse.json(
        { error: 'No active fee structure found for this academic year and class' },
        { status: 400 }
      )
    }

    // Get student, academic year, and class info for denormalization
    const [student, academicYear, classInfo] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.academicYear.findUnique({ where: { id: academicYearId } }),
      prisma.class.findUnique({ where: { id: classId } })
    ])

    if (!student || !academicYear || !classInfo) {
      return NextResponse.json(
        { error: 'Invalid student, academic year, or class' },
        { status: 400 }
      )
    }

    // Create student fees from fee structure
    const studentFees = feeStructure.feeItems.map((feeItem, _) => {
      const customAmount = customFees[feeItem.templateId]
      const finalAmount = (customAmount !== undefined && feeItem.isEditableDuringEnrollment) 
        ? customAmount 
        : feeItem.amount

      return {
        id: new ObjectId().toString(),
        feeItemId: feeItem.id,
        templateId: feeItem.templateId,
        templateName: feeItem.templateName,
        templateCategory: feeItem.templateCategory,
        amount: finalAmount,
        originalAmount: feeItem.amount,
        amountPaid: 0,
        amountDue: finalAmount,
        isCompulsory: feeItem.isCompulsory,
        isWaived: false,
        order: feeItem.order,
        recentPayments: []
      }
    })

    // Apply scholarships
    const studentScholarships = []
    
    // Auto-apply scholarships
    for (const scholarshipItem of feeStructure.scholarshipItems) {
      if (scholarshipItem.isAutoApplied) {
        studentScholarships.push({
          id: new ObjectId().toString(),
          scholarshipItemId: scholarshipItem.id,
          templateId: scholarshipItem.templateId,
          templateName: scholarshipItem.templateName,
          templateType: scholarshipItem.templateType,
          amount: scholarshipItem.amount,
          originalAmount: scholarshipItem.amount,
          isAutoApplied: true,
          appliedDate: new Date(),
          appliedBy: session.user.username,
          isActive: true
        })
      }
    }

    // Apply manually selected scholarships
    for (const selectedScholarshipId of selectedScholarships) {
      const scholarshipItem = feeStructure.scholarshipItems.find(
        item => item.id === selectedScholarshipId
      )
      
      if (scholarshipItem && !scholarshipItem.isAutoApplied) {
        studentScholarships.push({
          id: new ObjectId().toString(),
          scholarshipItemId: scholarshipItem.id,
          templateId: scholarshipItem.templateId,
          templateName: scholarshipItem.templateName,
          templateType: scholarshipItem.templateType,
          amount: scholarshipItem.amount,
          originalAmount: scholarshipItem.amount,
          isAutoApplied: false,
          appliedDate: new Date(),
          appliedBy: session.user.username,
          isActive: true
        })
      }
    }

    // Calculate totals
    const feeTotals = {
      compulsory: studentFees.filter(f => f.isCompulsory).reduce((sum, f) => sum + f.amount, 0),
      optional: studentFees.filter(f => !f.isCompulsory).reduce((sum, f) => sum + f.amount, 0),
      total: studentFees.reduce((sum, f) => sum + f.amount, 0),
      paid: 0,
      due: studentFees.reduce((sum, f) => sum + f.amount, 0)
    }

    const scholarshipTotals = {
      applied: studentScholarships.reduce((sum, s) => sum + s.amount, 0),
      autoApplied: studentScholarships.filter(s => s.isAutoApplied).reduce((sum, s) => sum + s.amount, 0),
      manual: studentScholarships.filter(s => !s.isAutoApplied).reduce((sum, s) => sum + s.amount, 0)
    }

    const netTotals = {
      total: feeTotals.total - scholarshipTotals.applied,
      paid: 0,
      due: feeTotals.total - scholarshipTotals.applied
    }

    // Create student enrollment
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId,
        academicYearId,
        classId,
        section,
        enrollmentDate: new Date(),
        isActive: true,
        
        // Embedded student info
        student: {
          admissionNumber: student.admissionNo,
          firstName: student.name.split(' ')[0] || student.name,
          lastName: student.name.split(' ').slice(1).join(' ') || '',
          fatherName: student.fatherName,
          phone: student.mobileNo1,
          class: classInfo.className,
          status: 'ACTIVE'
        },
        
        // Embedded academic year info
        academicYear: {
          year: academicYear.year,
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
          isActive: academicYear.isActive
        },
        
        // Embedded class info
        class: {
          className: classInfo.className,
          order: classInfo.order,
          isActive: classInfo.isActive
        },
        
        // Student fees
        fees: studentFees,
        
        // Student scholarships
        scholarships: studentScholarships,
        
        // Pre-computed totals
        totals: {
          fees: feeTotals,
          scholarships: scholarshipTotals,
          netAmount: netTotals
        },
        
        // Fee status
        feeStatus: {
          status: netTotals.due > 0 ? 'PARTIAL' : 'PAID',
          overdueAmount: 0
        }
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Error creating flexible enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}