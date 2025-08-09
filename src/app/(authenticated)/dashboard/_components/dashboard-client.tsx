"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3,
  GraduationCap,
  Settings
} from "lucide-react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import { trackDashboardVisit, trackPageView } from "@/lib/analytics"
import type { DashboardStats } from "@/lib/data/dashboard"

interface DashboardClientProps {
  stats: DashboardStats
  userRole: string
}

export function DashboardClient({ stats, userRole }: DashboardClientProps) {
  const { goToStudents, goToFeeCollection, goToReports, navigateTo } = useAcademicYearNavigation()
  
  const isAdmin = userRole === "ADMIN"

  // Track dashboard visit
  useEffect(() => {
    trackDashboardVisit()
    trackPageView('Dashboard', 'dashboard')
  }, [])

  const menuItems = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student information",
      icon: Users,
      action: goToStudents,
      color: "bg-blue-500",
    },
    {
      title: "Student Enrollments", 
      description: "Manage student class enrollments and assignments",
      icon: GraduationCap,
      action: () => navigateTo("/enrollments"),
      color: "bg-indigo-500",
    },
    {
      title: "Fee Collection",
      description: "Collect fees and print receipts",
      icon: CreditCard,
      action: goToFeeCollection,
      color: "bg-green-500",
    },
    {
      title: "Reports",
      description: "Generate student and fee collection reports",
      icon: FileText,
      action: goToReports,
      color: "bg-purple-500",
    },
    {
      title: "Analytics",
      description: "View payment analytics and statistics",
      icon: BarChart3,
      action: () => navigateTo("/analytics"),
      color: "bg-orange-500",
    },
    ...(isAdmin ? [{
      title: "Settings",
      description: "System settings and administration",
      icon: Settings,
      action: () => navigateTo("/admin"),
      color: "bg-gray-600",
    }] : [])
  ]

  return (
    <>
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Card 
              key={item.title}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={item.action}
            >
              <CardHeader className="pb-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${item.color} text-white mb-3`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalStudents}
            </div>
            <p className="text-sm text-gray-600">
              {stats.activeStudents} active enrollments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{stats.totalCollectedFees.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">This academic year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Outstanding Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{stats.outstandingFees.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Pending collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {stats.recentPayments.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
              <CardDescription>Latest fee collections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-600">Receipt #{payment.receiptNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}