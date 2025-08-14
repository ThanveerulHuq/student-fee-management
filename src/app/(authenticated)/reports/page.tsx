"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Calendar
} from "lucide-react"
import { useRouter } from "next/navigation"
import SecondaryHeader from "@/components/ui/secondary-header"

export default function ReportsPage() {
  const router = useRouter()

  const reportTypes = [
    {
      title: "Outstanding Fees Report",
      description: "View all students with pending fee payments and outstanding balances",
      icon: TrendingUp,
      href: `/reports/outstanding-fees`,
      color: "bg-red-500",
      features: [
        "Outstanding balance tracking",
        "Student contact information",
        "Class and section filters",
        "CSV export for follow-up"
      ]
    },
    {
      title: "Fee Payments Report",
      description: "Comprehensive report of all fee payments with advanced filtering",
      icon: DollarSign,
      href: `/reports/fee-payments`,
      color: "bg-green-500",
      features: [
        "Date range filtering",
        "Student-wise payment tracking",
        "Receipt number search",
        "Payment method breakdown"
      ]
    }
  ]


  return (
    <>
      <SecondaryHeader 
        title="Reports & Analytics" 
        showBackButton={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reports
          </h2>
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
      </main>
    </>
  )
}