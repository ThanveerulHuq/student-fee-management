import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import SecondaryHeader from "@/components/ui/secondary-header"

export default function ReportsLoading() {
  return (
    <>
      <SecondaryHeader 
        title="Reports & Analytics" 
        showBackButton={true}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Introduction Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
        </div>

        {/* Section Title Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-6 w-40" />
        </div>

        {/* Report Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="space-y-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center">
                        <Skeleton className="w-1 h-1 rounded-full mr-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}