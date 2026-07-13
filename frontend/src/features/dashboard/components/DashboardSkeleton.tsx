import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans" dir="rtl">
      {/* Skeleton for Welcome Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border/50 p-2 md:p-5 shadow-sm h-32 flex flex-col justify-center">
        <div className="px-4 space-y-4">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-3/4 max-w-md rounded-lg" />
        </div>
      </div>

      {/* Skeletons for Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-32 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
