"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAcademicYearNavigation } from "@/contexts/academic-year-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  DollarSign,
  Receipt,
  BookOpen,
  Target,
  Menu,
  X
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: any
  adminOnly?: boolean
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
    children: [
      { name: "All Students", href: "/students", icon: Users },
      { name: "Add Student", href: "/students/add", icon: UserCheck },
    ]
  },
  {
    name: "Enrollments",
    href: "/enrollments",
    icon: GraduationCap,
    children: [
      { name: "All Enrollments", href: "/enrollments", icon: GraduationCap },
      { name: "Enroll Student", href: "/enrollments/enroll", icon: UserCheck },
    ]
  },
  {
    name: "Collect Fee",
    href: "/fees/collect",
    icon: CreditCard,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    children: [
      { name: "Fee Payments", href: "/reports/fee-payments", icon: Receipt },
      { name: "Outstanding Fees", href: "/reports/outstanding-fees", icon: Target },
    ]
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Settings,
    adminOnly: true,
    children: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Academic Years", href: "/admin/academic-years", icon: Calendar },
      { name: "Fee Templates", href: "/admin/fee-templates", icon: BookOpen },
      { name: "Scholarship Templates", href: "/admin/scholarship-templates", icon: Target },
      { name: "Fee Structures", href: "/admin/fee-structures", icon: DollarSign },
    ]
  },
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    }
    return false
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { data: session } = useSession()
  const { navigateTo } = useAcademicYearNavigation()

  const isAdmin = session?.user?.role === "ADMIN"

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString())
  }, [isCollapsed])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const filteredItems = navigationItems.filter(item => 
    !item.adminOnly || isAdmin
  )

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    navigateTo(href)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 p-0 bg-white border border-gray-200 shadow-lg rounded-lg hover:bg-gray-50"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 z-30",
        // Desktop behavior
        "hidden md:flex",
        isCollapsed ? "md:w-16" : "md:w-64",
        // Mobile behavior
        isMobileOpen && "fixed inset-y-0 left-0 flex w-64 shadow-xl",
        className
      )}>
        {/* Desktop Toggle Button */}
        <div className="hidden md:flex justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Navigation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="px-3 py-4">
            <nav className="space-y-1">
              {filteredItems.map((item) => {
                const isExpanded = expandedItems.includes(item.name)
                const hasChildren = item.children && item.children.length > 0
                const isActive = isItemActive(item.href)

                return (
                  <div key={item.name}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10 font-medium",
                        isCollapsed && "md:px-2",
                        isActive 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "hover:bg-gray-100 text-gray-900"
                      )}
                      onClick={() => {
                        if (hasChildren && !isCollapsed) {
                          toggleExpanded(item.name)
                        } else {
                          handleNavigation(item.href)
                        }
                      }}
                    >
                      <item.icon className={cn(
                        "h-5 w-5",
                        isCollapsed ? "md:mx-auto" : "mr-3"
                      )} />
                      {(!isCollapsed || isMobileOpen) && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          {hasChildren && (
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90"
                            )} />
                          )}
                        </>
                      )}
                    </Button>

                    {/* Children */}
                    {hasChildren && isExpanded && (!isCollapsed || isMobileOpen) && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-4">
                        {item.children?.map((child) => {
                          const isChildActive = isItemActive(child.href)
                          return (
                            <Button
                              key={child.name}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start h-8 text-sm font-normal",
                                isChildActive 
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                                  : "text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                              )}
                              onClick={() => handleNavigation(child.href)}
                            >
                              <child.icon className="h-4 w-4 mr-3" />
                              {child.name}
                            </Button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="border-t border-gray-200 p-4 mt-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {session?.user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}