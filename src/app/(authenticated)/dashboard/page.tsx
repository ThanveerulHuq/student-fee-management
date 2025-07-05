"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3,
  GraduationCap
} from "lucide-react"
import { useAcademicYear, useAcademicYearNavigation } from "@/contexts/academic-year-context"
import EnhancedPageHeader from "@/components/ui/enhanced-page-header"

export default function DashboardPage() {
  const { academicYear } = useAcademicYear()
  const { goToStudents, goToFees, goToReports, navigateTo } = useAcademicYearNavigation()
  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === "true"

  const allMenuItems = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student information",
      icon: Users,
      action: goToStudents,
      color: "bg-blue-500",
      isDemo: true
    },
    {
      title: "Student Enrollments", 
      description: "Manage student class enrollments and assignments",
      icon: GraduationCap,
      action: () => navigateTo("/enrollments"),
      color: "bg-indigo-500",
      isDemo: false
    },
    {
      title: "Fee Management",
      description: "Collect fees and manage payment records",
      icon: CreditCard,
      action: goToFees,
      color: "bg-green-500",
      isDemo: false
    },
    {
      title: "Reports",
      description: "Generate student and fee collection reports",
      icon: FileText,
      action: goToReports,
      color: "bg-purple-500",
      isDemo: false
    },
    {
      title: "Analytics",
      description: "View payment analytics and statistics",
      icon: BarChart3,
      action: () => navigateTo("/analytics"),
      color: "bg-orange-500",
      isDemo: false
    }
  ]

  const menuItems = allMenuItems.filter(item => !isDemo || item.isDemo)

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedPageHeader title="Dhaarussalam Matriculation Higher Secondary School" />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">--</div>
              <p className="text-sm text-gray-600">Active enrollments</p>
            </CardContent>
          </Card>
          
          {!isDemo && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Monthly Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹--</div>
                  <p className="text-sm text-gray-600">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹--</div>
                  <p className="text-sm text-gray-600">Outstanding amount</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}