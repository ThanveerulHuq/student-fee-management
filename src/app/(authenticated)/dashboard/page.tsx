import { requireAuth } from '@/lib/auth-utils'
import { getDashboardStats } from '@/lib/data/dashboard'
import { DashboardClient } from './_components/dashboard-client'

export default async function DashboardPage() {
  const session = await requireAuth()
  
  // Get current academic year from session or fetch default
  const academicYearId = session.user.academicYearId || undefined
  const stats = await getDashboardStats(academicYearId)
  
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.username}!
        </h2>
      </div>
      
      <DashboardClient stats={stats} userRole={session.user.role} />
    </main>
  )
}