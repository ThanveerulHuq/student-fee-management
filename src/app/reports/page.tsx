"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Calendar
} from "lucide-react"

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const reportTypes = [
    {
      title: "Outstanding Fees Report",
      description: "View all students with pending fee payments and outstanding balances",
      icon: TrendingUp,
      href: "/reports/outstanding-fees",
      color: "bg-red-500",
      features: [
        "Outstanding balance tracking",
        "Student contact information",
        "Class and section filters",
        "CSV export for follow-up"
      ]
    },
    {
      title: "Fee Collection Report",
      description: "Track fee payments with date range and collector filters",
      icon: DollarSign,
      href: "/reports/fee-collections",
      color: "bg-green-500",
      features: [
        "Date range filtering",
        "Payment method breakdown",
        "Collector-wise reports",
        "Collection summaries"
      ]
    }
  ]

  const quickReports = [
    {
      title: "Today's Collections",
      description: "Fee collections for today",
      action: () => {
        const today = new Date().toISOString().split('T')[0]
        router.push(`/reports/fee-collections?from=${today}&to=${today}`)
      },
      icon: Calendar,
    },
    {
      title: "This Month's Collections",
      description: "Current month's collection summary",
      action: () => {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        router.push(`/reports/fee-collections?from=${monthStart}&to=${monthEnd}`)
      },
      icon: TrendingUp,
    },
    {
      title: "All Outstanding Fees",
      description: "Students with pending fees",
      action: () => router.push("/reports/outstanding-fees?minOutstanding=1"),
      icon: DollarSign,
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Reports & Analytics
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generate Reports
          </h2>
          <p className="text-gray-600">
            Access comprehensive reports and analytics for students, fee collections, and school performance.
          </p>
        </div>

        {/* Quick Reports */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickReports.map((report) => {
              const IconComponent = report.icon
              return (
                <Card 
                  key={report.title}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={report.action}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Main Report Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Reports</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const IconComponent = report.icon
              return (
                <Card 
                  key={report.title}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => router.push(report.href)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${report.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Features:</h4>
                      <ul className="space-y-1">
                        {report.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Export Options</h3>
          </div>
          <p className="text-blue-800 mb-4">
            All reports support multiple export formats for easy data sharing and analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-blue-800">CSV Format - Excel Compatible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-blue-800">PDF Format - Print Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-blue-800">JSON Format - API Compatible</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}