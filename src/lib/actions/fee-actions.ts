'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { z } from 'zod'

const feePaymentSchema = z.object({
  studentEnrollmentId: z.string().min(1, 'Student enrollment ID is required'),
  paymentMethod: z.enum(['CASH', 'ONLINE', 'CHEQUE']),
  paymentItems: z.array(z.object({
    feeId: z.string(),
    amount: z.number().min(0)
  })).min(1, 'At least one fee item is required'),
  totalAmount: z.number().min(0.01, 'Total amount must be greater than 0'),
  remarks: z.string().optional()
})

export async function collectFees(formData: FormData) {
  const session = await requireAuth()
  
  // Convert FormData to object
  const rawData = Object.fromEntries(formData.entries())
  
  // Parse fee items from form data
  const paymentItems = []
  let index = 0
  while (rawData[`paymentItems.${index}.feeId`]) {
    const amount = parseFloat(rawData[`paymentItems.${index}.amount`] as string)
    if (amount > 0) {
      paymentItems.push({
        feeId: rawData[`paymentItems.${index}.feeId`] as string,
        amount
      })
    }
    delete rawData[`paymentItems.${index}.feeId`]
    delete rawData[`paymentItems.${index}.amount`]
    index++
  }
  
  const dataWithPaymentItems = {
    ...rawData,
    paymentItems,
    totalAmount: parseFloat(rawData.totalAmount as string)
  }
  
  const validatedData = feePaymentSchema.parse(dataWithPaymentItems)
  
  try {
    // Get student enrollment information
    const studentEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id: validatedData.studentEnrollmentId }
    })
    
    if (!studentEnrollment) {
      throw new Error('Student enrollment not found')
    }
    
    // Generate receipt number
    const receiptNumber = await generateReceiptNumber(studentEnrollment.academicYear.year)
    
    // Create payment and update enrollment fees in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Build payment items for the payment record
      const paymentItemsData = []
      
      for (const item of validatedData.paymentItems) {
        const feeInEnrollment = studentEnrollment.fees.find(f => f.id === item.feeId)
        if (feeInEnrollment) {
          paymentItemsData.push({
            id: new Date().getTime().toString(), // Generate a simple ID
            feeId: item.feeId,
            feeTemplateId: feeInEnrollment.templateId,
            feeTemplateName: feeInEnrollment.templateName,
            amount: item.amount,
            feeBalance: Math.max(0, feeInEnrollment.amountDue - item.amount)
          })
        }
      }
      
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          receiptNo: receiptNumber,
          studentEnrollmentId: validatedData.studentEnrollmentId,
          totalAmount: validatedData.totalAmount,
          paymentMethod: validatedData.paymentMethod,
          remarks: validatedData.remarks || '',
          createdBy: session.user.username,
          student: studentEnrollment.student,
          academicYear: studentEnrollment.academicYear,
          paymentItems: paymentItemsData
        }
      })
      
      // Update student enrollment fees
      const updatedFees = studentEnrollment.fees.map(fee => {
        const paymentItem = validatedData.paymentItems.find(item => item.feeId === fee.id)
        if (paymentItem) {
          return {
            ...fee,
            amountPaid: fee.amountPaid + paymentItem.amount,
            amountDue: Math.max(0, fee.amountDue - paymentItem.amount)
          }
        }
        return fee
      })
      
      // Recalculate totals
      const totalPaid = updatedFees.reduce((sum, fee) => sum + fee.amountPaid, 0)
      const totalDue = updatedFees.reduce((sum, fee) => sum + fee.amountDue, 0)
      
      const updatedTotals = {
        ...studentEnrollment.totals,
        fees: {
          ...studentEnrollment.totals.fees,
          paid: totalPaid,
          due: totalDue
        },
        netAmount: {
          ...studentEnrollment.totals.netAmount,
          paid: totalPaid,
          due: totalDue
        }
      }
      
      // Update enrollment with new fee amounts and totals
      await tx.studentEnrollment.update({
        where: { id: validatedData.studentEnrollmentId },
        data: {
          fees: updatedFees,
          totals: updatedTotals,
          feeStatus: {
            ...studentEnrollment.feeStatus,
            status: totalDue === 0 ? 'PAID' : totalDue < studentEnrollment.totals.netAmount.total ? 'PARTIAL' : studentEnrollment.feeStatus.status,
            lastPaymentDate: new Date(),
            overdueAmount: Math.max(0, totalDue) // This would need proper overdue calculation
          }
        }
      })
      
      return payment
    })
    
    revalidatePath('/fees')
    revalidatePath(`/fees/collect/${studentEnrollment.studentId}`)
    redirect(`/receipts/${result.id}`)
  } catch (error) {
    console.error('Error collecting fees:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to collect fees')
  }
}

