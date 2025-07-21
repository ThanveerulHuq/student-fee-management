"use client"

import { AcademicYearProvider } from '@/contexts/academic-year-context'
import AcademicYearGuard from '@/components/ui/academic-year-guard'
import EnhancedPageHeader from '@/components/ui/enhanced-page-header'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AcademicYearProvider>
      <AcademicYearGuard>
        <div className="min-h-screen bg-gray-50">
          <EnhancedPageHeader 
            title="Dhaarussalam Matriculation Higher Secondary School"
          />
          {children}
        </div>
      </AcademicYearGuard>
    </AcademicYearProvider>
  )
}