"use client"

import { AcademicYearProvider } from '@/contexts/academic-year-context'
import AcademicYearGuard from '@/components/ui/academic-year-guard'
import EnhancedPageHeader from '@/components/layout/enhanced-page-header'
import Sidebar from '@/components/layout/sidebar'
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
          <div className="flex h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <div className="p-4 md:p-6 lg:p-8 max-w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AcademicYearGuard>
    </AcademicYearProvider>
    </Providers>
  )
}