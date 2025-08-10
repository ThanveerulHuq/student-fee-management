import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

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
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: resolvedParams.id },
    })




    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    const payments = await prisma.payment.findMany({
      where: {
        studentEnrollmentId: resolvedParams.id
      }
    })


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

// PUT /api/flexible-enrollments/[id] - Update enrollment
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
    const { section, customFees, scholarshipUpdates } = body

    // Check if enrollment exists
    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // Update section if provided
    if (section) {
      updateData.section = section
    }

    // Update custom fees if provided
    if (customFees) {
      const updatedFees = existingEnrollment.fees.map(fee => {
        const customAmount = customFees[fee.templateId]
        if (customAmount !== undefined) {
          const newAmountDue = customAmount - fee.amountPaid
          return {
            ...fee,
            amount: customAmount,
            amountDue: newAmountDue
          }
        }
        return fee
      })

      updateData.fees = updatedFees

      // Recalculate totals
      const feeTotals = {
        total: updatedFees.reduce((sum, f) => sum + f.amount, 0),
        paid: updatedFees.reduce((sum, f) => sum + f.amountPaid, 0),
        due: updatedFees.reduce((sum, f) => sum + f.amountDue, 0)
      }

      const scholarshipTotals = existingEnrollment.totals.scholarships
      const netTotals = {
        total: feeTotals.total - scholarshipTotals.applied,
        paid: feeTotals.paid,
        due: feeTotals.due - scholarshipTotals.applied
      }

      updateData.totals = {
        fees: feeTotals,
        scholarships: scholarshipTotals,
        netAmount: netTotals
      }

      updateData.feeStatus = {
        ...existingEnrollment.feeStatus,
        status: (netTotals.due <= 0 ? 'PAID' : netTotals.paid > 0 ? 'PARTIAL' : 'OVERDUE') as any
      }
    }

    // Update scholarships if provided
    if (scholarshipUpdates) {
      const updatedScholarships = existingEnrollment.scholarships.map(scholarship => {
        interface ScholarshipUpdate {
          scholarshipItemId: string;
          amount: number;
          isActive?: boolean;
        }
        const update = scholarshipUpdates.find(
          (u: ScholarshipUpdate) => u.scholarshipItemId === scholarship.scholarshipItemId
        )
        if (update) {
          return {
            ...scholarship,
            amount: update.amount,
            isActive: update.isActive !== undefined ? update.isActive : scholarship.isActive
          }
        }
        return scholarship
      })

      updateData.scholarships = updatedScholarships

      // Recalculate scholarship totals
      const activeScholarships = updatedScholarships.filter(s => s.isActive)
      const scholarshipTotals = {
        applied: activeScholarships.reduce((sum, s) => sum + s.amount, 0),
      }

      const feeTotals = updateData.totals?.fees || existingEnrollment.totals.fees
      const netTotals = {
        total: feeTotals.total - scholarshipTotals.applied,
        paid: feeTotals.paid,
        due: feeTotals.due - scholarshipTotals.applied
      }

      updateData.totals = {
        fees: feeTotals,
        scholarships: scholarshipTotals,
        netAmount: netTotals
      }

      updateData.feeStatus = {
        ...existingEnrollment.feeStatus,
        status: netTotals.due <= 0 ? 'PAID' : netTotals.paid > 0 ? 'PARTIAL' : 'OVERDUE' as any
      }
    }

    const updatedEnrollment = await prisma.studentEnrollment.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

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
    
    // Check if enrollment exists
    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Mark as inactive instead of hard delete
    const updatedEnrollment = await prisma.studentEnrollment.update({
      where: { id: resolvedParams.id },
      data: { 
        isActive: false,
        student: {
          ...existingEnrollment.student,
          status: 'INACTIVE'
        }
      }
    })

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