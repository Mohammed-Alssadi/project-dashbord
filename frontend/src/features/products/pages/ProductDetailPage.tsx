import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { SallaProductDetail } from '../components/SallaProductDetail';
import { ZidProductDetail } from '../components/ZidProductDetail';
import { SallaProductDetailSkeleton } from '../components/SallaProductDetailSkeleton';
import { ZidProductDetailSkeleton } from '../components/ZidProductDetailSkeleton';
import type { SallaProductDetails, ZidProductDetails } from '../types/product';
import { Button } from '@/components/ui/button';
import { ChevronRight, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProduct, loadingDetail, errorDetail, fetchProductById, clearSelectedProduct } = useProductStore();
  
  const { user } = useAuthStore();
  const platform = (user?.platform as 'salla' | 'zid') || 'zid';

  useEffect(() => {
    if (id) {
      fetchProductById(platform, id);
    }
    return () => {
      clearSelectedProduct(); // تنظيف الذاكرة عند الخروج
    };
  }, [id, platform, fetchProductById, clearSelectedProduct]);

  const handleRefresh = () => {
    if (id) fetchProductById(platform, id);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      
      {/* الترويسة العليا: زر العودة + عنوان الصفحة */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="size-8 rounded-lg shrink-0"
          >
            <ChevronRight className="size-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              تفاصيل المنتج
            </h2>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loadingDetail}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50 h-8"
        >
          {loadingDetail ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          تحديث البيانات
        </Button>
      </div>

      {errorDetail && !loadingDetail && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm mt-4">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold">حدث خطأ أثناء جلب التفاصيل</span>
            <span className="opacity-90 text-xs">{errorDetail}</span>
          </div>
        </div>
      )}

      {loadingDetail && !selectedProduct && (
        <div className="mt-2">
          {platform === 'zid' ? <ZidProductDetailSkeleton /> : <SallaProductDetailSkeleton />}
        </div>
      )}

      {/* المحتوى الفعلي حسب المنصة */}
      {!loadingDetail && !errorDetail && selectedProduct && (
        <div className="mt-2">
          {platform === 'zid' ? (
            <ZidProductDetail details={selectedProduct as ZidProductDetails} />
          ) : (
            <SallaProductDetail details={selectedProduct as SallaProductDetails} />
          )}
        </div>
      )}

    </div>
  );
}
