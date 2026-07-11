import { Skeleton } from "@/components/ui/skeleton"
import { Package, LineChart, Star, Store, Sliders } from "lucide-react"

export function ZidProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans text-right" dir="rtl">
      {/* القسم الأيمن: معرض الصور */}
      <div className="lg:col-span-1 space-y-4">
        {/* الصورة الرئيسية */}
        <div className="aspect-square rounded-2xl border border-border/40 overflow-hidden bg-muted/10 relative shadow-sm">
          <Skeleton className="size-full" />
        </div>

        {/* معرض الصور الإضافية */}
        <div className="mt-4">
          <Skeleton className="h-3 w-[100px] mb-2" />
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2 pb-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* التسعير */}
        <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
            <LineChart className="size-4 text-muted-foreground/50" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-[70px]" />
                <Skeleton className="h-4 w-[90px]" />
              </div>
            ))}
          </div>
        </div>

        {/* التقييم */}
        <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-2">
          <Skeleton className="h-3 w-[80px]" />
          <div className="flex items-center gap-1">
            <Star className="size-4 text-muted-foreground/30" />
            <Skeleton className="h-4 w-[30px]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        </div>
      </div>

      {/* القسم الأيسر: المعلومات الأساسية */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* المعلومات الأساسية */}
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
            <Package className="size-4 text-muted-foreground/50" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-[90px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            ))}
          </div>
          <div className="border-t border-border/10 pt-3 mt-3 space-y-2">
            <Skeleton className="h-3 w-[100px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* المخزون والفروع */}
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
            <Store className="size-4 text-muted-foreground/50" />
            <Skeleton className="h-4 w-[130px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* الميتا داتا و SEO */}
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
            <Sliders className="size-4 text-muted-foreground/50" />
            <Skeleton className="h-4 w-[90px]" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-[100px]" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-[120px]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
