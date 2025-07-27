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
    const paymentId = params.id

    // Get payment record using the new Payment model
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    // Get current student enrollment for balance calculation
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: payment.studentEnrollmentId }
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Student enrollment not found" }, { status: 404 })
    }

    // Prepare receipt data using the embedded information
    const receiptData = {
      id: payment.id,
      receiptNo: payment.receiptNo,
      paymentDate: payment.paymentDate,
      totalAmount: payment.totalAmount,
      paymentMethod: payment.paymentMethod,
      remarks: payment.remarks,
      createdBy: payment.createdBy,
      status: payment.status,
      
      // Student information (embedded in payment)
      student: {
        id: enrollment.studentId,
        admissionNo: payment.student.admissionNumber,
        name: `${payment.student.firstName} ${payment.student.lastName}`,
        fatherName: payment.student.fatherName,
        phone: payment.student.phone,
        class: payment.student.class,
        status: payment.student.status
      },
      
      // Academic year info (embedded in payment)
      academicYear: {
        year: payment.academicYear.year,
        startDate: payment.academicYear.startDate,
        endDate: payment.academicYear.endDate,
        isActive: payment.academicYear.isActive
      },
      
      // Payment breakdown from embedded paymentItems
      paymentBreakdown: payment.paymentItems.map(item => ({
        feeType: item.feeTemplateName,
        amount: item.amount,
        feeBalance: item.feeBalance
      })),
      
      // Current balance information from enrollment
      calculatedData: {
        totalAnnualFee: enrollment.totals.fees.total,
        totalScholarshipApplied: enrollment.totals.scholarships.applied,
        netAnnualFee: enrollment.totals.netAmount.total,
        totalPaidSoFar: enrollment.totals.netAmount.paid,
        remainingBalance: enrollment.totals.netAmount.due,
        feeStatus: enrollment.feeStatus.status
      },
      
      // Fee breakdown at time of payment
      currentFeeStatus: {
        fees: enrollment.fees.map(fee => ({
          templateName: fee.templateName,
          total: fee.amount,
          paid: fee.amountPaid,
          outstanding: fee.amountDue,
          isCompulsory: fee.isCompulsory
        })),
        scholarships: enrollment.scholarships.filter(s => s.isActive).map(scholarship => ({
          templateName: scholarship.templateName,
          amount: scholarship.amount,
          type: scholarship.templateType
        })),
        totals: enrollment.totals
      }
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