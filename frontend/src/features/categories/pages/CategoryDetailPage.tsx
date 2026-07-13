import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategoryStore } from '../store/categoryStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { SallaCategoryDetail } from '../components/SallaCategoryDetail';
import { ZidCategoryDetail } from '../components/ZidCategoryDetail';
import type { SallaCategoryDetails, ZidCategoryDetails } from '../types/category';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCategory, loadingDetail, errorDetail, fetchCategoryById, clearSelectedCategory } = useCategoryStore();
  const [showRaw, setShowRaw] = useState(false);

  const { user } = useAuthStore();
  const platform = (user?.platform as 'salla' | 'zid') || 'zid';
  const isSalla = platform === 'salla';

  useEffect(() => {
    if (id) {
      fetchCategoryById(platform, id);
    }
    return () => {
      clearSelectedCategory(); // تنظيف الذاكرة عند الخروج
    };
  }, [id, platform, fetchCategoryById, clearSelectedCategory]);

  const handleRefresh = () => {
    if (id) fetchCategoryById(platform, id);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right pb-2" dir="rtl">
      
      {/* 1. الترويسة العليا */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 w-full border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/categories')}
            className="h-9 w-9 rounded-xl hover:bg-muted"
          >
            <ChevronRight className="size-5" />
          </Button>
          <div className="flex flex-col text-right">
            <p className="text-3xl font-bold text-foreground">
              {loadingDetail ? <Skeleton className="h-8 w-48" /> : 'تفاصيل القسم'}
            </p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRaw(!showRaw)}
            className="rounded-xl text-xs h-9"
            disabled={loadingDetail || !selectedCategory}
          >
            {showRaw ? 'إخفاء البيانات الخام' : 'عرض JSON الخام'}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={loadingDetail}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50 h-9"
          >
            {loadingDetail ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            تحديث البيانات
          </Button>
        </div>
      </div>

      {errorDetail && !loadingDetail && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm mt-4">
          <Info className="size-4 shrink-0" />
          <span>{errorDetail}</span>
        </div>
      )}

      {/* 2. المحتوى الرئيسي */}
      {loadingDetail && !selectedCategory ? (
        <div className="space-y-6 mt-2 animate-pulse">
          {/* Main Info Card Skeleton */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-border/40 bg-card">
            <Skeleton className="size-32 sm:size-40 rounded-xl shrink-0" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-full max-w-[400px]" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
          {/* Details Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-border/40 bg-card space-y-4">
              <Skeleton className="h-5 w-[120px] mb-4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-6 rounded-2xl border border-border/40 bg-card space-y-4">
              <Skeleton className="h-5 w-[140px] mb-4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      ) : selectedCategory ? (
        <div className="mt-2">
          {isSalla ? (
            <SallaCategoryDetail category={selectedCategory as SallaCategoryDetails} />
          ) : (
            <ZidCategoryDetail category={selectedCategory as ZidCategoryDetails} />
          )}
        </div>
      ) : null}

      {/* 3. عرض البيانات الخام أسفل الصفحة */}
      {showRaw && !loadingDetail && selectedCategory && (
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-3 mt-4 overflow-x-auto text-left" dir="ltr">
          <div className="flex items-center justify-between border-b border-border/10 pb-2">
            <span className="text-xs font-bold text-muted-foreground">Category Response Object JSON</span>
            <Button variant="ghost" size="sm" onClick={() => setShowRaw(false)} className="h-7 text-xs">Close</Button>
          </div>
          <pre className="text-xs font-mono bg-muted/30 p-4 rounded-xl max-h-[450px] overflow-y-auto leading-relaxed">
            {JSON.stringify(selectedCategory, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
export default CategoryDetailPage;
