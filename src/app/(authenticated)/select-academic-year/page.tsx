"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import AcademicYearSelector from "@/components/ui/academic-year-selector"
import LoaderOne from "@/components/ui/loader-one"
import { CalendarDays, ArrowRight } from "lucide-react"

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
}

export default function SelectAcademicYearPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [academicYearId, setAcademicYearId] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const handleContinue = async () => {
    if (!academicYearId) {
      setErrorMessage("Please select an academic year")
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      // Store academic year in localStorage for now
      // We'll implement proper session storage later
      const response = await fetch('/api/academic-years')
      if (response.ok) {
        const academicYears: AcademicYear[] = await response.json()
        const selectedYear = academicYears.find(year => year.id === academicYearId)
        
        if (selectedYear) {
          // Store in localStorage
          localStorage.setItem('selectedAcademicYear', JSON.stringify({
            id: selectedYear.id,
            year: selectedYear.year
          }))
          
          // Redirect to dashboard with academic year parameter
          router.push(`/dashboard?academicYearId=${academicYearId}`)
        }
      }
    } catch (error) {
      console.error('Error selecting academic year:', error)
      setErrorMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoaderOne />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CalendarDays className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Select Academic Year</CardTitle>
          <CardDescription>
            Choose the academic year you want to work with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                {errorMessage}
              </Alert>
            )}
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Welcome, <span className="font-medium">{session.user.username}</span>! 
                Please select the academic year to continue.
              </p>
              
              <AcademicYearSelector
                value={academicYearId}
                onValueChange={setAcademicYearId}
                disabled={loading}
              />
            </div>
            
            <Button 
              onClick={handleContinue}
              className="w-full" 
              disabled={loading || !academicYearId}
            >
              {loading ? "Please wait..." : "Continue"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}