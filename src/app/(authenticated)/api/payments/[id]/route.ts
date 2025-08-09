import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/payments/[id] - Get specific payment
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
    const payment = await prisma.payment.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}

// DELETE /api/payments/[id] - Cancel payment (if applicable)
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
    const payment = await prisma.payment.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Payment is already cancelled' },
        { status: 400 }
      )
    }

    // Get student enrollment to reverse payment effects
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: payment.studentEnrollmentId }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student enrollment not found' },
        { status: 404 }
      )
    }

    // Reverse payment amounts from student fees
    const updatedFees = enrollment.fees.map(fee => {
      const paymentItem = payment.paymentItems.find(item => item.feeId === fee.id)
      if (!paymentItem) return fee

      const newAmountPaid = Math.max(0, fee.amountPaid - paymentItem.amount)
      const newAmountDue = fee.amount - newAmountPaid
      
      return {
        ...fee,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        recentPayments: fee.recentPayments.filter(rp => rp.paymentId !== payment.id)
      }
    })

    // Recalculate totals
    const totalFeesPaid = updatedFees.reduce((sum, fee) => sum + fee.amountPaid, 0)
    const totalFeesDue = updatedFees.reduce((sum, fee) => sum + fee.amountDue, 0)
    
    const netAmountPaid = enrollment.totals.netAmount.paid - payment.totalAmount
    const netAmountDue = enrollment.totals.netAmount.total - netAmountPaid

    // Determine fee status
    let feeStatus: 'PAID' | 'PARTIAL' | 'OVERDUE' = 'PARTIAL'
    if (netAmountDue <= 0) {
      feeStatus = 'PAID'
    } else if (netAmountPaid === 0) {
      feeStatus = 'OVERDUE'
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
        paid: Math.max(0, netAmountPaid),
        due: netAmountDue
      }
    }

    const updatedFeeStatus = {
      ...enrollment.feeStatus,
      status: feeStatus as any,
      overdueAmount: Math.max(0, netAmountDue)
    }

    // Update payment status and student enrollment
    await Promise.all([
      prisma.payment.update({
        where: { id: resolvedParams.id },
        data: { status: 'CANCELLED' }
      }),
      prisma.studentEnrollment.update({
        where: { id: payment.studentEnrollmentId },
        data: {
          fees: updatedFees,
          totals: updatedTotals,
          feeStatus: updatedFeeStatus
        }
      })
    ])

    return NextResponse.json({
      message: 'Payment cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling payment:', error)
    return NextResponse.json(
      { error: 'Failed to cancel payment' },
      { status: 500 }
    )
  }
}