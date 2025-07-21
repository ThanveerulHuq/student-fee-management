"use client"

import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogOut, UserCircle, CalendarDays } from "lucide-react"

interface AcademicYear {
  id: string
  year: string
}

interface PageHeaderProps {
  title: string
  academicYearId?: string
  showBackButton?: boolean
  backUrl?: string
  children?: React.ReactNode
}

export default function PageHeader({ 
  title, 
  academicYearId,
  showBackButton = false, 
  backUrl,
  children 
}: PageHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null)

  useEffect(() => {
    if (academicYearId) {
      // Get academic year details from localStorage
      const stored = localStorage.getItem('selectedAcademicYear')
      if (stored) {
        const parsedYear = JSON.parse(stored)
        if (parsedYear.id === academicYearId) {
          setAcademicYear(parsedYear)
        }
      }
    }
  }, [academicYearId])

  const defaultBackUrl = academicYearId ? `/${academicYearId}/dashboard` : "/dashboard"
  const finalBackUrl = backUrl || defaultBackUrl

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(finalBackUrl)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {academicYear && (
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <Badge variant="outline" className="text-sm">
                  Academic Year: {academicYear.year}
                </Badge>
              </div>
            )}
            
            {academicYearId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/select-academic-year')}
                className="text-sm"
              >
                Change Year
              </Button>
            )}
            
            {children}
            
            <div className="flex items-center space-x-2">
              <UserCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700">
                {session?.user?.username}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {session?.user?.role}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}