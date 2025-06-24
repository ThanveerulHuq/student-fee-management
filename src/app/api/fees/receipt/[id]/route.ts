import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const transactionId = params.id

    const transaction = await prisma.feeTxn.findUnique({
      where: { id: transactionId },
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

    if (!transaction) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    // Calculate remaining balance after this payment
    const totalFee = 
      transaction.studentYear.commonFee.schoolFee +
      transaction.studentYear.commonFee.bookFee +
      transaction.studentYear.uniformFee +
      transaction.studentYear.islamicStudies +
      transaction.studentYear.vanFee -
      transaction.studentYear.scholarship

    const totalPaid = transaction.studentYear.paidFee?.totalPaid || 0
    const remainingBalance = Math.max(0, totalFee - totalPaid)

    const receiptData = {
      ...transaction,
      calculatedData: {
        totalAnnualFee: totalFee,
        totalPaidSoFar: totalPaid,
        remainingBalance,
        scholarship: transaction.studentYear.scholarship,
      },
    }

    return NextResponse.json(receiptData)
  } catch (error) {
    console.error("Error fetching receipt:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}