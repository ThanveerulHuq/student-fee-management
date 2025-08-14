"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, LogOut, UserCircle, CalendarDays, ChevronDown } from "lucide-react"
import { useAcademicYear } from "@/contexts/academic-year-context"
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
  const { academicYear, academicYears, switchAcademicYear, loading } = useAcademicYear()

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
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/dashboard")}
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
                  {title}
                </h1>

                  <span className="text-xs text-gray-500 font-medium">
                    Student Management System
                  </span>
                
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Academic Year Selector */}
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-9 w-[180px]" />
                </div>
              ) : academicYear && academicYears.length > 0 ? (
                <Select value={academicYear.id} onValueChange={handleAcademicYearChange}>
                  <SelectTrigger className="w-[180px] bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 border-blue-300 text-sm font-medium"
                      >
                        {academicYear.year}
                      </Badge>
                      {academicYear.isActive && (
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent className="w-[200px]">
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{year.year}</span>
                          {year.isActive && (
                            <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-600 border-green-300">
                              Active
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>No academic years available</span>
                </div>
              )}
            </div>
            
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