import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

// Payment schema for validation
const paymentSchema = z.object({
  studentEnrollmentId: z.string().min(1, 'Student enrollment ID is required'),
  totalAmount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'ONLINE', 'CHEQUE']).default('CASH'),
  remarks: z.string().optional(),
  paymentItems: z.array(z.object({
    feeId: z.string().min(1),
    amount: z.number().min(0.01)
  })).min(1, 'At least one payment item is required')
})

// GET /api/flexible-payments - Get payments for student enrollment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentEnrollmentId = searchParams.get('studentEnrollmentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = studentEnrollmentId ? { studentEnrollmentId } : {}

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST /api/flexible-payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Get student enrollment with current fee status
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: validatedData.studentEnrollmentId }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student enrollment not found' },
        { status: 404 }
      )
    }

    if (!enrollment.isActive) {
      return NextResponse.json(
        { error: 'Student enrollment is not active' },
        { status: 400 }
      )
    }

    // Validate payment items against student fees
    const feeIds = validatedData.paymentItems.map(item => item.feeId)
    const validFees = enrollment.fees.filter(fee => feeIds.includes(fee.id))
    
    if (validFees.length !== feeIds.length) {
      return NextResponse.json(
        { error: 'Some fee items are invalid' },
        { status: 400 }
      )
    }

    // Validate payment amounts don't exceed due amounts
    for (const paymentItem of validatedData.paymentItems) {
      const fee = validFees.find(f => f.id === paymentItem.feeId)
      if (!fee) continue
      
      if (paymentItem.amount > fee.amountDue) {
        return NextResponse.json(
          { error: `Payment amount for ${fee.templateName} exceeds due amount` },
          { status: 400 }
        )
      }
    }

    // Generate receipt number
    const receiptNo = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        receiptNo,
        studentEnrollmentId: validatedData.studentEnrollmentId,
        academicYearId: enrollment.academicYearId,
        totalAmount: validatedData.totalAmount,
        paymentMethod: validatedData.paymentMethod,
        remarks: validatedData.remarks,
        createdBy: session.user?.name || 'Unknown',
        student: enrollment.student,
        class: enrollment.class,
        academicYear: enrollment.academicYear,
        section: enrollment.section,
        paymentItems: validatedData.paymentItems.map(item => {
          const fee = validFees.find(f => f.id === item.feeId)!
          return {
            id: new ObjectId().toString(),
            feeId: item.feeId,
            feeTemplateId: fee.templateId,
            feeTemplateName: fee.templateName,
            amount: item.amount,
            feeBalance: fee.amountDue - item.amount
          }
        })
      }
    })

    // Update student enrollment with new payment amounts
    const updatedFees = enrollment.fees.map(fee => {
      const paymentItem = validatedData.paymentItems.find(item => item.feeId === fee.id)
      if (!paymentItem) return fee

      const newAmountPaid = fee.amountPaid + paymentItem.amount
      const newAmountDue = fee.amount - newAmountPaid
      
      return {
        ...fee,
        amountPaid: newAmountPaid,
        amountDue: Math.max(0, newAmountDue)
      }
    })

    // Recalculate totals
    const totalFeesPaid = updatedFees.reduce((sum, fee) => sum + fee.amountPaid, 0)
    const totalFeesDue = updatedFees.reduce((sum, fee) => sum + fee.amountDue, 0)
    
    const netAmountPaid = enrollment.totals.netAmount.paid + validatedData.totalAmount
    const netAmountDue = enrollment.totals.netAmount.total - netAmountPaid

    // Determine fee status
    let feeStatus: 'PAID' | 'PARTIAL' | 'OVERDUE' = 'PARTIAL'
    if (netAmountDue <= 0) {
      feeStatus = 'PAID'
    } else if (netAmountPaid === 0) {
      feeStatus = 'OVERDUE' // This would need due date logic
    }

    const updatedTotals = {
      ...enrollment.totals,
      fees: {
        ...enrollment.totals.fees,
        paid: totalFeesPaid,
        due: totalFeesDue
      },
      netAmount: {
        ...enrollment.totals.netAmount,
        paid: netAmountPaid,
        due: Math.max(0, netAmountDue)
      }
    }

    const updatedFeeStatus = {
      ...enrollment.feeStatus,
      status: feeStatus as any,
      lastPaymentDate: new Date(),
      overdueAmount: Math.max(0, netAmountDue)
    }

    // Update student enrollment
    await prisma.studentEnrollment.update({
      where: { id: validatedData.studentEnrollmentId },
      data: {
        fees: updatedFees,
        totals: updatedTotals,
        feeStatus: updatedFeeStatus
      }
    })

    return NextResponse.json({
      payment,
      message: 'Payment recorded successfully'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}