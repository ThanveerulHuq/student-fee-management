"use client"

import { AcademicYearProvider } from '@/contexts/academic-year-context'
import AcademicYearGuard from '@/components/ui/academic-year-guard'
import EnhancedPageHeader from '@/components/ui/enhanced-page-header'
import {getSchoolConfigFromEnv} from '@/lib/schools/config'
import { Providers } from '@/components/providers/session-provider'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
    <AcademicYearProvider>
      <AcademicYearGuard>
        <div className="min-h-screen bg-gray-50">
          <EnhancedPageHeader 
            title={getSchoolConfigFromEnv().name}
          />
          {children}
        </div>
      </AcademicYearGuard>
    </AcademicYearProvider>
    </Providers>
  )
}