async function generateReceiptNumber(academicYear: string): Promise<string> {
  // Use receipt sequence to generate unique receipt numbers
  const sequence = await prisma.receiptSequence.upsert({
    where: { academicYear },
    update: {
      lastSequence: { increment: 1 }
    },
    create: {
      academicYear,
      lastSequence: 1
    }
  })
  
  return `RC${academicYear.replace('-', '')}${sequence.lastSequence.toString().padStart(6, '0')}`
}

export async function updatePayment(paymentId: string, formData: FormData) {
  const session = await requireAuth()
  
  // Only admin can update payments
  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required to update payments')
  }
  
  const rawData = Object.fromEntries(formData.entries())
  const remarks = rawData.remarks as string
  
  try {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        remarks,
        updatedAt: new Date()
      }
    })
    
    revalidatePath('/fees')
    revalidatePath(`/receipts/${paymentId}`)
    
    return { success: true, message: 'Payment updated successfully' }
  } catch (error) {
    console.error('Error updating payment:', error)
    throw new Error('Failed to update payment')
  }
}

export async function cancelPayment(paymentId: string, reason: string) {
  const session = await requireAuth()
  
  // Only admin can cancel payments
  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required to cancel payments')
  }
  
  try {
    await prisma.$transaction(async (tx) => {
      // Get the payment details
      const payment = await tx.payment.findUnique({
        where: { id: paymentId }
      })
      
      if (!payment) {
        throw new Error('Payment not found')
      }
      
      // Get the student enrollment to reverse the payment
      const studentEnrollment = await tx.studentEnrollment.findUnique({
        where: { id: payment.studentEnrollmentId }
      })
      
      if (!studentEnrollment) {
        throw new Error('Student enrollment not found')
      }
      
      // Reverse the payment by updating the enrollment fees
      const updatedFees = studentEnrollment.fees.map(fee => {
        const paymentItem = payment.paymentItems.find(item => item.feeId === fee.id)
        if (paymentItem) {
          return {
            ...fee,
            amountPaid: Math.max(0, fee.amountPaid - paymentItem.amount),
            amountDue: fee.amountDue + paymentItem.amount
          }
        }
        return fee
      })
      
      // Recalculate totals
      const totalPaid = updatedFees.reduce((sum, fee) => sum + fee.amountPaid, 0)
      const totalDue = updatedFees.reduce((sum, fee) => sum + fee.amountDue, 0)
      
      const updatedTotals = {
        ...studentEnrollment.totals,
        fees: {
          ...studentEnrollment.totals.fees,
          paid: totalPaid,
          due: totalDue
        },
        netAmount: {
          ...studentEnrollment.totals.netAmount,
          paid: totalPaid,
          due: totalDue
        }
      }
      
      // Update enrollment
      await tx.studentEnrollment.update({
        where: { id: payment.studentEnrollmentId },
        data: {
          fees: updatedFees,
          totals: updatedTotals,
          feeStatus: {
            ...studentEnrollment.feeStatus,
            status: totalDue === 0 ? 'PAID' : totalDue < studentEnrollment.totals.netAmount.total ? 'PARTIAL' : 'OVERDUE',
            overdueAmount: Math.max(0, totalDue)
          }
        }
      })
      
      // Mark payment as cancelled
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'CANCELLED',
          remarks: `CANCELLED: ${reason}`,
          updatedAt: new Date()
        }
      })
    })
    
    revalidatePath('/fees')
    revalidatePath(`/receipts/${paymentId}`)
    
    return { success: true, message: 'Payment cancelled successfully' }
  } catch (error) {
    console.error('Error cancelling payment:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to cancel payment')
  }
}