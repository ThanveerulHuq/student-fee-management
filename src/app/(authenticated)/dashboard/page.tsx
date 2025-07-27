"use client"

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
import { useSession } from "next-auth/react"

export default function DashboardPage() {
  const { goToStudents, goToFees, goToReports, navigateTo } = useAcademicYearNavigation();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";

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
      title: "Fee Management",
      description: "Collect fees and manage payment records",
      icon: CreditCard,
      action: goToFees,
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
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back{session?.user?.username ? `, ${session.user.username}` : ''}!
          </h2>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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
          
        </div>
    </main>
  )
}