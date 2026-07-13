import type { ZidOrder } from "../types/order";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, MapPin, Package, CreditCard, ExternalLink, Truck, MonitorSmartphone, AlertTriangle, Clock, History, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZidOrderDetailProps {
  order: ZidOrder;
}

export function ZidOrderDetail({ order }: ZidOrderDetailProps) {
  // Safe Fallback Checker helper
  const renderVal = (val: any) => {
    if (val === undefined || val === null || String(val).trim() === "" || String(val).trim() === "string") {
      return <span className="text-muted-foreground/60 font-normal">—</span>;
    }
    return val;
  };

  const statusColor = order.display_status?.color || '#9e9e9e';
  const statusText = order.display_status?.name || order.order_status?.name || '—';

  // Address helper
  const address = order.shipping?.address;
  const addressFormatted = address?.formatted_address || address?.street || '—';
  const city = address?.city?.name || '—';
  const country = address?.country?.name || '—';

  // Shipping Method
  const method = order.shipping?.method;
  const courier = method?.courier;

  // Invoice Items
  const invoiceItems = order.payment?.invoice || [];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* الشريط العلوي للطلب */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-border/40 bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            className="p-2.5 rounded-xl border"
            style={{ 
              backgroundColor: `${statusColor}10`,
              borderColor: `${statusColor}25`
            }}
          >
            <Package className="size-6" style={{ color: statusColor }} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-lg text-foreground">طلب #{order.code || order.invoice_number || order.id}</span>
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-bold border"
                style={{ 
                  backgroundColor: `${statusColor}12`,
                  color: statusColor,
                  borderColor: `${statusColor}30`
                }}
              >
                {statusText}
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5" dir="ltr">
              تاريخ الإنشاء: {order.issue_date || order.created_at || '—'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.invoice_link && (
            <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/80 text-xs font-semibold" asChild>
              <a href={order.invoice_link} target="_blank" rel="noreferrer">
                <FileText className="size-3.5 ml-1.5" /> تحميل الفاتورة (PDF)
              </a>
            </Button>
          )}
          {order.order_url && (
            <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/80 text-xs font-semibold" asChild>
              <a href={order.order_url} target="_blank" rel="noreferrer">
                رابط الطلب بالمتجر <ExternalLink className="size-3.5 ml-1.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* الحالة الخاصة بالدفع ومرشح الاحتيال */}
      {(order.payment_status === 'pending' || order.is_potential_fraud) && (
        <div className="flex flex-col gap-3">
          {order.payment_status === 'pending' && (
            <div className="flex items-center gap-2.5 text-sm text-amber-600 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
              <AlertTriangle className="size-4 shrink-0" />
              <span>حالة الدفع معلقة (Pending)، بانتظار تأكيد الدفع من قبل العميل.</span>
            </div>
          )}
          {order.is_potential_fraud && (
            <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
              <AlertTriangle className="size-4 shrink-0" />
              <span>تحذير: النظام يشتبه بوجود عملية احتيال محتملة في هذا الطلب (Potential Fraud).</span>
            </div>
          )}
        </div>
      )}

      {/* المحتوى الرئيسي مقسم لكريد */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* الجزء الأيمن (الرئيسي): المنتجات والحسابات */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* كارت المنتجات */}
          <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" /> منتجات الطلب
              </CardTitle>
              <CardDescription className="text-[11px]">المنتجات التي تم طلبها وكمياتها المسجلة</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-center w-[100px]">الكمية</TableHead>
                    <TableHead className="text-left w-[140px]">السعر التفصيلي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!order.products || order.products.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                        لا توجد منتجات مسجلة في هذا الطلب
                      </TableCell>
                    </TableRow>
                  ) : (
                    order.products.map((item) => {
                      const finalPrice = item.discounted_total_string || item.total_string || `${item.total} ${order.currency_code}`;
                      const productThumb = item.images?.[0]?.thumbs?.thumbnail || item.images?.[0]?.origin;
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/10 border-b">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              {productThumb ? (
                                <img src={productThumb} alt={item.name} className="size-11 rounded-lg border object-cover bg-background shrink-0" />
                              ) : (
                                <div className="size-11 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                                  <Package className="size-5 text-muted-foreground/40" />
                                </div>
                              )}
                              <div className="flex flex-col gap-0.5 max-w-[320px] overflow-hidden">
                                <span className="text-sm font-semibold leading-relaxed truncate" title={item.name}>{item.name}</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.sku && (
                                    <span className="text-[10px] text-muted-foreground font-mono leading-none" dir="ltr">
                                      SKU: {item.sku}
                                    </span>
                                  )}
                                  {item.barcode && (
                                    <span className="text-[10px] text-muted-foreground font-mono leading-none" dir="ltr">
                                      Barcode: {item.barcode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm py-3">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-left py-3">
                            <div className="flex flex-col text-left font-bold text-sm" dir="ltr">
                              <span>{finalPrice}</span>
                              {item.is_discounted && item.price_before_string && (
                                <span className="text-[10px] text-muted-foreground line-through font-normal">{item.price_before_string}</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* كارت التفاصيل المالية والفاتورة */}
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" /> ملخص الحسابات والمدفوعات
              </CardTitle>
              <CardDescription className="text-[11px]">مقارنة حساب الفاتورة ومتابعة المبالغ المدفوعة والمتبقية</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* تفاصيل خطوط الفاتورة المرجعة من زد */}
              {invoiceItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {invoiceItems.map((line, idx) => (
                    <div key={`invoice-line-${idx}`} className="flex flex-col p-3 rounded-lg border border-border/50 bg-muted/10">
                      <span className="text-xs text-muted-foreground mb-1">{line.title}</span>
                      <span className="font-bold">{line.value_string}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* تفاصيل الباقات والمبالغ المدفوعة */}
              {order.payment_summary && (
                <div className="p-4 rounded-xl border border-border/50 bg-muted/5 space-y-3">
                  <h4 className="font-bold text-xs text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-primary" /> حالة تسوية الحساب (Payment Summary)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">إجمالي المبلغ المطلوب:</span>
                      <span className="font-bold">{renderVal(order.payment_summary.total_string)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs text-green-600">المبلغ المدفوع:</span>
                      <span className="font-bold text-green-600">{renderVal(order.payment_summary.paid_amount_string)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs text-red-600">المبلغ المتبقي:</span>
                      <span className="font-bold text-red-600">{renderVal(order.payment_summary.remaining_amount_string)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* طريقة الدفع */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">طريقة الدفع الأساسية:</span>
                  <Badge variant="outline" className="bg-background border-border">{renderVal(order.payment?.method?.name)}</Badge>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground mb-0.5">المجموع الإجمالي</span>
                  <span className="font-extrabold text-xl text-primary" dir="ltr">
                    {order.order_total_string || `${order.transaction_amount} ${order.currency_code}`}
                  </span>
                </div>
              </div>

              {/* تفاصيل الحوالة البنكية إن وجدت */}
              {order.payment?.method?.transaction_bank && (
                <div className="p-4 rounded-xl border border-border/50 bg-muted/5 space-y-3">
                  <h4 className="font-bold text-xs flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="size-3.5" /> تفاصيل البنك والتحويل
                  </h4>
                  <div className="flex flex-wrap gap-6 items-start justify-between">
                    <div className="space-y-1.5 text-sm flex-1 min-w-[200px]">
                      <div><span className="text-muted-foreground">البنك المرسل إليه:</span> <span className="font-semibold">{renderVal(order.payment.method.transaction_bank)}</span></div>
                      <div><span className="text-muted-foreground">اسم المحوّل:</span> <span className="font-semibold">{renderVal(order.payment.method.transaction_sender_name)}</span></div>
                      <div><span className="text-muted-foreground">حالة المعاملة البنكية:</span> <span className="font-semibold">{renderVal(order.payment.method.transaction_status_name)}</span></div>
                    </div>
                    {order.payment.method.transaction_slip && (
                      <div className="flex flex-col gap-1 shadow-sm border rounded-lg overflow-hidden bg-background">
                        <span className="text-[10px] text-muted-foreground p-1 text-center border-b">إيصال التحويل</span>
                        <a href={order.payment.method.transaction_slip} target="_blank" rel="noreferrer" className="block hover:opacity-85 transition-opacity">
                          <img src={order.payment.method.transaction_slip} alt="إيصال التحويل" className="h-24 w-auto object-cover max-w-[150px]" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* الجزء الأيسر (الجانبي): العميل، الشحن، والخط الزمني */}
        <div className="space-y-6">
          
          {/* كارت معلومات العميل والشركة */}
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="size-4 text-muted-foreground" /> معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">اسم العميل</span>
                  <span className="font-semibold text-foreground mt-0.5">{renderVal(order.customer?.name)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">رقم الجوال</span>
                  <span className="font-mono font-semibold text-foreground mt-0.5" dir="ltr">{renderVal(order.customer?.mobile)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">البريد الإلكتروني</span>
                  <span className="font-semibold text-foreground truncate mt-0.5">{renderVal(order.customer?.email)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">نوع العميل</span>
                  <Badge variant="secondary" className="w-fit mt-0.5 text-xs font-semibold">
                    {order.customer?.type === 'individual' ? 'فردي' : order.customer?.type === 'company' ? 'مؤسسة/شركة' : '—'}
                  </Badge>
                </div>
              </div>

              {/* بيانات الشركة إن وجدت */}
              {order.customer?.type === 'company' && (
                <div className="pt-3 border-t border-border/50 space-y-2.5 text-xs bg-muted/10 p-3 rounded-lg">
                  <h4 className="font-bold text-primary">بيانات الكيان التجاري:</h4>
                  <div><span className="text-muted-foreground">الاسم التجاري:</span> <span className="font-medium text-foreground">{renderVal(order.customer.business_name)}</span></div>
                  <div><span className="text-muted-foreground">الرقم الضريبي:</span> <span className="font-mono font-medium text-foreground">{renderVal(order.customer.tax_number)}</span></div>
                  <div><span className="text-muted-foreground">السجل التجاري:</span> <span className="font-mono font-medium text-foreground">{renderVal(order.customer.commercial_registration)}</span></div>
                </div>
              )}

              {/* ملاحظات العميل */}
              {order.customer_note && (
                <div className="pt-3 border-t border-border/50 text-xs">
                  <span className="text-muted-foreground block mb-1">ملاحظة العميل:</span>
                  <p className="bg-amber-500/5 text-amber-700 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed font-medium">
                    {order.customer_note}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* كارت الشحن والتوصيل */}
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="size-4 text-muted-foreground" /> الشحن والتوصيل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">طريقة الشحن</span>
                  <div className="flex items-center gap-2 mt-1">
                    {courier?.logo && (
                      <img src={courier.logo} alt={courier.name?.ar} className="h-6 w-auto object-contain rounded border shrink-0 bg-background" />
                    )}
                    <span className="font-semibold">{method?.name || '—'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">رقم بوليصة الشحن (Waybill)</span>
                  <span className="font-mono font-semibold text-foreground mt-0.5" dir="ltr">{renderVal(method?.waybill)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">حالة الشحنة بالتتبع</span>
                  <span className="font-semibold text-foreground mt-0.5">{renderVal(method?.tracking?.status)}</span>
                </div>

                {method?.tracking?.number && (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">رقم التتبع</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-semibold" dir="ltr">{method.tracking.number}</span>
                      {method.tracking.url && (
                        <a href={method.tracking.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center shrink-0">
                          <ExternalLink className="size-3.5 mr-1" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* عنوان الشحن بالتفصيل */}
              <div className="pt-3 border-t border-border/50 space-y-2.5 text-xs">
                <h4 className="font-bold text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3.5" /> عنوان المستلم بالتفصيل:
                </h4>
                <p className="bg-muted/10 p-2.5 rounded-lg border leading-relaxed font-medium">
                  {addressFormatted}
                </p>
                <div className="space-y-1 pl-1">
                  <div><span className="text-muted-foreground">المدينة:</span> <span className="font-medium text-foreground">{city}</span></div>
                  <div><span className="text-muted-foreground">الدولة:</span> <span className="font-medium text-foreground">{country}</span></div>
                  {address?.short_address && <div><span className="text-muted-foreground">العنوان القصير:</span> <span className="font-mono font-medium text-foreground">{address.short_address}</span></div>}
                  {address?.meta?.postcode && <div><span className="text-muted-foreground">الرمز البريدي:</span> <span className="font-mono font-medium text-foreground">{address.meta.postcode}</span></div>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* خط زمن حالات الطلب (Timeline) */}
          {order.histories && order.histories.length > 0 && (
            <Card className="border-border/40 shadow-sm rounded-xl">
              <CardHeader className="border-b border-border/40 py-4 bg-muted/5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="size-4 text-muted-foreground" /> خط زمن حالة الطلب
                </CardTitle>
                <CardDescription className="text-[11px]">متابعة التحديثات وحالات الطلب المتتالية</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative border-r-2 border-border/60 pr-5 space-y-6">
                  {order.histories.map((hist, idx) => (
                    <div key={`history-${idx}`} className="relative">
                      {/* نقطة الدائرة بالخط الزمني */}
                      <span className="absolute -right-[26px] top-1.5 size-3 rounded-full border border-card bg-primary ring-2 ring-primary/10 shrink-0" />
                      
                      <div className="flex flex-col gap-0.5 text-xs">
                        <div className="flex items-center gap-2 justify-start flex-wrap">
                          <span className="font-extrabold text-foreground">{hist.order_status_name || '—'}</span>
                          <span className="text-[9px] text-muted-foreground">بواسطة: {hist.changed_by_type || '—'}</span>
                        </div>
                        <span className="text-muted-foreground leading-relaxed mt-1 font-medium">{hist.comment || hist.changed_by_details?.action || '—'}</span>
                        <span className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                          <Clock className="size-3" /> {hist.humanized_created_at || hist.created_at || '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* معلومات تقنية إضافية */}
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MonitorSmartphone className="size-4 text-muted-foreground" /> معلومات المصدر التقنية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5 text-xs text-muted-foreground">
              <div>المصدر: <span className="font-medium text-foreground">{renderVal(order.source)} ({renderVal(order.source_code)})</span></div>
              <div>سعر الصرف لعملة المتجر: <span className="font-mono font-medium text-foreground">{order.currency?.order_store_currency?.exchange_rate || '1'} {order.currency?.order_store_currency?.code || 'SAR'}</span></div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
