"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3,
  LogOut,
  UserCircle
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const menuItems = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student information",
      icon: Users,
      href: "/students",
      color: "bg-blue-500"
    },
    {
      title: "Fee Management",
      description: "Collect fees and manage payment records",
      icon: CreditCard,
      href: "/fees",
      color: "bg-green-500"
    },
    {
      title: "Reports",
      description: "Generate student and fee collection reports",
      icon: FileText,
      href: "/reports",
      color: "bg-purple-500"
    },
    {
      title: "Analytics",
      description: "View payment analytics and statistics",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                BlueMoon SDMS
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {session.user.username}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {session.user.role}
                </span>
              </div>
              
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.username}!
          </h2>
          <p className="text-gray-600">
            Manage your school data efficiently with BlueMoon SDMS
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Card 
                key={item.title}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => router.push(item.href)}
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
        </div>
      </main>
    </div>
  )
}