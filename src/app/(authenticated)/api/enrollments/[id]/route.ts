import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/database'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET /api/enrollments/[id] - Get specific enrollment
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
    
    await db.connect()
    
    const enrollment = await db.studentEnrollment.findById(resolvedParams.id).lean()




    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    const payments = await db.payment.find({
      studentEnrollmentId: resolvedParams.id
    }).lean()


    return NextResponse.json({
      ...enrollment,
      payments: payments
    })
  } catch (error) {
    console.error('Error fetching enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollment' },
      { status: 500 }
    )
  }
}

// PUT /api/enrollments/[id] - Update enrollment
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
      classId, 
      section, 
      customFees = {}, 
      customScholarships = {},
      selectedScholarships = [],
      isActive = true 
    } = body

    // Validate required fields
    if (!classId || !section) {
      return NextResponse.json(
        { error: 'Class and section are required' },
        { status: 400 }
      )
    }

    await db.connect()

    // Check if enrollment exists
    const existingEnrollment = await db.studentEnrollment.findById(resolvedParams.id).lean()

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Get fee structure for the academic year and class
    const feeStructure = await db.feeStructure.findOne({
      academicYearId: existingEnrollment.academicYearId,
      classId: classId
    }).lean()

    if (!feeStructure || !feeStructure.isActive) {
      return NextResponse.json(
        { error: 'No active fee structure found for this class' },
        { status: 400 }
      )
    }

    // Get class info for denormalization (if class changed)
    let classInfo = existingEnrollment.class
    if (classId !== existingEnrollment.classId) {
      const newClassInfo = await db.class.findById(classId).lean()
      if (!newClassInfo) {
        return NextResponse.json(
          { error: 'Invalid class' },
          { status: 400 }
        )
      }
      classInfo = {
        className: newClassInfo.className,
        isActive: newClassInfo.isActive
      }
    }

    // Rebuild fees from fee structure, preserving payment data
    const rebuiltFees = feeStructure.feeItems.map((feeItem) => {
      const customAmount = customFees[feeItem.templateId]
      const finalAmount = (customAmount !== undefined && feeItem.isEditableDuringEnrollment) 
        ? customAmount 
        : feeItem.amount

      // Find existing fee to preserve payment data
      const existingFee = existingEnrollment.fees.find(f => f.templateId === feeItem.templateId)
      const amountPaid = existingFee?.amountPaid || 0
      const newAmountDue = Math.max(0, finalAmount - amountPaid)

      return {
        id: existingFee?.id || new ObjectId().toString(),
        feeItemId: feeItem.id,
        templateId: feeItem.templateId,
        templateName: feeItem.templateName,
        templateCategory: feeItem.templateCategory,
        amount: finalAmount,
        originalAmount: feeItem.amount,
        amountPaid,
        amountDue: newAmountDue,
        isCompulsory: feeItem.isCompulsory,
      }
    })

    // Rebuild scholarships from fee structure and selections
    const rebuiltScholarships = []

    // Add manually selected scholarships
    for (const selectedScholarshipId of selectedScholarships) {
      const scholarshipItem = feeStructure.scholarshipItems.find(
        item => item.id === selectedScholarshipId
      )
      
      if (scholarshipItem) {
        const customAmount = customScholarships[scholarshipItem.templateId]
        const finalAmount = (customAmount !== undefined && scholarshipItem.isEditableDuringEnrollment) 
          ? customAmount 
          : scholarshipItem.amount

        // Find existing scholarship to preserve data
        const existingScholarship = existingEnrollment.scholarships.find(
          s => s.scholarshipItemId === scholarshipItem.id
        )

        rebuiltScholarships.push({
          id: existingScholarship?.id || new ObjectId().toString(),
          scholarshipItemId: scholarshipItem.id,
          templateId: scholarshipItem.templateId,
          templateName: scholarshipItem.templateName,
          templateType: scholarshipItem.templateType,
          amount: finalAmount,
          originalAmount: scholarshipItem.amount,
          appliedDate: existingScholarship?.appliedDate || new Date(),
          appliedBy: existingScholarship?.appliedBy || session.user.username,
          isActive: true,
          isAutoApplied: false
        })
      }
    }

    // Calculate totals
    const feeTotals = {
      total: rebuiltFees.reduce((sum, f) => sum + f.amount, 0),
      paid: rebuiltFees.reduce((sum, f) => sum + f.amountPaid, 0),
      due: rebuiltFees.reduce((sum, f) => sum + f.amountDue, 0)
    }

    const scholarshipTotals = {
      applied: rebuiltScholarships.reduce((sum, s) => sum + s.amount, 0)
    }

    const netTotals = {
      total: feeTotals.total - scholarshipTotals.applied,
      paid: feeTotals.paid,
      due: feeTotals.due - scholarshipTotals.applied
    }

    // Determine fee status
    const feeStatus = {
      status: netTotals.due <= 0 ? 'PAID' : netTotals.paid > 0 ? 'PARTIAL' : 'OVERDUE' as any,
      lastPaymentDate: existingEnrollment.feeStatus.lastPaymentDate,
      nextDueDate: existingEnrollment.feeStatus.nextDueDate,
      overdueAmount: Math.max(0, netTotals.due)
    }

    // Update enrollment with rebuilt data
    const updatedEnrollment = await db.studentEnrollment.findByIdAndUpdate(
      resolvedParams.id,
      {
        classId,
        class: classInfo,
        section,
        fees: rebuiltFees,
        scholarships: rebuiltScholarships,
        totals: {
          fees: feeTotals,
          scholarships: scholarshipTotals,
          netAmount: netTotals
        },
        feeStatus,
        isActive,
        updatedAt: new Date()
      },
      { new: true, lean: true }
    )

    return NextResponse.json(updatedEnrollment)
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}

// DELETE /api/flexible-enrollments/[id] - Delete enrollment (mark as inactive)
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
    
    await db.connect()

    // Check if enrollment exists
    const existingEnrollment = await db.studentEnrollment.findById(resolvedParams.id).lean()

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Mark as inactive instead of hard delete
    const updatedEnrollment = await db.studentEnrollment.findByIdAndUpdate(
      resolvedParams.id,
      { 
        isActive: false,
        'student.status': 'INACTIVE'
      },
      { new: true, lean: true }
    )

    return NextResponse.json({
      message: 'Enrollment deactivated successfully',
      enrollment: updatedEnrollment
    })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    )
  }
}

// POST /api/enrollments/[id] - Reactivate enrollment
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
    
    await db.connect()

    // Check if enrollment exists
    const existingEnrollment = await db.studentEnrollment.findById(resolvedParams.id).lean()

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Reactivate enrollment and update student status
    const updatedEnrollment = await db.studentEnrollment.findByIdAndUpdate(
      resolvedParams.id,
      { 
        isActive: true,
        'student.status': 'ACTIVE'
      },
      { new: true, lean: true }
    )

    return NextResponse.json({
      message: 'Enrollment reactivated successfully',
      enrollment: updatedEnrollment
    })
  } catch (error) {
    console.error('Error reactivating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate enrollment' },
      { status: 500 }
    )
  }
}