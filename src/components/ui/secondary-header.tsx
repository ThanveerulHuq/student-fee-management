"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"

interface SecondaryHeaderProps {
  title: string
  showBackButton?: boolean
  backPath?: string
  children?: React.ReactNode
}

export default function SecondaryHeader({ 
  title, 
  showBackButton = false, 
  backPath = "/dashboard",
  children 
}: SecondaryHeaderProps) {
  const { navigateTo } = useAcademicYearNavigation()

  const handleBack = () => {
    navigateTo(backPath)
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
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
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
            </h1>
          </div>
          
          {children && (
            <div className="flex items-center space-x-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}