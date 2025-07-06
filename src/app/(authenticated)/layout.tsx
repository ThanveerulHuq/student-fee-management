"use client"

import { AcademicYearProvider } from '@/contexts/academic-year-context'
import AcademicYearGuard from '@/components/ui/academic-year-guard'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AcademicYearProvider>
      <AcademicYearGuard>
        {children}
      </AcademicYearGuard>
    </AcademicYearProvider>
    
  )
}