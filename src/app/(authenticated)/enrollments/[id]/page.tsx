"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import LoaderWrapper from "@/components/ui/loader-wrapper"
import { toast } from "sonner"
import EnrollmentHeader from "../_components/details/enrollment-header"
import EnrollmentDetailsSection from "../_components/details/enrollment-details-section"
import FeeDetailsCard from "../_components/details/fee-details-card"
import PaymentHistoryCard from "../_components/details/payment-history-card"

interface StudentEnrollment {
  id: string
  studentId: string
  academicYearId: string
  classId: string
  section: string
  enrollmentDate: string
  isActive: boolean
  student: {
    admissionNumber: string
    firstName: string
    lastName: string
    fatherName: string
    phone: string
    class: string
    status: string
  }
  academicYear: {
    year: string
    startDate: string
    endDate: string
    isActive: boolean
  }
  class: {
    className: string
    order: number
    isActive: boolean
  }
  fees: Array<{
    id: string
    feeItemId: string
    templateId: string
    templateName: string
    templateCategory: string
    amount: number
    originalAmount: number
    amountPaid: number
    amountDue: number
    isCompulsory: boolean
    isWaived: boolean
    waivedReason?: string
    waivedBy?: string
    waivedDate?: string
    order: number
    recentPayments: Array<{
      paymentId: string
      amount: number
      paymentDate: string
      receiptNo: string
      paymentMethod: string
    }>
  }>
  scholarships: Array<{
    id: string
    scholarshipItemId: string
    templateId: string
    templateName: string
    templateType: string
    amount: number
    originalAmount: number
    isAutoApplied: boolean
    appliedDate: string
    appliedBy: string
    isActive: boolean
    remarks?: string
  }>
  totals: {
    fees: {
      compulsory: number
      optional: number
      total: number
      paid: number
      due: number
    }
    scholarships: {
      applied: number
      autoApplied: number
      manual: number
    }
    netAmount: {
      total: number
      paid: number
      due: number
    }
  }
  feeStatus: {
    status: string
    lastPaymentDate?: string
    nextDueDate?: string
    overdueAmount: number
  }
  createdAt: string
  updatedAt: string
}

interface EnrollmentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { navigateTo } = useAcademicYearNavigation()
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setEnrollmentId(p.id))
  }, [params])

  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const fetchEnrollment = useCallback(async () => {
    if (!enrollmentId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/enrollments/${enrollmentId}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollment(data)
      } else {
        console.error("Failed to fetch enrollment")
        toast.error("Failed to load enrollment details")
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error)
      toast.error("Error loading enrollment details")
    } finally {
      setLoading(false)
    }
  }, [enrollmentId])

  useEffect(() => {
    fetchEnrollment()
  }, [fetchEnrollment])

  if (status === "loading" || loading) {
    return <LoaderWrapper fullScreen label="Loading enrollment details..." />
  }

  if (!session || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Enrollment not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <EnrollmentHeader
        enrollment={enrollment}
        onEdit={() => toast.info("Edit enrollment functionality will be available soon")}
        onCollectFees={() => navigateTo(`/fees/collect/${enrollmentId}`)}
        onBack={() => navigateTo("/enrollments")}
      />
        <EnrollmentDetailsSection enrollment={enrollment} />
      <div className="space-y-6 px-6 pb-6 mt-4">
        <FeeDetailsCard enrollment={enrollment} />
        <PaymentHistoryCard enrollment={enrollment} />
      </div>
    </div>
  )
}