import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function AdminLoading() {
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Shield className="h-7 w-7 mr-3 text-red-500" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Admin Panel Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse border-red-100">
            <CardHeader className="pb-3">
              <Skeleton className="w-12 h-12 rounded-lg mb-3" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  )
}