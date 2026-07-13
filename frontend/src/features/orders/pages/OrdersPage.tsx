import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { SallaOrderRow } from "../components/SallaOrderRow";
import { ZidOrderRow } from "../components/ZidOrderRow";
import { OrdersPagination } from "../components/OrdersPagination";
import { OrdersSkeleton } from "../components/OrdersSkeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, ShoppingBag, AlertCircle } from "lucide-react";
import { LocalErrorBoundary } from "@/components/LocalErrorBoundary";
import type { SallaOrder, ZidOrder } from "../types/order";

export function OrdersPage() {
  const user = useAuthStore(state => state.user);
  const platform = (user?.platform as 'salla' | 'zid') || 'salla';
  
  const { 
    orders, 
    loadingList, 
    error, 
    pagination,
    fetchOrders
  } = useOrderStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  // Initial fetch on mount/dependency change
  useEffect(() => {
    fetchOrders(platform, pageParam);
  }, [fetchOrders, platform, pageParam]);

  const handleRefresh = () => {
    fetchOrders(platform, pageParam);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      
      {/* الترويسة والتحكم */}
      <div className="flex items-center justify-between gap-4 pb-1 w-full">
        <div className="flex flex-col text-right">
          <p className="text-2xl font-bold text-foreground flex items-center gap-2">
            إدارة الطلبات 📦
          </p>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loadingList && orders.length === 0
              ? 'جارٍ تحميل الطلبات...'
              : error
              ? 'تعذّر جلب البيانات'
              : `${pagination.totalCount.toLocaleString('ar')} طلب مسجل`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={loadingList}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50 h-9"
          >
            {loadingList ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && !loadingList && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* الحاوية الرئيسية للجدول */}
      <LocalErrorBoundary>
        <div className="border border-border/40 rounded-xl bg-card shadow-sm overflow-hidden w-full">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">رقم الطلب</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">التاريخ</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">العميل</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الحالة</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الدفع</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الإجمالي</TableHead>
                <TableHead className="text-left text-xs font-bold text-muted-foreground py-3 w-[120px]">العمليات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* حالة التحميل */}
              {loadingList && orders.length === 0 ? (
                <OrdersSkeleton rowsCount={8} />
              ) : orders.length === 0 ? (
                /* حالة لا توجد طلبات */
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <ShoppingBag className="size-10 opacity-25" />
                      <span className="text-sm">لا توجد طلبات مسجلة حالياً</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* الصفوف */
                orders.map((order) => 
                  platform === 'zid' ? (
                    <ZidOrderRow key={order.id} order={order as ZidOrder} />
                  ) : (
                    <SallaOrderRow key={order.id} order={order as SallaOrder} />
                  )
                )
              )}
            </TableBody>
          </Table>

          {/* الباجينيشن */}
          <OrdersPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loadingList}
          />
        </div>
      </LocalErrorBoundary>

    </div>
  );
}
