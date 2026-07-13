import { useStoreProfileStore } from '../store/storeProfileStore';
import { StoreSocialCard } from '../components/StoreSocialCard';
import { StoreLicensesCard } from '../components/StoreLicensesCard';
import { LocalErrorBoundary } from '@/components/LocalErrorBoundary';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function SocialSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* social card skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
              <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* licenses card skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
              <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-36 font-mono" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StoreSocialPage() {
  const storeProfile = useStoreProfileStore(state => state.profile);
  const loading = useStoreProfileStore(state => state.loading);
  const isRefreshing = useStoreProfileStore(state => state.isRefreshing);
  const refetch = useStoreProfileStore(state => state.fetchProfile);

  const showSkeleton = (loading && !storeProfile) || isRefreshing;

  return (
    <div className="px-6 py-2 space-y-6 w-full" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-foreground">التواصل والتراخيص</p>
          <p className="text-sm text-muted-foreground">حسابات التواصل الاجتماعي والتراخيص التجارية</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={() => refetch(true)}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {showSkeleton ? (
        <SocialSkeleton />
      ) : storeProfile ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LocalErrorBoundary>
            <StoreSocialCard social={storeProfile.social} />
          </LocalErrorBoundary>
          <LocalErrorBoundary>
            <StoreLicensesCard licenses={storeProfile.licenses} />
          </LocalErrorBoundary>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">لا توجد بيانات</p>
      )}
    </div>
  );
}
