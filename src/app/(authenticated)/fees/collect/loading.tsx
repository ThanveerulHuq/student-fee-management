import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"

export default function CollectFeeLoading() {
  return (
    <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span>Collect Fees</span>
          </CardTitle>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search Bar Skeleton */}
            <div className="relative">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            
            {/* Content Area Skeleton */}
            <div className="max-h-96 overflow-y-auto">
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}