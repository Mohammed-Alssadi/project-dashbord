import { useStoreProfileStore } from '../store/storeProfileStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { StoreInfoCard } from '../components/StoreInfoCard';
import { LocalErrorBoundary } from '@/components/LocalErrorBoundary';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function StoreInfoSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoreInfoPage() {
  const user = useAuthStore(state => state.user);
  const platform = user?.platform || 'salla';
  const storeProfile = useStoreProfileStore(state => state.profile);
  const loading = useStoreProfileStore(state => state.loading);
  const isRefreshing = useStoreProfileStore(state => state.isRefreshing);
  const refetch = useStoreProfileStore(state => state.fetchProfile);

  const showSkeleton = (loading && !storeProfile) || isRefreshing;

  return (
    <div className="px-6 py-2 space-y-6 w-full" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-foreground">معلومات المتجر</p>
          <p className="text-sm text-muted-foreground">
            البيانات الأساسية لمتجرك على منصة{' '}
            <span className={`font-semibold ${platform === 'zid' ? 'text-purple-600' : 'text-emerald-600'}`}>
              {platform === 'zid' ? 'زد' : 'سلة'}
            </span>
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={() => refetch(true)}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {showSkeleton ? (
        <StoreInfoSkeleton />
      ) : storeProfile ? (
        <LocalErrorBoundary>
          <StoreInfoCard profile={storeProfile} />
        </LocalErrorBoundary>
      ) : (
        <p className="text-muted-foreground text-sm">لا توجد بيانات</p>
      )}
    </div>
  );
}
