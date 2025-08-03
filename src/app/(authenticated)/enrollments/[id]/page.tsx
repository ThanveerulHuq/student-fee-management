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
import { StudentEnrollment } from '@/types/enrollment'

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
        onEdit={() => navigateTo(`/enrollments/edit/${enrollmentId}`)}
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