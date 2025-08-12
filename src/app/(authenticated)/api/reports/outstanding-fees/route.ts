import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get("academicYearId")
    const classId = searchParams.get("classId")
    const section = searchParams.get("section")
    const minOutstanding = parseFloat(searchParams.get("minOutstanding") || "1")
    const search = searchParams.get("search")
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    
    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // Build comprehensive where conditions for Prisma
    // Note: For MongoDB composite types, we need to use a different approach
    const enrollmentWhere: any = {
      isActive: true
    }

    if (academicYearId) enrollmentWhere.academicYearId = academicYearId
    if (classId) enrollmentWhere.classId = classId
    if (section) enrollmentWhere.section = section

    // Add search filter using Prisma OR conditions
    if (search) {
      enrollmentWhere.OR = [
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { student: { fatherName: { contains: search, mode: 'insensitive' } } },
        { student: { admissionNumber: { contains: search, mode: 'insensitive' } } },
        { class: { className: { contains: search, mode: 'insensitive' } } },
        { section: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build order by for Prisma
    let orderBy: any = [{ student: { name: sortOrder as any } }]
    
    switch (sortBy) {
      case "name":
        orderBy = [{ student: { name: sortOrder as any } }]
        break
      case "class":
        orderBy = [{ class: { className: sortOrder as any } }]
        break
      case "outstanding":
        // For outstanding amount sorting, we need to use raw query or handle in memory
        // Since Prisma doesn't support sorting by nested embedded fields easily
        orderBy = [{ student: { name: "asc" } }] // Will sort manually after
        break
    }

    // Get all enrollments first (we need to filter by minOutstanding after fetching)
    const allEnrollments = await prisma.studentEnrollment.findMany({
      where: enrollmentWhere,
      select: {
        id: true,
        section: true,
        student: {
          select: {
            name: true,
            fatherName: true,
            mobileNo: true,
            admissionNumber: true
          }
        },
        class: {
          select: {
            className: true
          }
        },
        totals: true, // Get the entire totals object
        fees: {
          select: {
            templateName: true,
            amount: true,
            amountPaid: true,
            amountDue: true
          }
        }
      }
    })

    // Filter by minOutstanding and apply sorting
    const filteredEnrollments = allEnrollments
      .filter(enrollment => enrollment.totals.netAmount.due >= minOutstanding)

    // Apply sorting
    let sortedEnrollments = filteredEnrollments
    switch (sortBy) {
      case "name":
        sortedEnrollments = filteredEnrollments.sort((a, b) => {
          const comparison = a.student.name.localeCompare(b.student.name)
          return sortOrder === "desc" ? -comparison : comparison
        })
        break
      case "class":
        sortedEnrollments = filteredEnrollments.sort((a, b) => {
          const comparison = a.class.className.localeCompare(b.class.className)
          return sortOrder === "desc" ? -comparison : comparison
        })
        break
      case "outstanding":
        sortedEnrollments = filteredEnrollments.sort((a, b) => {
          const comparison = a.totals.netAmount.due - b.totals.netAmount.due
          return sortOrder === "desc" ? -comparison : comparison
        })
        break
    }

    // Get total count after filtering
    const totalCount = sortedEnrollments.length

    // Apply pagination
    const processedEnrollments = sortedEnrollments.slice(skip, skip + limit)

    // Transform data in one pass
    const studentsWithOutstanding = processedEnrollments.map(enrollment => ({
      id: enrollment.id,
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
        .filter(fee => fee.amountDue > 0)
        .map(fee => ({
          templateName: fee.templateName,
          amount: fee.amount,
          paid: fee.amountPaid,
          outstanding: fee.amountDue
        }))
    }))

    // Calculate summary statistics efficiently using filtered enrollments
    const classTotals = sortedEnrollments.reduce((acc, enrollment) => {
      const className = enrollment.class.className
      const existing = acc.find(item => item.class === className)
      if (existing) {
        existing.studentsCount += 1
        existing.outstandingAmount += enrollment.totals.netAmount.due
      } else {
        acc.push({
          class: className,
          studentsCount: 1,
          outstandingAmount: enrollment.totals.netAmount.due
        })
      }
      return acc
    }, [] as Array<{ class: string; studentsCount: number; outstandingAmount: number }>)

    const totalOutstandingAmount = sortedEnrollments.reduce((sum, enrollment) => 
      sum + enrollment.totals.netAmount.due, 0)

    const summary = {
      totalStudents: totalCount,
      studentsWithOutstanding: totalCount,
      totalOutstandingAmount,
      classTotals: classTotals.sort((a, b) => a.class.localeCompare(b.class))
    }

    const pagination = {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
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