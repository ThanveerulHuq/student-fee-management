import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import type { Session } from "next-auth"
import mongoose from "mongoose"
import { PaymentItem } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.connect()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const studentId = searchParams.get("studentId")
    const receiptNo = searchParams.get("receiptNo")
    const paymentMethod = searchParams.get("paymentMethod")
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const sortBy = searchParams.get("sortBy") || "paymentDate"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const skip = (page - 1) * limit

    // Build MongoDB filter
    const filter: {
      status: string;
      paymentDate?: { $gte?: Date; $lte?: Date };
      studentEnrollmentId?: mongoose.Types.ObjectId;
      $or?: Array<Record<string, unknown>>;
      receiptNo?: { $regex: string; $options: string };
      paymentMethod?: string;
    } = {
      status: "COMPLETED" // Only completed payments
    }

    // Date range filter
    if (startDate || endDate) {
      filter.paymentDate = {}
      if (startDate) {
        filter.paymentDate.$gte = new Date(startDate)
      }
      if (endDate) {
        // Add one day to include the end date
        const endDateTime = new Date(endDate)
        endDateTime.setDate(endDateTime.getDate() + 1)
        filter.paymentDate.$lte = endDateTime
      }
    }

    // Student filter - supports name, admission number, or enrollment ID
    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(studentId)) {
        // If it's a valid ObjectId, search by enrollment ID
        filter.studentEnrollmentId = new mongoose.Types.ObjectId(studentId)
      } else {
        // Otherwise, search by student name, father name, or admission number
        filter.$or = [
          { 'student.name': { $regex: studentId, $options: 'i' } },
          { 'student.fatherName': { $regex: studentId, $options: 'i' } },
          { 'student.admissionNo': { $regex: studentId, $options: 'i' } }
        ]
      }
    }

    // Receipt number filter (partial match)
    if (receiptNo) {
      filter.receiptNo = { $regex: receiptNo, $options: 'i' }
    }

    // Payment method filter
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod
    }

    // Build sort object
    let sort: Record<string, 1 | -1> = { paymentDate: sortOrder === 'desc' ? -1 : 1 }
    
    switch (sortBy) {
      case "paymentDate":
        sort = { paymentDate: sortOrder === 'desc' ? -1 : 1 }
        break
      case "totalAmount":
        sort = { totalAmount: sortOrder === 'desc' ? -1 : 1 }
        break
      case "receiptNo":
        sort = { receiptNo: sortOrder === 'desc' ? -1 : 1 }
        break
      case "studentName":
        sort = { 'student.name': sortOrder === 'desc' ? -1 : 1 }
        break
    }

    // Get paginated payments and total count
    const [payments, totalCount] = await Promise.all([
      db.payment
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      db.payment.countDocuments(filter)
    ])

    // Process paginated payments for the report
    const processedPayments = payments.map(payment => ({
      id: payment._id,
      receiptNo: payment.receiptNo,
      studentName: payment.student.name,
      studentFatherName: payment.student.fatherName,
      studentPhone: payment.student.mobileNo,
      studentClass: payment.academicYear.year,
      totalAmount: payment.totalAmount,
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      remarks: payment.remarks,
      createdBy: payment.createdBy,
      paymentItems: payment.paymentItems.map((item: PaymentItem) => ({
        feeTemplateName: item.feeTemplateName,
        amount: item.amount,
        feeBalance: item.feeBalance
      }))
    }))

    // Calculate summary statistics using aggregation pipeline for better performance
    const summaryPipeline = [
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          averagePayment: { $avg: '$totalAmount' }
        }
      }
    ]

    const paymentMethodPipeline = [
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { amount: -1 } }
    ]

    const dailySummaryPipeline = [
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]

    const collectorSummaryPipeline = [
      { $match: filter },
      {
        $group: {
          _id: '$createdBy',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { amount: -1 } }
    ]

    const [summaryResult, paymentMethodResult, dailySummaryResult, collectorSummaryResult] = await Promise.all([
      db.payment.aggregate(summaryPipeline),
      db.payment.aggregate(paymentMethodPipeline),
      db.payment.aggregate(dailySummaryPipeline),
      db.payment.aggregate(collectorSummaryPipeline)
    ])

    const summaryData = summaryResult[0] || { totalPayments: 0, totalAmount: 0, averagePayment: 0 }

    const summary = {
      totalPayments: summaryData.totalPayments,
      totalAmount: summaryData.totalAmount,
      averagePayment: summaryData.averagePayment,
      paymentMethodBreakdown: paymentMethodResult.map(item => ({
        method: item._id,
        count: item.count,
        amount: item.amount
      })),
      dailySummary: dailySummaryResult.map(item => ({
        date: item._id,
        count: item.count,
        amount: item.amount
      })),
      collectorSummary: collectorSummaryResult.map(item => ({
        collector: item._id,
        count: item.count,
        amount: item.amount
      }))
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      payments: processedPayments,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      },
      filters: {
        startDate,
        endDate,
        studentId,
        receiptNo,
        paymentMethod
      },
      generatedAt: new Date(),
      generatedBy: session.user.username
    })

  } catch (error) {
    console.error("Error generating fee payments report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 