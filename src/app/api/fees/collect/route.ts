import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateReceiptNumber } from "@/lib/utils/receipt"
import type { Session } from "next-auth"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { FeeStatus, FeeStatusType } from "@/types/enrollment"
import { PaymentItem } from "@/types/payment"

const feePaymentSchema = z.object({
  studentEnrollmentId: z.string(),
  paymentItems: z.array(z.object({
    feeId: z.string(),
    amount: z.number().min(0.01)
  })),
  totalAmount: z.number().min(0.01),
  paymentDate: z.date().optional(),
  paymentMethod: z.enum(["CASH", "ONLINE", "CHEQUE"]).default("CASH"),
  remarks: z.string().optional(),
  createdBy: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = feePaymentSchema.parse({
      ...body,
      createdBy: session?.user?.username,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
    })

    // Get the student enrollment details
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: validatedData.studentEnrollmentId }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student enrollment not found" },
        { status: 404 }
      )
    }

    // Validate payment items and calculate totals
    let totalCalculated = 0
    const paymentItems: PaymentItem[] = []

    for (const item of validatedData.paymentItems) {
      const fee = enrollment.fees.find(f => f.id === item.feeId)
      if (!fee) {
        return NextResponse.json(
          { error: `Fee with id ${item.feeId} not found` },
          { status: 400 }
        )
      }

      const maxPayable = Math.max(0, fee.amountDue)
      if (item.amount > maxPayable) {
        return NextResponse.json(
          { error: `Payment for ${fee.templateName} cannot exceed outstanding balance of ₹${maxPayable}` },
          { status: 400 }
        )
      }

      totalCalculated += item.amount
      paymentItems.push({
        id: new ObjectId().toString(), // Simple ID generation
        feeId: item.feeId,
        feeTemplateId: fee.templateId,
        feeTemplateName: fee.templateName,
        amount: item.amount,
        feeBalance: fee.amountDue - item.amount
      })
    }

    // Validate total amount
    if (Math.abs(validatedData.totalAmount - totalCalculated) > 0.01) {
      return NextResponse.json(
        { error: "Total amount must match sum of individual fee payments" },
        { status: 400 }
      )
    }

    // Generate unique receipt number
    const receiptNo = generateReceiptNumber()

    // Update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          receiptNo,
          studentEnrollmentId: validatedData.studentEnrollmentId,
          totalAmount: validatedData.totalAmount,
          paymentDate: validatedData.paymentDate || new Date(),
          paymentMethod: validatedData.paymentMethod,
          remarks: validatedData.remarks,
          createdBy: validatedData.createdBy,
          student: enrollment.student,
          academicYear: enrollment.academicYear,
          paymentItems
        }
      })

      // Update student enrollment fees
      const updatedFees = enrollment.fees.map(fee => {
        const paymentItem = validatedData.paymentItems.find(p => p.feeId === fee.id)
        if (paymentItem) {
          const newAmountPaid = fee.amountPaid + paymentItem.amount
          return {
            ...fee,
            amountPaid: newAmountPaid,
            amountDue: fee.amount - newAmountPaid,
            recentPayments: [
              {
                paymentId: payment.id,
                amount: paymentItem.amount,
                paymentDate: validatedData.paymentDate || new Date(),
                receiptNo,
                paymentMethod: validatedData.paymentMethod
              },
              ...fee.recentPayments.slice(0, 4) // Keep last 5 payments
            ]
          }
        }
        return fee
      })

      // Recalculate totals
      const feeTotals = {
        compulsory: updatedFees.filter(f => f.isCompulsory).reduce((sum, f) => sum + f.amount, 0),
        optional: updatedFees.filter(f => !f.isCompulsory).reduce((sum, f) => sum + f.amount, 0),
        total: updatedFees.reduce((sum, f) => sum + f.amount, 0),
        paid: updatedFees.reduce((sum, f) => sum + f.amountPaid, 0),
        due: updatedFees.reduce((sum, f) => sum + f.amountDue, 0)
      }

      const scholarshipTotals = {
        applied: enrollment.scholarships.filter(s => s.isActive).reduce((sum, s) => sum + s.amount, 0),
        autoApplied: enrollment.scholarships.filter(s => s.isActive && s.isAutoApplied).reduce((sum, s) => sum + s.amount, 0),
        manual: enrollment.scholarships.filter(s => s.isActive && !s.isAutoApplied).reduce((sum, s) => sum + s.amount, 0)
      }

      const netTotals = {
        total: feeTotals.total - scholarshipTotals.applied,
        paid: feeTotals.paid,
        due: feeTotals.total - scholarshipTotals.applied - feeTotals.paid
      }

      const feeStatus: FeeStatus = {
        status: netTotals.due <= 0 ? FeeStatusType.PAID : netTotals.paid > 0 ? FeeStatusType.PARTIAL : FeeStatusType.OVERDUE,
        lastPaymentDate: validatedData.paymentDate || new Date(),
        nextDueDate: enrollment.feeStatus.nextDueDate ?? undefined,
        overdueAmount: Math.max(0, netTotals.due)
      }

      // Update student enrollment
      await tx.studentEnrollment.update({
        where: { id: validatedData.studentEnrollmentId },
        data: {
          fees: updatedFees,
          totals: {
            fees: feeTotals,
            scholarships: scholarshipTotals,
            netAmount: netTotals
          },
          feeStatus
        }
      })

      return payment
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error collecting fee:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}