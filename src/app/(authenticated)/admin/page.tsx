"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  UserCog,
  Layers,
  Award,
  Settings,
  Shield,
  Calendar
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter();

  const adminMenuItems = [
    {
      title: "User Management",
      description: "Manage system users and their roles",
      icon: UserCog,
      action: () => router.push("/admin/users"),
      color: "bg-red-500",
    },
    {
      title: "Academic Years",
      description: "Manage academic year periods and settings",
      icon: Calendar,
      action: () => router.push("/admin/academic-years"),
      color: "bg-blue-500",
    },
    {
      title: "Fee Templates",
      description: "Manage fee types and categories",
      icon: Layers,
      action: () => router.push("/admin/fee-templates"),
      color: "bg-teal-500",
    },
    {
      title: "Scholarship Templates",
      description: "Manage scholarship types and categories",
      icon: Award,
      action: () => router.push("/admin/scholarship-templates"),
      color: "bg-yellow-500",
    },
    {
      title: "Fee Structures",
      description: "Configure fee structures per class and year",
      icon: Settings,
      action: () => router.push("/admin/fee-structures"),
      color: "bg-slate-500",
    }
  ]

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Shield className="h-7 w-7 mr-3 text-red-500" />
          Admin Panel
        </h2>
        <p className="text-gray-600">
          Manage system settings, users, and configurations
        </p>
      </div>

      {/* Admin Panel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminMenuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Card 
              key={item.title}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-red-100 hover:border-red-200"
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
    </main>
  );
}