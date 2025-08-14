import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import type { Session } from "next-auth"
import { StudentFee } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.connect()

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get("academicYearId")
    const classId = searchParams.get("classId")
    const section = searchParams.get("section")
    const minOutstanding = parseFloat(searchParams.get("minOutstanding") || "1")
    const search = searchParams.get("search")
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam) : null
    const skip = limit ? (page - 1) * limit : 0
    
    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // Build MongoDB filter
    const filter: any = {
      isActive: true,
      'totals.netAmount.due': { $gte: minOutstanding }
    }

    if (academicYearId) filter.academicYearId = academicYearId
    if (classId) filter.classId = classId
    if (section) filter.section = section

    // Add search filter
    if (search) {
      filter.$or = [
        { 'student.name': { $regex: search, $options: 'i' } },
        { 'student.fatherName': { $regex: search, $options: 'i' } },
        { 'student.admissionNumber': { $regex: search, $options: 'i' } },
        { 'class.className': { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    let sort: any = { 'student.name': sortOrder === 'desc' ? -1 : 1 }
    
    switch (sortBy) {
      case "name":
        sort = { 'student.name': sortOrder === 'desc' ? -1 : 1 }
        break
      case "class":
        sort = { 'class.className': sortOrder === 'desc' ? -1 : 1 }
        break
      case "outstanding":
        sort = { 'totals.netAmount.due': sortOrder === 'desc' ? -1 : 1 }
        break
    }

    // Get all enrollments with filtering and sorting
    const query = db.studentEnrollment
      .find(filter)
      .sort(sort)
      .select({
        _id: 1,
        section: 1,
        student: 1,
        class: 1,
        totals: 1,
        'fees.templateName': 1,
        'fees.amount': 1,
        'fees.amountPaid': 1,
        'fees.amountDue': 1
      })

    const [allEnrollments, totalCount] = await Promise.all([
      limit ? query.skip(skip).limit(limit).lean() : query.lean(),
      db.studentEnrollment.countDocuments(filter)
    ])

    // Transform data in one pass
    const studentsWithOutstanding = allEnrollments.map(enrollment => ({
      id: enrollment._id,
      name: enrollment.student.name,
      fatherName: enrollment.student.fatherName,
      mobileNo: enrollment.student.mobileNo,
      admissionNo: enrollment.student.admissionNumber,
      class: enrollment.class.className,
      section: enrollment.section,
      totalFees: enrollment.totals.netAmount.total,
      paidAmount: enrollment.totals.netAmount.paid,
      outstandingAmount: enrollment.totals.netAmount.due,
      fees: enrollment.fees
        .filter((fee: StudentFee) => fee.amountDue > 0)
        .map((fee: StudentFee) => ({
          templateName: fee.templateName,
          amount: fee.amount,
          paid: fee.amountPaid,
          outstanding: fee.amountDue
        }))
    }))

    // Calculate summary statistics using aggregation pipeline for better performance
    const summaryPipeline = [
      { $match: filter },
      {
        $group: {
          _id: '$class.className',
          studentsCount: { $sum: 1 },
          outstandingAmount: { $sum: '$totals.netAmount.due' }
        }
      },
      { $sort: { _id: 1 } }
    ]

    const [classTotalsResult, totalOutstandingResult] = await Promise.all([
      db.studentEnrollment.aggregate(summaryPipeline as any),
      db.studentEnrollment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOutstanding: { $sum: '$totals.netAmount.due' }
          }
        }
      ])
    ])

    const classTotals = classTotalsResult.map(item => ({
      class: item._id,
      studentsCount: item.studentsCount,
      outstandingAmount: item.outstandingAmount
    }))

    const totalOutstandingAmount = totalOutstandingResult[0]?.totalOutstanding || 0

    const summary = {
      totalStudents: totalCount,
      studentsWithOutstanding: totalCount,
      totalOutstandingAmount,
      classTotals
    }

    const pagination = {
      page,
      limit,
      total: totalCount,
      pages: limit ? Math.ceil(totalCount / limit) : 1
    }

    return NextResponse.json({
      students: studentsWithOutstanding,
      summary,
      pagination,
      filters: {
        academicYearId,
        classId,
        section,
        minOutstanding,
        search,
        sortBy,
        sortOrder
      },
      generatedAt: new Date(),
      generatedBy: session.user.username
    })

  } catch (error) {
    console.error("Error generating outstanding fees report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}