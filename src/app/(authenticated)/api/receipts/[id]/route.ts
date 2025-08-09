import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {

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

    // get recent payments before this payment
    const recentPayments = await prisma.payment.findMany({
      where: {
        studentEnrollmentId: payment.studentEnrollmentId,
        paymentDate: { lt: payment.paymentDate }
      },
      orderBy: { paymentDate: 'desc' },
      take: 5
    })

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
        admissionNo: enrollment.student.admissionNumber,
        name: `${enrollment.student.name}`,
        fatherName: enrollment.student.fatherName,
        mobileNo: enrollment.student.mobileNo,
        class: enrollment.student.class,
        status: enrollment.student.status
      },
      
      // Academic year info (embedded in payment)
      academicYear: {
        year: enrollment.academicYear.year,
        startDate: enrollment.academicYear.startDate,
        endDate: enrollment.academicYear.endDate,
        isActive: enrollment.academicYear.isActive
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
      },
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        receiptNo: payment.receiptNo,
        paymentDate: payment.paymentDate,
        totalAmount: payment.totalAmount,
        paymentMethod: payment.paymentMethod,
      }))
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