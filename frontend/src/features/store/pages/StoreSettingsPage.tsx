import { useStoreProfileStore } from '../store/storeProfileStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { StoreInfoCard } from '../components/StoreInfoCard';
import { StoreLicensesCard } from '../components/StoreLicensesCard';
import { StoreSocialCard } from '../components/StoreSocialCard';
import { BrandingCard } from '../components/BrandingCard';
import { LocalizationCard } from '../components/LocalizationCard';
import { BusinessCard } from '../components/BusinessCard';
import { StoreProfileSkeleton } from '../components/StoreProfileSkeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalErrorBoundary } from '@/components/LocalErrorBoundary';

export function StoreSettingsPage() {
  const user = useAuthStore(state => state.user);
  const platform = user?.platform || 'salla';

  // استدعاء المباشر والذري من الستور المركزي (البيانات مجلوبة مسبقا من الـ Loader)
  const storeProfile = useStoreProfileStore(state => state.profile);
  const loading = useStoreProfileStore(state => state.loading);
  const isRefreshing = useStoreProfileStore(state => state.isRefreshing);
  const refetchStore = useStoreProfileStore(state => state.fetchProfile);

  // التحميل الأولي — لا بيانات بعد
  if (loading && !storeProfile) {
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

  // تحديث يدوي — بيانات موجودة ونقوم بتحديثها
  if (isRefreshing) {
    return (
      <div className="px-6 py-2 space-y-6 mx-auto w-full">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-foreground">إعدادات المتجر</p>
          <p className="text-muted-foreground">جاري تحديث البيانات من المنصة...</p>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchStore?.(true)} 
              disabled={loading}
              className="gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-destructive"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'جاري التحميل...' : 'إعادة المحاولة'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-2 space-y-6 mx-auto w-full font-sans text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-foreground">إعدادات المتجر</p>
          <p className="text-muted-foreground">
            هذه البيانات تتم مزامنتها تلقائياً مع منصة <span className={`font-semibold ${platform === 'zid' ? 'text-purple-600' : 'text-emerald-600'}`}>{platform === 'zid' ? 'زد' : 'سلة'}</span> ولا تُحفظ في قواعد بياناتنا لضمان دقتها دائماً.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 shrink-0 bg-background" 
          onClick={() => refetchStore?.(true)}
        >
          <RefreshCw className="h-4 w-4" />
          تحديث البيانات
        </Button>
      </div>

      <div className="space-y-6">
        {/* ─── المعلومات الأساسية (الكل) ─── */}
        <LocalErrorBoundary>
          <StoreInfoCard profile={storeProfile} />
        </LocalErrorBoundary>

        {/* ─── الهوية البصرية (زد فقط إذا توفرت) ─── */}
        {storeProfile.branding && (
          <LocalErrorBoundary>
            <BrandingCard branding={storeProfile.branding} />
          </LocalErrorBoundary>
        )}

        {/* ─── اللغة والعملة (زد فقط إذا توفرت) ─── */}
        {storeProfile.localization && (
          <LocalErrorBoundary>
            <LocalizationCard localization={storeProfile.localization} />
          </LocalErrorBoundary>
        )}

        {/* ─── التراخيص والتواصل (شبكة اثنتان) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LocalErrorBoundary>
            <StoreLicensesCard licenses={storeProfile.licenses} />
          </LocalErrorBoundary>
          <LocalErrorBoundary>
            <StoreSocialCard social={storeProfile.social} />
          </LocalErrorBoundary>
        </div>

        {/* ─── بيانات النشاط التجاري (زد فقط إذا توفرت) ─── */}
        {storeProfile.business && (
          <LocalErrorBoundary>
            <BusinessCard business={storeProfile.business} />
          </LocalErrorBoundary>
        )}
      </div>
    </div>
  );
}
