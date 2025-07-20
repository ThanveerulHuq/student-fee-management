"use client"

import { useAcademicYear } from '@/contexts/academic-year-context'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface AcademicYearGuardProps {
  children: React.ReactNode
}

export default function AcademicYearGuard({ children }: AcademicYearGuardProps) {
  const { academicYear, loading, error, isReady } = useAcademicYear()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated" && !loading && !academicYear && isReady) {
      router.push("/select-academic-year")
      return
    }
  }, [status, academicYear, loading, isReady, router])

  // Show loading while session or academic year is loading
  if (status === "loading" || loading || !isReady) {
    return <Spinner size="2xl" fullScreen />
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Year Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or no academic year selected
  if (!session || !academicYear) {
    return null
  }

  return <>{children}</>
}