import { useStoreProfileStore } from '../store/storeProfileStore';
import { LocalizationCard } from '../components/LocalizationCard';
import { LocalErrorBoundary } from '@/components/LocalErrorBoundary';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function LocalizationSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-5">
      <div className="space-y-1">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3.5 w-52" />
      </div>
      {/* اللغة */}
      <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="pt-2 border-t border-border/40 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </div>
      {/* العملة */}
      <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-10 rounded" />
            <Skeleton className="h-6 w-12 rounded" />
          </div>
        </div>
      </div>
      {/* قائمة العملات */}
      <div className="grid grid-cols-2 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
            <Skeleton className="h-4 w-6 rounded-sm flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-14" />
            </div>
            <Skeleton className="h-4 w-8 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoreLocalizationPage() {
  const storeProfile = useStoreProfileStore(state => state.profile);
  const loading = useStoreProfileStore(state => state.loading);
  const isRefreshing = useStoreProfileStore(state => state.isRefreshing);
  const refetch = useStoreProfileStore(state => state.fetchProfile);

  const showSkeleton = (loading && !storeProfile) || isRefreshing;

  return (
    <div className="px-6 py-2 space-y-6 w-full" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-foreground">اللغة والعملة</p>
          <p className="text-sm text-muted-foreground">إعدادات اللغة والعملات المتاحة في المتجر</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={() => refetch(true)}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {showSkeleton ? (
        <LocalizationSkeleton />
      ) : storeProfile?.localization ? (
        <LocalErrorBoundary>
          <LocalizationCard localization={storeProfile.localization} />
        </LocalErrorBoundary>
      ) : (
        <p className="text-muted-foreground text-sm">لا توجد بيانات لغة وعملة متاحة</p>
      )}
    </div>
  );
}
