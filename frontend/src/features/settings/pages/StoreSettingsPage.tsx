import { useOutletContext } from 'react-router-dom';
import type { StoreProfile } from '../types/storeProfile.types';
import { StoreInfoCard } from '../components/StoreInfoCard';
import { StoreLicensesCard } from '../components/StoreLicensesCard';
import { StoreSocialCard } from '../components/StoreSocialCard';
import { StoreProfileSkeleton } from '../components/StoreProfileSkeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StoreSettingsPage() {
  // نقوم باستخدام البيانات التي تم جلبها مسبقاً في DashboardLayout عبر الـ Context
  // لتجنب إعادة طلب API مرتين
  const context = useOutletContext<{ 
    storeProfile: StoreProfile | null; 
    loadingStore: boolean;
    refetchStore: (force?: boolean) => Promise<void>; 
  }>();
  
  // توفير قيمة افتراضية للـ context تحسباً لأي خطأ في التمرير
  const storeProfile = context?.storeProfile;
  const loading = context?.loadingStore ?? true;

  if (loading) {
    return (
      <div className="px-6 py-2 space-y-6 mx-auto w-full">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-foreground">إعدادات المتجر</p>
          <p className="text-muted-foreground">إدارة معلومات المتجر وتفاصيل الربط</p>
        </div>
        <StoreProfileSkeleton />
      </div>
    );
  }

  if (!storeProfile) {
    return (
      <div className="px-6 py-2 space-y-6 mx-auto w-full">
         <div className="flex flex-col gap-2 mb-6">
          <p className="text-xl font-bold text-foreground">إعدادات المتجر</p>
          <p className="text-muted-foreground">إدارة معلومات المتجر وتفاصيل الربط</p>
        </div>
        
        <div className="relative w-full rounded-lg border px-4 py-3 text-sm flex flex-col gap-2 border-destructive/50 text-destructive dark:border-destructive bg-destructive/10">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-5 w-5" />
            <h5 className="mb-1 font-medium leading-none tracking-tight">فشل جلب البيانات</h5>
          </div>
          <div className="text-sm opacity-90">
            <p className="mb-4">حدث خطأ أثناء محاولة جلب بيانات المتجر من المنصة. يرجى التأكد من اتصالك بالإنترنت أو إعادة تسجيل الدخول.</p>
            <Button variant="outline" size="sm" onClick={() => context?.refetchStore?.()} className="gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-destructive">
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-2 space-y-6 mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-foreground">إعدادات المتجر</p>
          <p className="text-muted-foreground">
            هذه البيانات تتم مزامنتها تلقائياً مع منصة <span className="font-semibold text-emerald-600">سلة</span> ولا تُحفظ في قواعد بياناتنا لضمان دقتها دائماً.
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0 bg-background" onClick={() => context?.refetchStore?.(true)}>
          <RefreshCw className="h-4 w-4" />
          تحديث البيانات
        </Button>
      </div>

      <div className="space-y-6">
        <StoreInfoCard profile={storeProfile} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StoreLicensesCard licenses={storeProfile.licenses} />
          <StoreSocialCard social={storeProfile.social} />
        </div>
      </div>
    </div>
  );
}
