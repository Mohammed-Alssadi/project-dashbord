import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { UnifiedOrderDetails, UnifiedOrderItem } from "../adapters/orderAdapter";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { 
  User, Phone, Mail, MapPin, Package, CreditCard, 
  ExternalLink, Truck, MonitorSmartphone, AlertTriangle 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderDetailsModalProps {
  order: UnifiedOrderDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

export function OrderDetailsModal({ order, open, onOpenChange, loading }: OrderDetailsModalProps) {
  if (!order && !loading) return null;

  // Determine if we should show the Price column (hide it for Salla if all items have 0 total)
  const showPriceColumn = order ? !(order.platform === 'salla' && order.items.every((i: UnifiedOrderItem) => i.total === 0)) : true;
  const isSalla = order?.platform === 'salla';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 
        استخدمنا overflow-hidden و flex-col لفصل الهيدر عن المحتوى القابل للتمرير
      */}
      <DialogContent className="w-[97vw] sm:max-w-3xl max-h-[91vh] p-0 gap-0 flex flex-col overflow-hidden" dir="rtl">
        {loading || !order ? (
          // Skeleton Loader
          <>
            <div className="p-6 pb-4 border-b shrink-0 pl-14">
               <div className="flex justify-between items-start">
                 <div className="flex flex-col gap-3 w-1/2">
                   <div className="h-7 w-3/4 bg-muted rounded-md animate-pulse" />
                   <div className="h-4 w-1/2 bg-muted/70 rounded animate-pulse" />
                 </div>
                 <div className="h-8 w-24 bg-muted rounded-full animate-pulse" />
               </div>
            </div>
             
            <div className="p-6 pt-4 overflow-y-auto flex-1 min-h-0 flex flex-col gap-6">
               <div className="space-y-4">
                 <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                 <div className="h-16 w-full bg-muted/40 rounded-xl animate-pulse" />
               </div>

               <div className="space-y-4">
                 <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                 <div className="h-36 w-full bg-muted/40 rounded-xl animate-pulse" />
               </div>

               <div className="space-y-4">
                 <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                 <div className="h-16 w-full bg-muted/40 rounded-xl animate-pulse" />
               </div>

               {/* Financials Skeleton (Horizontal) */}
               <div className="space-y-4">
                 <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                 <div className="h-24 w-full bg-muted/40 rounded-xl animate-pulse" />
               </div>
            </div>
          </>
        ) : (
          <>
        
        {/* Sticky Header */}
        <div className="p-6 pb-4 border-b shrink-0 pl-14">
          <DialogHeader className="text-right">
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl flex items-center gap-2 font-bold justify-start">
                <span>طلب</span>
                <span dir="ltr">#{order.referenceNo}</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground text-right mt-1">
                تاريخ الطلب: <span dir="ltr">{new Date(order.date).toLocaleString('ar-SA')}</span>
              </DialogDescription>
            </div>
            <div className="shrink-0 mt-1">
              <OrderStatusBadge statusSlug={order.statusSlug} statusText={order.statusText} />
            </div>
          </div>

          {/* التنبيهات السريعة */}
          {(order.isPendingPayment || order.hasSuspiciousAlert) && (
            <div className="flex flex-col gap-2 mt-4">
              {order.isPendingPayment && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="size-4 shrink-0" />
                  بانتظار إكمال عملية الدفع من قبل العميل.
                </div>
              )}
              {order.hasSuspiciousAlert && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  <AlertTriangle className="size-4 shrink-0" />
                  تحذير: النظام التقط نشاطاً مشبوهاً في هذا الطلب.
                </div>
              )}
            </div>
          )}
          </DialogHeader>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 pt-4 overflow-y-auto flex-1 min-h-0 flex flex-col gap-6 pb-8">

          {/* 1. بيانات العميل */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="size-4 text-muted-foreground" /> بيانات العميل
            </h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs text-muted-foreground">الاسم</span>
                <span className="font-medium">{order.customer.fullName || '—'}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs text-muted-foreground">رقم الجوال</span>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <span dir="ltr">{order.customer.mobile || '—'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs text-muted-foreground">البريد الإلكتروني</span>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{order.customer.email || '—'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs text-muted-foreground">العنوان</span>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span className="truncate">
                    {order.customer.city === '—' && order.customer.country === '—' 
                      ? '—' 
                      : `${order.customer.city}، ${order.customer.country}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.5 بيانات المستلم (إن وجدت) */}
          {isSalla && order.receiver && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
                <User className="size-4" /> بيانات مستلم الشحنة
              </h3>
              <div className="flex flex-wrap gap-x-8 gap-y-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="text-xs text-primary/70">الاسم</span>
                  <span className="font-medium text-primary-foreground">{order.receiver.name || '—'}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="text-xs text-primary/70">رقم الجوال</span>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground">
                    <Phone className="size-3.5" />
                    <span dir="ltr">{order.receiver.phone || '—'}</span>
                  </div>
                </div>
                {order.receiver.email && (
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <span className="text-xs text-primary/70">البريد الإلكتروني</span>
                    <div className="flex items-center gap-2 text-sm text-primary-foreground">
                      <Mail className="size-3.5" />
                      <span className="truncate">{order.receiver.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. المنتجات */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" /> المنتجات
            </h3>
            <div className="border border-border/50 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right w-full">المنتج</TableHead>
                    <TableHead className="text-center whitespace-nowrap px-6">الكمية</TableHead>
                    {showPriceColumn && (
                      <TableHead className="text-left whitespace-nowrap">السعر</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={showPriceColumn ? 3 : 2} className="text-center py-6 text-muted-foreground text-sm">
                        لا توجد منتجات مسجلة في هذا الطلب
                      </TableCell>
                    </TableRow>
                  )}
                  {order.items.map((item: UnifiedOrderItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-sm flex items-center gap-3 py-3">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="size-10 rounded-md border object-cover bg-background shrink-0" />
                        ) : (
                          <div className="size-10 rounded-md border bg-muted flex items-center justify-center shrink-0">
                            <Package className="size-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="line-clamp-2 leading-relaxed">{item.name}</span>
                          {item.sku && <span className="text-[10px] text-muted-foreground font-mono mt-0.5" dir="ltr">{item.sku}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.quantity}
                      </TableCell>
                      {showPriceColumn && (
                        <TableCell className="text-left text-sm font-semibold whitespace-nowrap">
                          {item.total.toLocaleString('ar-SA')} <span className="text-xs text-muted-foreground font-normal">{order.currency}</span>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 3. الشحن والتوصيل (شريط أفقي مدمج) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Truck className="size-4 text-muted-foreground" /> الشحن والتوصيل
            </h3>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 bg-muted/20 p-4 rounded-xl border border-border/50 text-sm">
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs text-muted-foreground">شركة الشحن</span>
                <span className="font-medium">{order.shipping.courier || '—'}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs text-muted-foreground">رقم التتبع</span>
                <span className="font-mono font-medium" dir="ltr">{order.shipping.trackingNumber || '—'}</span>
              </div>
              {order.shipping.weight && (
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="text-xs text-muted-foreground">الوزن</span>
                  <span className="font-medium">{order.shipping.weight}</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. ملخص الفاتورة (شريط أفقي) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" /> ملخص الفاتورة
            </h3>
            <div className="bg-muted/20 p-4 rounded-xl border border-border/50 flex flex-wrap items-center justify-between gap-6">
              
              <div className="flex flex-wrap gap-6 flex-1">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">طريقة الدفع</span>
                  <span className="font-medium text-sm bg-background px-2 py-0.5 rounded-md border text-center">{order.paymentMethod || '—'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium text-sm">{order.amounts.subTotal.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">تكلفة الشحن</span>
                  <span className="font-medium text-sm">{order.amounts.shippingCost.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">الخصومات</span>
                  <span className="font-medium text-sm text-green-600">-{order.amounts.discountAmount.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">الضريبة ({order.amounts.taxPercent}%)</span>
                  <span className="font-medium text-sm">{order.amounts.taxAmount.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
              </div>

              {/* فاصل عمودي للشاشات الكبيرة */}
              <div className="hidden sm:block w-px h-12 bg-border/60" />

              <div className="flex flex-col gap-1 min-w-[120px] bg-background/50 p-3 rounded-lg border sm:border-none sm:bg-transparent sm:p-0">
                <span className="text-xs text-muted-foreground">الإجمالي</span>
                <span className="font-bold text-xl text-primary">{order.amounts.total.toLocaleString('ar-SA')} <span className="text-xs font-normal text-muted-foreground">{order.currency}</span></span>
              </div>

            </div>
          </div>

          {/* 5. تفاصيل التحويل البنكي (إن وجدت) */}
          {(order.paymentDetails?.bankName || order.paymentDetails?.receiptImage) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" /> تفاصيل التحويل البنكي
              </h3>
              <div className="bg-muted/20 p-4 rounded-xl border border-border/50 flex flex-wrap gap-6 items-start">
                {order.paymentDetails?.bankName && (
                  <div className="flex flex-col gap-3 flex-1 min-w-[200px]">
                    <div className="flex gap-2 items-center text-sm">
                      <span className="text-muted-foreground">البنك:</span>
                      <span className="font-medium">{order.paymentDetails.bankName || '—'}</span>
                    </div>
                    <div className="flex gap-2 items-center text-sm">
                      <span className="text-muted-foreground">صاحب الحساب:</span>
                      <span className="font-medium">{order.paymentDetails.accountName || '—'}</span>
                    </div>
                    <div className="flex gap-2 items-center text-sm">
                      <span className="text-muted-foreground">رقم الحساب:</span>
                      <span className="font-mono font-medium" dir="ltr">{order.paymentDetails.accountNumber || '—'}</span>
                    </div>
                  </div>
                )}
                
                {order.paymentDetails?.receiptImage && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">صورة الإيصال المرفقة:</span>
                    <a href={order.paymentDetails.receiptImage} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                      <img src={order.paymentDetails.receiptImage} alt="إيصال التحويل" className="h-24 w-auto object-cover" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. تفاصيل إضافية (أمان وروابط) */}
          <div className="space-y-3 mt-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MonitorSmartphone className="size-4 text-muted-foreground" /> معلومات المصدر
            </h3>
            <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border border-border/40 text-xs">
              <div className="flex flex-wrap gap-4">
                {order.sourceDetails.device && <span>الجهاز: <span className="font-medium">{order.sourceDetails.device}</span></span>}
                {order.sourceDetails.ip && <span>الآيبي: <span className="font-medium">{order.sourceDetails.ip}</span></span>}
                {order.sourceDetails.browser && <span>المتصفح: <span className="font-medium">{order.sourceDetails.browser}</span></span>}
              </div>
              <div className="flex gap-2 shrink-0">
                {order.urls.admin && (
                  <Button variant="outline" size="sm" className="h-7 text-[10px]" asChild>
                    <a href={order.urls.admin} target="_blank" rel="noreferrer">
                      فتح في المنصة <ExternalLink className="size-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

        </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
