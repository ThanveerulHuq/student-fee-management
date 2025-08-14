import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const paymentId = params.id

    await db.connect()
    
    // Get payment record with minimal data
    const payment = await db.payment.findById(paymentId).lean()

    if (!payment) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    // Get student enrollment for basic info
    const enrollment = await db.studentEnrollment.findById(payment.studentEnrollmentId).lean()

    if (!enrollment) {
      return NextResponse.json({ error: "Student enrollment not found" }, { status: 404 })
    }

    // get recent payments before this payment
    const recentPayments = await db.payment
      .find({
        studentEnrollmentId: payment.studentEnrollmentId,
        paymentDate: { $lt: payment.paymentDate }
      })
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean()

    // Prepare complete receipt data (same as authenticated API)
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
        phone: enrollment.student.mobileNo,
        class: enrollment.class.className,
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
    console.error("Error fetching public receipt:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}