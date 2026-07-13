import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { SallaOrderDetail } from "@/features/orders/components/SallaOrderDetail";
import { ZidOrderDetail } from "@/features/orders/components/ZidOrderDetail";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LocalErrorBoundary } from "@/components/LocalErrorBoundary";
import type { SallaOrder, ZidOrder } from "../types/order";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore(state => state.user);
  const platform = (user?.platform as 'salla' | 'zid') || 'salla';

  const {
    currentOrderDetails,
    loadingDetails,
    error,
    fetchOrderDetails,
    clearCurrentOrder
  } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrderDetails(platform, id);
    }
    return () => {
      clearCurrentOrder();
    };
  }, [id, platform, fetchOrderDetails, clearCurrentOrder]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      {/* الترويسة والتحكم */}
      <div className="flex items-center justify-between gap-4 pb-1 w-full shrink-0">
        <div className="flex items-center gap-3 text-right">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-9 w-9 border-border/80 hover:bg-muted/50 shadow-sm shrink-0"
            asChild
          >
            <Link to="/orders">
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col text-right">
            <p className="text-2xl font-bold text-foreground">
              {loadingDetails && !currentOrderDetails ? "تحميل تفاصيل الطلب..." : `تفاصيل الطلب #${id}`}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              لوحة إدارة الطلب وتتبع العمليات والشحن
            </p>
          </div>
        </div>

        {/* زر التحديث */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => id && fetchOrderDetails(platform, id)}
            disabled={loadingDetails}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50 h-9"
          >
            {loadingDetails ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            تحديث التفاصيل
          </Button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* حالة التحميل (Skeleton Loader) */}
      {loadingDetails && !currentOrderDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Products Skeleton */}
            <div className="bg-card border border-border/40 p-6 rounded-xl space-y-4">
              <Skeleton className="h-6 w-32 bg-muted/80 animate-pulse" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full bg-muted/40 animate-pulse rounded-lg" />
                <Skeleton className="h-16 w-full bg-muted/40 animate-pulse rounded-lg" />
              </div>
            </div>

            {/* Financial Details Skeleton */}
            <div className="bg-card border border-border/40 p-6 rounded-xl space-y-4">
              <Skeleton className="h-6 w-36 bg-muted/80 animate-pulse" />
              <Skeleton className="h-24 w-full bg-muted/40 animate-pulse rounded-lg" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Skeleton */}
            <div className="bg-card border border-border/40 p-6 rounded-xl space-y-4">
              <Skeleton className="h-6 w-28 bg-muted/80 animate-pulse" />
              <Skeleton className="h-20 w-full bg-muted/40 animate-pulse rounded-lg" />
            </div>

            {/* Shipping Skeleton */}
            <div className="bg-card border border-border/40 p-6 rounded-xl space-y-4">
              <Skeleton className="h-6 w-28 bg-muted/80 animate-pulse" />
              <Skeleton className="h-20 w-full bg-muted/40 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* عرض البيانات الحقيقية */}
      {!loadingDetails && currentOrderDetails && (
        <LocalErrorBoundary>
          {platform === 'zid' ? (
            <ZidOrderDetail order={currentOrderDetails as ZidOrder} />
          ) : (
            <SallaOrderDetail order={currentOrderDetails as SallaOrder} />
          )}
        </LocalErrorBoundary>
      )}
    </div>
  );
}
