import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/database'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import type { FeeItem as FeeItemType, MobileNumber } from '@/lib/types'

// GET /api/enrollments - List enrollments with fee structure
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.connect()

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYearId')
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')
    const search = searchParams.get('search')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : null

    const skip = limit ? (page - 1) * limit : 0

    const filter: {
      isActive?: boolean;
      academicYearId?: string;
      classId?: string;
      studentId?: string;
      $or?: Array<Record<string, unknown>>;
    } = {}
    
    // Only filter by active status if includeInactive is false
    if (!includeInactive) {
      filter.isActive = true
    }
    if (academicYearId) filter.academicYearId = academicYearId
    if (classId) filter.classId = classId
    if (studentId) filter.studentId = studentId
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { 'student.name': { $regex: search, $options: 'i' } },
        { 'student.admissionNumber': { $regex: search, $options: 'i' } },
        { 'class.className': { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } }
      ]
    }

    const query = db.studentEnrollment.find(filter).sort({ createdAt: -1 })
    if (skip) query.skip(skip)
    if (limit) query.limit(limit)

    const [enrollments, total] = await Promise.all([
      query.lean(),
      db.studentEnrollment.countDocuments(filter)
    ])

    return NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: limit ? Math.ceil(total / limit) : 1
      }
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST /api/enrollments - Create new enrollment with fee structure
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.connect()

    const body = await request.json()
    const { 
      studentId, 
      academicYearId, 
      classId, 
      section, 
      customFees = {}, 
      customScholarships = {},
    } = body

    // Validate required fields
    if (!studentId || !academicYearId || !classId || !section) {
      return NextResponse.json(
        { error: 'Student, academic year, class, and section are required' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled for this academic year
    const existingEnrollment = await db.studentEnrollment.findOne({
      studentId,
      academicYearId
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this academic year' },
        { status: 409 }
      )
    }

    // Get fee structure for the academic year and class
    const feeStructure = await db.feeStructure.findOne({
      academicYearId,
      classId
    })

    if (!feeStructure || !feeStructure.isActive) {
      return NextResponse.json(
        { error: 'No active fee structure found for this academic year and class' },
        { status: 400 }
      )
    }

    // Get student, academic year, and class info for denormalization
    const [student, academicYear, classInfo] = await Promise.all([
      db.student.findById(studentId),
      db.academicYear.findById(academicYearId),
      db.class.findById(classId)
    ])

    if (!student || !academicYear || !classInfo) {
      return NextResponse.json(
        { error: 'Invalid student, academic year, or class' },
        { status: 400 }
      )
    }

    // Create student fees from fee structure
    const studentFees = feeStructure.feeItems.map((feeItem: FeeItemType, _index: number) => {
      const customAmount = customFees[feeItem.templateId]
      const finalAmount = (customAmount !== undefined && feeItem.isEditableDuringEnrollment) 
        ? customAmount 
        : feeItem.amount

      return {
        _id: new ObjectId().toString(),
        feeItemId: feeItem._id || feeItem.templateId,
        templateId: feeItem.templateId,
        templateName: feeItem.templateName,
        templateCategory: feeItem.templateCategory,
        amount: finalAmount,
        originalAmount: feeItem.amount,
        amountPaid: 0,
        amountDue: finalAmount,
        isCompulsory: feeItem.isCompulsory,
      }
    })

    // Apply scholarships
    const studentScholarships = []

    // Apply manually selected scholarships
    for (const scholarshipItem of feeStructure.scholarshipItems) {
      
      if (scholarshipItem) {
        const customAmount = customScholarships[scholarshipItem.templateId]
        const finalAmount = (customAmount !== undefined && scholarshipItem.isEditableDuringEnrollment) 
          ? customAmount 
          : scholarshipItem.amount

        // Only add the scholarship if the final amount is greater than 0
        if (finalAmount > 0) {
          studentScholarships.push({
            _id: new ObjectId().toString(),
            scholarshipItemId: scholarshipItem._id || scholarshipItem.templateId,
            templateId: scholarshipItem.templateId,
            templateName: scholarshipItem.templateName,
            templateType: scholarshipItem.templateType,
            amount: finalAmount,
            originalAmount: scholarshipItem.amount,
            appliedDate: new Date(),
            appliedBy: session.user.username,
            isActive: true,
            isAutoApplied: false
          })
        }
      }
    }

    // Calculate totals
    const feeTotals = {
      total: studentFees.reduce((sum: number, f: { amount: number }) => sum + f.amount, 0),
      paid: 0,
      due: studentFees.reduce((sum: number, f: { amount: number }) => sum + f.amount, 0)
    }

    const scholarshipTotals = {
      applied: studentScholarships.reduce((sum, s) => sum + s.amount, 0),
    }

    const netTotals = {
      total: feeTotals.total - scholarshipTotals.applied,
      paid: 0,
      due: feeTotals.total - scholarshipTotals.applied
    }

    // Create student enrollment
    const enrollment = await db.studentEnrollment.create({
      studentId,
      academicYearId,
      classId,
      section,
      enrollmentDate: new Date(),
      isActive: true,
      
      // Embedded student info
      student: {
        admissionNumber: student.admissionNo,
        name: student.name,
        fatherName: student.fatherName,
        mobileNo: student.mobileNumbers?.find((m: MobileNumber) => m.isPrimary)?.number || student.mobileNumbers?.[0]?.number || '',
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
        status: (netTotals.due > 0 ? 'PARTIAL' : 'PAID'),
        overdueAmount: 0
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}