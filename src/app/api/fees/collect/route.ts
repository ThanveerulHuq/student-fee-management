import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { feePaymentSchema } from "@/lib/validations/fee"
import { generateReceiptNumber } from "@/lib/utils/receipt"
import type { Session } from "next-auth"

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

    // Get the enrollment details
    const enrollment = await prisma.studentYear.findUnique({
      where: { id: validatedData.studentYearId },
      include: {
        student: true,
        academicYear: true,
        class: true,
        commonFee: true,
        paidFee: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student enrollment not found" },
        { status: 404 }
      )
    }

    // Calculate maximum payable amounts for each fee type
    const maxSchoolFee = Math.max(0, enrollment.commonFee.tutionFee - (enrollment.paidFee?.schoolFeePaid || 0))
    const maxBookFee = Math.max(0, enrollment.commonFee.bookFee - (enrollment.paidFee?.bookFeePaid || 0))
    const maxUniformFee = Math.max(0, enrollment.uniformFee - (enrollment.paidFee?.uniformFeePaid || 0))
    const maxIslamicStudies = Math.max(0, enrollment.islamicStudies - (enrollment.paidFee?.islamicStudiesPaid || 0))
    const maxVanFee = Math.max(0, enrollment.vanFee - (enrollment.paidFee?.vanFeePaid || 0))

    // Validate payment amounts don't exceed outstanding balances
    if (validatedData.schoolFee > maxSchoolFee) {
      return NextResponse.json(
        { error: `School fee payment cannot exceed outstanding balance of ₹${maxSchoolFee}` },
        { status: 400 }
      )
    }
    if (validatedData.bookFee > maxBookFee) {
      return NextResponse.json(
        { error: `Book fee payment cannot exceed outstanding balance of ₹${maxBookFee}` },
        { status: 400 }
      )
    }
    if (validatedData.uniformFee > maxUniformFee) {
      return NextResponse.json(
        { error: `Uniform fee payment cannot exceed outstanding balance of ₹${maxUniformFee}` },
        { status: 400 }
      )
    }
    if (validatedData.islamicStudies > maxIslamicStudies) {
      return NextResponse.json(
        { error: `Islamic studies fee payment cannot exceed outstanding balance of ₹${maxIslamicStudies}` },
        { status: 400 }
      )
    }
    if (validatedData.vanFee > maxVanFee) {
      return NextResponse.json(
        { error: `Van fee payment cannot exceed outstanding balance of ₹${maxVanFee}` },
        { status: 400 }
      )
    }

    // Validate total amount matches sum of individual fees
    const calculatedTotal = 
      validatedData.schoolFee +
      validatedData.bookFee +
      validatedData.uniformFee +
      validatedData.islamicStudies +
      validatedData.vanFee

    if (Math.abs(validatedData.totalAmountPaid - calculatedTotal) > 0.01) {
      return NextResponse.json(
        { error: "Total amount paid must match sum of individual fee components" },
        { status: 400 }
      )
    }

    // Generate unique receipt number
    const receiptNo = generateReceiptNumber()

    // Create the fee transaction using a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create fee transaction
      const feeTransaction = await tx.feeTxn.create({
        data: {
          studentYearId: validatedData.studentYearId,
          schoolFee: validatedData.schoolFee,
          bookFee: validatedData.bookFee,
          uniformFee: validatedData.uniformFee,
          islamicStudies: validatedData.islamicStudies,
          vanFee: validatedData.vanFee,
          totalAmountPaid: validatedData.totalAmountPaid,
          paymentDate: validatedData.paymentDate,
          receiptNo,
          paymentMethod: validatedData.paymentMethod,
          remarks: validatedData.remarks,
          createdBy: validatedData.createdBy,
        },
      })

      // Update or create paid fee record
      const updatedPaidFee = await tx.paidFee.upsert({
        where: { studentYearId: validatedData.studentYearId },
        update: {
          schoolFeePaid: { increment: validatedData.schoolFee },
          bookFeePaid: { increment: validatedData.bookFee },
          uniformFeePaid: { increment: validatedData.uniformFee },
          islamicStudiesPaid: { increment: validatedData.islamicStudies },
          vanFeePaid: { increment: validatedData.vanFee },
          totalPaid: { increment: validatedData.totalAmountPaid },
          lastPaymentDate: validatedData.paymentDate,
        },
        create: {
          studentYearId: validatedData.studentYearId,
          schoolFeePaid: validatedData.schoolFee,
          bookFeePaid: validatedData.bookFee,
          uniformFeePaid: validatedData.uniformFee,
          islamicStudiesPaid: validatedData.islamicStudies,
          vanFeePaid: validatedData.vanFee,
          totalPaid: validatedData.totalAmountPaid,
          lastPaymentDate: validatedData.paymentDate,
        },
      })

      return { feeTransaction, updatedPaidFee }
    })

    // Return the transaction with enrollment details
    const transactionWithDetails = await prisma.feeTxn.findUnique({
      where: { id: result.feeTransaction.id },
      include: {
        studentYear: {
          include: {
            student: true,
            academicYear: true,
            class: true,
            commonFee: true,
            paidFee: true,
          },
        },
      },
    })

    return NextResponse.json(transactionWithDetails, { status: 201 })
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