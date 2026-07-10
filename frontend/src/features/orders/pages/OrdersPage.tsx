import { useEffect, useState } from "react";
import { useOrderStore } from "../store/orderStore";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { OrderRow } from "../components/OrderRow";
import { OrdersPagination } from "../components/OrdersPagination";
import { OrderDetailsModal } from "../components/OrderDetailsModal";
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

export function OrdersPage() {
  const { user } = useAuthState();
  const platform = (user?.platform as 'salla' | 'zid') || 'salla';
  
  const { 
    orders, 
    currentOrderDetails, 
    loadingList, 
    loadingDetails, 
    error, 
    pagination,
    fetchOrders,
    fetchOrderDetails,
    clearCurrentOrder,
    goToPage,
    refresh
  } = useOrderStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchOrders(1, platform);
  }, [fetchOrders, platform]);

  const handleViewDetails = async (orderId: string | number) => {
    setIsDrawerOpen(true);
    await fetchOrderDetails(orderId, platform);
  };

  const handleCloseDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setTimeout(() => clearCurrentOrder(), 300); // Clear after animation
    }
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
            onClick={() => refresh(platform)}
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
      <div className="border border-border/40 rounded-sm bg-card shadow-sm overflow-hidden w-full">
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
            {loadingList && orders.length === 0 && (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="py-4">
                    <div className="h-6 w-full bg-muted/50 rounded-md animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            )}

            {/* حالة لا توجد طلبات */}
            {!loadingList && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ShoppingBag className="size-10 opacity-25" />
                    <span className="text-sm">لا توجد طلبات مسجلة حالياً</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* الصفوف */}
            {orders.map((order) => (
              <OrderRow 
                key={order.id} 
                order={order} 
                onViewDetails={handleViewDetails} 
              />
            ))}
          </TableBody>
        </Table>

        {/* الباجينيشن */}
        <OrdersPagination
          pagination={pagination}
          onPageChange={(p) => goToPage(p, platform)}
          loading={loadingList}
        />
      </div>

      {/* نافذة التفاصيل المركزية (Modal) المتكفلة بعرض الـ Skeleton بنفسها */}
      <OrderDetailsModal 
        open={isDrawerOpen} 
        onOpenChange={handleCloseDrawer} 
        order={currentOrderDetails} 
        loading={loadingDetails && !currentOrderDetails}
      />

    </div>
  );
}
