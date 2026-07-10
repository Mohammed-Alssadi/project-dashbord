import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { UnifiedOrderDetails } from "../services/orderAdapter";
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

interface OrderDetailsDrawerProps {
  order: UnifiedOrderDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDrawer({ order, open, onOpenChange }: OrderDetailsDrawerProps) {
  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[550px] overflow-y-auto" dir="rtl">
        <SheetHeader className="border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-xl flex items-center gap-2">
                طلب #{order.referenceNo}
                <span className="text-xs bg-muted px-2 py-0.5 rounded-md font-mono uppercase text-muted-foreground">
                  {order.platform}
                </span>
              </SheetTitle>
              <SheetDescription className="mt-1">
                تاريخ الطلب: {new Date(order.date).toLocaleString('ar-SA')}
              </SheetDescription>
            </div>
            <OrderStatusBadge statusSlug={order.statusSlug} statusText={order.statusText} />
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
        </SheetHeader>

        <div className="flex flex-col gap-6 pb-10">

          {/* 1. بيانات العميل */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="size-4 text-muted-foreground" /> بيانات العميل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">الاسم</span>
                <span className="text-sm font-medium">{order.customer.fullName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">رقم الجوال</span>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <span dir="ltr">{order.customer.mobile}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">البريد الإلكتروني</span>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{order.customer.email}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">العنوان</span>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{order.customer.city}، {order.customer.country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. المنتجات (جدول كما طلب المستخدم) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" /> المنتجات
            </h3>
            <div className="border border-border/50 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right text-xs">المنتج</TableHead>
                    <TableHead className="text-center text-xs w-[60px]">الكمية</TableHead>
                    <TableHead className="text-left text-xs w-[100px]">السعر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">
                        لا توجد منتجات مسجلة في هذا الطلب
                      </TableCell>
                    </TableRow>
                  )}
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-sm flex items-center gap-3">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="size-8 rounded-md border object-cover bg-background shrink-0" />
                        ) : (
                          <div className="size-8 rounded-md border bg-muted flex items-center justify-center shrink-0">
                            <Package className="size-4 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="line-clamp-2 leading-relaxed">{item.name}</span>
                          {item.sku && <span className="text-[10px] text-muted-foreground font-mono mt-0.5" dir="ltr">{item.sku}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-left text-sm font-semibold">
                        {item.total.toLocaleString('ar-SA')} <span className="text-[10px] text-muted-foreground font-normal">{order.currency}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 3. الماليات والشحن - تم تغييرها من شبكة إلى قائمة عمودية لتفادي التزاحم */}
          <div className="flex flex-col gap-6">
            
            {/* بطاقة الشحن */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Truck className="size-4 text-muted-foreground" /> الشحن والتوصيل
              </h3>
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">شركة الشحن:</span>
                  <span className="font-medium">{order.shipping.courier || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">رقم التتبع:</span>
                  <span className="font-mono font-medium" dir="ltr">{order.shipping.trackingNumber || '—'}</span>
                </div>
                {order.shipping.weight && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">الوزن:</span>
                    <span className="font-medium">{order.shipping.weight}</span>
                  </div>
                )}
              </div>
            </div>

            {/* بطاقة الماليات */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" /> ملخص الفاتورة
              </h3>
              <div className="bg-muted/30 p-5 rounded-xl border border-border/50 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">طريقة الدفع:</span>
                  <span className="font-medium bg-background px-2 py-1 rounded-md border">{order.paymentMethod}</span>
                </div>
                <div className="h-px bg-border/50 my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي:</span>
                  <span className="font-medium">{order.amounts.subTotal.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">تكلفة الشحن:</span>
                  <span className="font-medium">{order.amounts.shippingCost.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>الخصومات:</span>
                  <span className="font-medium">-{order.amounts.discountAmount.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">الضريبة ({order.amounts.taxPercent}%):</span>
                  <span className="font-medium">{order.amounts.taxAmount.toLocaleString('ar-SA')} {order.currency}</span>
                </div>
                <div className="h-px bg-border/50 my-2" />
                <div className="flex justify-between items-center font-bold text-xl">
                  <span>الإجمالي:</span>
                  <span className="text-primary">{order.amounts.total.toLocaleString('ar-SA')} <span className="text-sm font-normal text-muted-foreground">{order.currency}</span></span>
                </div>
              </div>
            </div>

          </div>

          {/* 4. تفاصيل إضافية (أمان وروابط) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MonitorSmartphone className="size-4 text-muted-foreground" /> معلومات المصدر
            </h3>
            <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border border-border/40 text-xs">
              <div className="flex gap-4">
                {order.sourceDetails.device && <span>الجهاز: {order.sourceDetails.device}</span>}
                {order.sourceDetails.ip && <span>الآيبي: {order.sourceDetails.ip}</span>}
                {order.sourceDetails.browser && <span>المتصفح: {order.sourceDetails.browser}</span>}
              </div>
              <div className="flex gap-2">
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

          {/* 5. العمليات على الطلب */}
          <div className="mt-4 flex gap-3 border-t pt-6">
            {order.canCancel && (
              <Button variant="destructive" className="w-full">إلغاء الطلب</Button>
            )}
            <Button variant="default" className="w-full">تحديث الحالة</Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
