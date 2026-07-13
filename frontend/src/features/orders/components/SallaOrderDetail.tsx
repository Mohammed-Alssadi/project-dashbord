import type { SallaOrder } from "../types/order";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Package, CreditCard, ExternalLink, Truck, MonitorSmartphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface SallaOrderDetailProps {
  order: SallaOrder;
}

export function SallaOrderDetail({ order }: SallaOrderDetailProps) {
  const customerName = order.customer
    ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
    : '—';
  
  const customerPhone = order.customer?.mobile
    ? `${order.customer.mobile_code || ''}${order.customer.mobile}`.trim()
    : '—';

  // Format Date safely
  let formattedDate = '—';
  try {
    if (order.date?.date) {
      formattedDate = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(order.date.date));
    }
  } catch (e) {
    console.error("Date formatting error", e);
  }

  // Calculate discounts
  const discountTotal = order.amounts?.discounts?.reduce((acc, d) => {
    const val = parseFloat(String(d.discount)) || 0;
    return acc + val;
  }, 0) || 0;

  const showPriceColumn = order.items && order.items.length > 0 && !order.items.every(i => (i.total?.amount || i.amounts?.total?.amount || 0) === 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" dir="rtl">
      
      {/* القسم الرئيسي (اليمين) */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        
        {/* معلومات أساسية وحالات خاصة */}
        {(order.is_pending_payment || order.features?.has_suspicious_alert) && (
          <div className="flex flex-col gap-3">
            {order.is_pending_payment && (
              <div className="flex items-center gap-2.5 text-sm text-amber-600 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                <AlertTriangle className="size-4 shrink-0" />
                <span>بانتظار إكمال عملية الدفع من قبل العميل.</span>
              </div>
            )}
            {order.features?.has_suspicious_alert && (
              <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
                <AlertTriangle className="size-4 shrink-0" />
                <span>تحذير: النظام التقط نشاطاً مشبوهاً في هذا الطلب.</span>
              </div>
            )}
          </div>
        )}

        {/* كارت المنتجات */}
        <Card className="border-border/40 shadow-sm rounded-xl">
          <CardHeader className="border-b border-border/40 py-4 flex flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" /> منتجات الطلب
              </CardTitle>
              <CardDescription className="text-[11px]">قائمة المنتجات المطلوبة وكمياتها</CardDescription>
            </div>
            <div className="flex gap-2">
              <OrderStatusBadge statusSlug={order.status?.slug || 'unknown'} statusText={order.status?.customized?.name || order.status?.name || '—'} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-center w-[100px]">الكمية</TableHead>
                  {showPriceColumn && <TableHead className="text-left w-[120px]">السعر</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!order.items || order.items.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={showPriceColumn ? 3 : 2} className="text-center py-8 text-muted-foreground text-sm">
                      لا توجد منتجات مسجلة في هذا الطلب
                    </TableCell>
                  </TableRow>
                ) : (
                  order.items.map((item) => {
                    const total = item.amounts?.total?.amount || item.total?.amount || 0;
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/10 border-b">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.name} className="size-11 rounded-lg border object-cover bg-background shrink-0" />
                            ) : (
                              <div className="size-11 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                                <Package className="size-5 text-muted-foreground/40" />
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5 max-w-[320px] overflow-hidden">
                              <span className="text-sm font-semibold leading-relaxed truncate" title={item.name}>{item.name}</span>
                              {item.sku && (
                                <span className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5" dir="ltr">
                                  SKU: {item.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-sm py-3">
                          {item.quantity}
                        </TableCell>
                        {showPriceColumn && (
                          <TableCell className="text-left font-bold text-sm py-3" dir="ltr">
                            {total.toLocaleString('ar-SA')} <span className="text-xs text-muted-foreground font-normal">{order.total?.currency || 'SAR'}</span>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* كارت الحسابات والمالية */}
        <Card className="border-border/40 shadow-sm rounded-xl">
          <CardHeader className="border-b border-border/40 py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" /> الحسابات والتفاصيل المالية
            </CardTitle>
            <CardDescription className="text-[11px]">مقارنة وحساب إجماليات الطلب والضرائب</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col p-3 rounded-lg border border-border/50 bg-muted/10">
                <span className="text-xs text-muted-foreground mb-1">المجموع الفرعي</span>
                <span className="font-bold">{order.amounts?.sub_total?.amount?.toLocaleString('ar-SA') || '0'} {order.total?.currency || 'SAR'}</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg border border-border/50 bg-muted/10">
                <span className="text-xs text-muted-foreground mb-1">تكلفة الشحن</span>
                <span className="font-bold">{order.amounts?.shipping_cost?.amount?.toLocaleString('ar-SA') || '0'} {order.total?.currency || 'SAR'}</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg border border-border/50 bg-muted/10">
                <span className="text-xs text-muted-foreground mb-1">الخصومات المطبقة</span>
                <span className="font-bold text-green-600">-{discountTotal.toLocaleString('ar-SA')} {order.total?.currency || 'SAR'}</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg border border-border/50 bg-muted/10">
                <span className="text-xs text-muted-foreground mb-1">الضريبة ({order.amounts?.tax?.percent || 0}%)</span>
                <span className="font-bold">{order.amounts?.tax?.amount?.amount?.toLocaleString('ar-SA') || '0'} {order.total?.currency || 'SAR'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">طريقة الدفع:</span>
                <Badge variant="outline" className="bg-background border-border">{order.payment_method || '—'}</Badge>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground mb-0.5">المجموع الكلي</span>
                <span className="font-extrabold text-xl text-primary" dir="ltr">
                  {order.amounts?.total?.amount?.toLocaleString('ar-SA') || order.total?.amount?.toLocaleString('ar-SA') || '0'} <span className="text-xs font-semibold">{order.total?.currency || 'SAR'}</span>
                </span>
              </div>
            </div>

            {/* تفاصيل الحوالة البنكية إن وجدت */}
            {(order.bank?.bank_name || order.receipt_image) && (
              <div className="p-4 rounded-xl border border-border/50 bg-muted/5 space-y-3">
                <h4 className="font-bold text-xs flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="size-3.5" /> تفاصيل الحوالة المرفقة
                </h4>
                <div className="flex flex-wrap gap-6 items-start justify-between">
                  {order.bank?.bank_name && (
                    <div className="space-y-1.5 text-sm flex-1 min-w-[200px]">
                      <div><span className="text-muted-foreground">البنك:</span> <span className="font-semibold">{order.bank.bank_name || '—'}</span></div>
                      <div><span className="text-muted-foreground">صاحب الحساب:</span> <span className="font-semibold">{order.bank.account_name || '—'}</span></div>
                      <div><span className="text-muted-foreground">رقم الحساب:</span> <span className="font-mono font-semibold" dir="ltr">{order.bank.account_number || '—'}</span></div>
                    </div>
                  )}
                  {order.receipt_image && (
                    <div className="flex flex-col gap-1 shadow-sm border rounded-lg overflow-hidden bg-background">
                      <a href={order.receipt_image} target="_blank" rel="noreferrer" className="block hover:opacity-85 transition-opacity">
                        <img src={order.receipt_image} alt="إيصال التحويل" className="h-28 w-auto object-cover max-w-[150px]" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* القسم الجانبي (اليسار) */}
      <div className="space-y-6">
        
        {/* كارت العميل */}
        <Card className="border-border/40 shadow-sm rounded-xl">
          <CardHeader className="border-b border-border/40 py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="size-4 text-muted-foreground" /> معلومات العميل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">اسم العميل</span>
                <span className="font-semibold text-foreground mt-0.5">{customerName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">رقم الجوال</span>
                <span className="font-mono font-semibold text-foreground mt-0.5" dir="ltr">{customerPhone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">البريد الإلكتروني</span>
                <span className="font-semibold text-foreground truncate mt-0.5">{order.customer?.email || '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">المدينة / الدولة</span>
                <span className="font-semibold text-foreground mt-0.5">
                  {order.customer?.city || '—'}، {order.customer?.country || '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* كارت الشحن */}
        <Card className="border-border/40 shadow-sm rounded-xl">
          <CardHeader className="border-b border-border/40 py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Truck className="size-4 text-muted-foreground" /> الشحن والتوصيل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">شركة الشحن</span>
                <span className="font-semibold text-foreground mt-0.5">{order.shipment?.courier_name || '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">رقم تتبع الشحنة</span>
                <span className="font-mono font-semibold text-foreground mt-0.5" dir="ltr">{order.shipment?.tracking_number || '—'}</span>
              </div>
              {order.total_weight && (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">وزن الشحنة</span>
                  <span className="font-semibold text-foreground mt-0.5">{order.total_weight} كجم</span>
                </div>
              )}
            </div>

            {order.receiver && (
              <div className="pt-3 border-t border-border/50 space-y-3">
                <h4 className="font-bold text-xs text-primary">بيانات المستلم:</h4>
                <div className="space-y-2 text-xs">
                  <div><span className="text-muted-foreground">الاسم:</span> <span className="font-medium text-foreground">{order.receiver.name || '—'}</span></div>
                  <div><span className="text-muted-foreground">الجوال:</span> <span className="font-mono font-medium text-foreground" dir="ltr">{order.receiver.phone || '—'}</span></div>
                  {order.receiver.email && <div><span className="text-muted-foreground">البريد:</span> <span className="font-medium text-foreground">{order.receiver.email}</span></div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* كارت المصدر */}
        <Card className="border-border/40 shadow-sm rounded-xl">
          <CardHeader className="border-b border-border/40 py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MonitorSmartphone className="size-4 text-muted-foreground" /> معلومات تقنية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs text-muted-foreground">
            <div>الجهاز: <span className="font-medium text-foreground">{order.source_details?.device || '—'}</span></div>
            <div>الآيبي: <span className="font-mono font-medium text-foreground">{order.source_details?.ip || '—'}</span></div>
            <div>المتصفح: <span className="font-medium text-foreground">{order.source_details?.['user-agent'] ? order.source_details['user-agent'].split(' ')[0] : '—'}</span></div>
            <div>تاريخ المعالجة: <span className="font-medium text-foreground">{formattedDate}</span></div>

            {order.urls?.admin && (
              <div className="pt-3 border-t border-border/50">
                <Button variant="outline" size="sm" className="w-full h-8 text-[11px] rounded-lg border-border" asChild>
                  <a href={order.urls.admin} target="_blank" rel="noreferrer">
                    فتح الطلب في منصة سلة <ExternalLink className="size-3 ml-1.5 shrink-0" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
