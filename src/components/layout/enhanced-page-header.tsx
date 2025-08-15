"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, LogOut, UserCircle, CalendarDays } from "lucide-react"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import Image from "next/image"

interface EnhancedPageHeaderProps {
  title: string
  showBackButton?: boolean
  children?: React.ReactNode
}

export default function EnhancedPageHeader({ 
  title, 
  showBackButton = false, 
  children 
}: EnhancedPageHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { academicYear, academicYears, switchAcademicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()

  const handleBack = () => {
    router.back()
  }

  const handleAcademicYearChange = (yearId: string) => {
    switchAcademicYear(yearId)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity min-w-0 flex-1"
              onClick={() => navigateTo("/dashboard")}
            >
              <Image
                src="/education.png"
                alt="School Logo"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate">
                  {title}
                </h1>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">
                  Student Management System
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Academic Year Selector - Hidden on mobile */}
            {academicYear && academicYears.length > 0 && (
              <div className="hidden sm:flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <Select value={academicYear.id} onValueChange={handleAcademicYearChange}>
                  <SelectTrigger className="w-[140px] lg:w-[180px]">
                    <SelectValue>
                      <Badge variant="outline" className="text-sm">
                        {academicYear.year}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year} {year.isActive && "(Active)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {children}
            
            {/* User Info - Simplified on mobile */}
            <div className="flex items-center space-x-2">
              <UserCircle className="h-5 w-5 text-gray-400" />
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {session?.user?.username}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {session?.user?.role}
                </span>
              </div>
              <div className="sm:hidden">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {session?.user?.role}
                </span>
              </div>
            </div>
            
            {/* Logout - Icon only on mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}