import { useStoreProfileStore } from '../store/storeProfileStore';
import { BusinessCard } from '../components/BusinessCard';
import { LocalErrorBoundary } from '@/components/LocalErrorBoundary';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function BusinessSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-5">
      <div className="space-y-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-52" />
      </div>
      {/* صفوف المعلومات */}
      <div className="bg-muted/20 rounded-xl border border-border/40 px-4 py-1 space-y-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      {/* الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 p-3 bg-muted/20 rounded-xl border border-border/40">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      {/* الوثائق */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function StoreBusinessPage() {
  const storeProfile = useStoreProfileStore(state => state.profile);
  const loading = useStoreProfileStore(state => state.loading);
  const isRefreshing = useStoreProfileStore(state => state.isRefreshing);
  const refetch = useStoreProfileStore(state => state.fetchProfile);

  const showSkeleton = (loading && !storeProfile) || isRefreshing;

  return (
    <div className="px-6 py-2 space-y-6 w-full" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-foreground">النشاط التجاري</p>
          <p className="text-sm text-muted-foreground">بيانات السجل التجاري والنشاط</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={() => refetch(true)}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {showSkeleton ? (
        <BusinessSkeleton />
      ) : storeProfile?.business ? (
        <LocalErrorBoundary>
          <BusinessCard business={storeProfile.business} />
        </LocalErrorBoundary>
      ) : (
        <p className="text-muted-foreground text-sm">لا توجد بيانات نشاط تجاري متاحة</p>
      )}
    </div>
  );
}
