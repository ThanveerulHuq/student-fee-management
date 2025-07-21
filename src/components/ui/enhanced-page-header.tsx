"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, LogOut, UserCircle, CalendarDays } from "lucide-react"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import Image from "next/image"

interface EnhancedPageHeaderProps {
  title: string
  showBackButton?: boolean
  backPath?: string
  children?: React.ReactNode
}

export default function EnhancedPageHeader({ 
  title, 
  showBackButton = false, 
  backPath = "/dashboard",
  children 
}: EnhancedPageHeaderProps) {
  const { data: session } = useSession()
  const { academicYear, academicYears, switchAcademicYear } = useAcademicYear()
  const { navigateTo } = useAcademicYearNavigation()

  const handleBack = () => {
    navigateTo(backPath)
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
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigateTo("/dashboard")}
            >
              <Image
                src="/education.png"
                alt="School Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {title === "Dhaarussalam Matriculation Higher Secondary School" ? "Dhaarussalam School" : title}
                </h1>
                {title === "Dhaarussalam Matriculation Higher Secondary School" && (
                  <span className="text-xs text-gray-500 font-medium">
                    Student Management System
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Academic Year Selector */}
            {academicYear && academicYears.length > 0 && (
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <Select value={academicYear.id} onValueChange={handleAcademicYearChange}>
                  <SelectTrigger className="w-[180px]">
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
            
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <UserCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700">
                {session?.user?.username}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {session?.user?.role}
              </span>
            </div>
            
            {/* Logout */}
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