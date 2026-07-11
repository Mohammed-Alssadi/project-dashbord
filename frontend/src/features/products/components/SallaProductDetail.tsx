import { useState } from 'react';
import type { SallaProductDetails } from '../types/product';
import { Package, Store, Sliders, Star, LineChart, Info, Tags, Activity, Globe, Tag, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SallaProductDetailProps {
  details: SallaProductDetails;
}

export function SallaProductDetail({ details }: SallaProductDetailProps) {
  const [activeImage, setActiveImage] = useState<string>(
    details.main_image || details.thumbnail || details.images?.[0]?.url || ''
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in font-sans text-right" dir="rtl">
      
      {/* العمود الأيمن */}
      <div className="space-y-6">
        {/* العرض الترويجي إذا وجد */}
        {details.promotion?.title && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl shadow-sm text-center">
            <span className="text-xs text-primary font-bold block mb-1">عرض ترويجي (Promotion)</span>
            <span className="text-base font-bold text-foreground block">{details.promotion.title}</span>
            {details.promotion.sub_title && <span className="text-sm text-muted-foreground block">{details.promotion.sub_title}</span>}
          </div>
        )}

        {/* الصورة الرئيسية */}
        {activeImage ? (
          <div className="aspect-square rounded-2xl border border-border/40 overflow-hidden bg-muted/10 relative group shadow-sm">
            <img src={activeImage} alt={details.name} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
        ) : (
          <div className="aspect-square rounded-2xl border border-border/40 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground">
            <Package className="size-16 mb-4 opacity-20" />
            <span>لا توجد صورة</span>
          </div>
        )}

        {/* معرض الصور الإضافية */}
        {details.images && details.images.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">معرض الصور ({details.images.length})</p>
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2 overflow-x-auto pb-2">
              {details.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  className={`aspect-square rounded-lg border overflow-hidden bg-muted/20 transition-all ${
                    activeImage === img.url
                      ? 'border-primary ring-2 ring-primary/20 scale-95'
                      : 'border-border/60 hover:border-primary/50'
                  }`}
                >
                  <img src={img.url} alt="صورة فرعية" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* المعلومات الأساسية */}
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <Package className="size-4 text-primary" />
            المعلومات الأساسية
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الاسم الكامل</span>
              <span className="font-semibold text-foreground">{details.name}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">النوع</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.type}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">SKU الأساسي</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.sku || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الباركود (GTIN / MPN)</span>
              <span className="font-mono text-[11px] font-semibold text-foreground">
                GTIN: {details.gtin || '—'} <br/> MPN: {details.mpn || '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الوزن</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.weight} {details.weight_type}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">السعرات الحرارية</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.calories || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الكمية الإجمالية</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.unlimited_quantity ? 'لا محدود (∞)' : details.quantity}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">مخزون مخصص للـ SKU</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.customized_sku_quantity ? 'نعم' : 'لا'}</span>
            </div>
          </div>
        </div>

        {/* التسعير والضريبة */}
        <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <LineChart className="size-4 text-primary" />
            التسعير
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">السعر الفعلي/الحالي (price)</span>
              <span className="text-sm font-bold text-foreground">{details.price?.amount ?? 0} {details.price?.currency || 'SAR'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">السعر الأساسي (regular_price)</span>
              <span className="text-sm font-bold text-foreground">{details.regular_price?.amount ?? details.price?.amount ?? 0} {details.regular_price?.currency || details.price?.currency || 'SAR'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">سعر التخفيض (sale_price)</span>
              <span className="text-sm font-bold text-emerald-600">{details.sale_price?.amount ?? 0} {details.sale_price?.currency || 'SAR'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">سعر التكلفة (cost_price)</span>
              <span className="text-sm font-bold text-amber-600">{details.cost_price || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">الضريبة (tax)</span>
              <span className="text-sm font-bold text-foreground">{details.tax?.amount ?? 0} {details.tax?.currency || 'SAR'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">السعر قبل الضريبة (pre_tax_price)</span>
              <span className="text-sm font-bold text-foreground">{details.pre_tax_price?.amount ?? 0} {details.pre_tax_price?.currency || 'SAR'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-muted-foreground block mb-0.5">السعر شامل الضريبة (taxed_price)</span>
              <span className="text-sm font-bold text-primary">{details.taxed_price?.amount ?? 0} {details.taxed_price?.currency || 'SAR'}</span>
            </div>
          </div>
        </div>

        {/* التقييم */}
        {details.rating && (
          <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-2">
             <span className="text-xs font-bold text-foreground block">التقييم العام</span>
             <div className="flex items-center gap-1">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{details.rating.rate ?? 0}</span>
                <span className="text-xs text-muted-foreground">({details.rating.count ?? 0} تقييم)</span>
             </div>
          </div>
        )}

      </div>

      {/* العمود الأيسر */}
      <div className="space-y-6">
        
        {/* وصف المنتج */}
        {details.description && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <FileText className="size-4 text-primary" />
              وصف المنتج
            </h3>
            <div 
              className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: details.description }}
            />
          </div>
        )}

        {/* خصائص وحالة المنتج */}
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <Info className="size-4 text-primary" />
            خصائص وحالة المنتج
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant={details.status === 'sale' ? 'default' : 'secondary'}>الحالة: {details.status}</Badge>
            <Badge variant={details.is_available ? 'default' : 'destructive'}>{details.is_available ? 'متاح للبيع' : 'غير متاح'}</Badge>
            <Badge variant="outline">{details.require_shipping ? 'يتطلب شحن' : 'لا يتطلب شحن'}</Badge>
            <Badge variant="outline">{details.with_tax ? 'خاضع للضريبة' : 'غير خاضع للضريبة'}</Badge>
            <Badge variant="outline">{details.show_in_app ? 'يظهر في التطبيق' : 'مخفي في التطبيق'}</Badge>
            <Badge variant="outline">{details.hide_quantity ? 'الكمية مخفية' : 'الكمية ظاهرة'}</Badge>
            <Badge variant="outline">{details.managed_by_branches ? 'يُدار بالفروع' : 'إدارة مركزية'}</Badge>
            <Badge variant="outline">{details.allow_attachments ? 'يسمح بالمرفقات' : 'لا يسمح بالمرفقات'}</Badge>
            <Badge variant="outline">{details.enable_upload_image ? 'يسمح برفع صورة' : 'لا يسمح برفع صورة'}</Badge>
            {details.is_pinned && <Badge variant="secondary">مثبت ({details.pinned_date})</Badge>}
            {details.sale_end && <Badge variant="destructive">انتهاء التخفيض: {details.sale_end}</Badge>}
          </div>
        </div>

        {/* إحصائيات عامة للكميات */}
        <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <Activity className="size-4 text-primary" />
            إحصائيات وقيود
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">المشاهدات</span>
              <span className="text-xs font-bold text-foreground">{details.views ?? '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">المباع</span>
              <span className="text-xs font-bold text-foreground">{details.sold_quantity ?? '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">الحد الأقصى للمستخدم</span>
              <span className="text-xs font-bold text-foreground">{details.max_items_per_user || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">الحد الأقصى للطلب</span>
              <span className="text-xs font-bold text-foreground">{details.maximum_quantity_per_order || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">تنبيه انخفاض الكمية</span>
              <span className="text-xs font-bold text-foreground">{details.notify_quantity || '—'}</span>
            </div>
          </div>
        </div>

        {/* خيارات المنتج (Options) */}
        {details.options && details.options.length > 0 && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Tags className="size-4 text-primary" />
              الخيارات المتاحة (Options)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.options.map((opt: any) => (
                <div key={opt.id} className="p-3 bg-muted/10 border border-border/20 rounded-xl space-y-2">
                  <span className="text-sm font-bold block">{opt.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {opt.values?.map((val: any) => (
                      <Badge key={val.id} variant="secondary" className="font-normal text-xs">
                        {val.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الخيارات المتغيرة SKUs */}
        {details.skus && details.skus.length > 0 && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Sliders className="size-4 text-primary" />
              أصناف المنتج التفصيلية (SKUs)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/30">
                    <th className="py-2.5 px-4 font-bold text-muted-foreground whitespace-nowrap">SKU ID</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground whitespace-nowrap">الباركود</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground whitespace-nowrap">السعر الأساسي</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground whitespace-nowrap">سعر التخفيض</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground whitespace-nowrap">سعر التكلفة</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground whitespace-nowrap">الكمية المتوفرة</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground whitespace-nowrap">الوزن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {details.skus.map((sku: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="py-2.5 px-4 font-mono text-[10px] text-foreground whitespace-nowrap">{sku.sku || sku.id}</td>
                      <td className="py-2.5 px-4 font-mono text-[10px] text-foreground whitespace-nowrap">{sku.barcode || '—'}</td>
                      
                      <td className="py-2.5 px-4 font-semibold text-foreground whitespace-nowrap">
                        {sku.regular_price?.amount ?? sku.price?.amount ?? 0} {sku.price?.currency || 'SAR'}
                      </td>
                      
                      <td className="py-2.5 px-4 font-semibold text-primary whitespace-nowrap">
                        {sku.sale_price?.amount ? `${sku.sale_price.amount} ${sku.sale_price.currency || 'SAR'}` : '—'}
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-amber-600 whitespace-nowrap">
                        {sku.cost_price?.amount ? `${sku.cost_price.amount} ${sku.cost_price.currency || 'SAR'}` : '—'}
                      </td>

                      <td className="py-2.5 px-4 text-foreground whitespace-nowrap">
                        {sku.unlimited_quantity ? '∞' : sku.stock_quantity}
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                        {sku.weight_label || (sku.weight ? `${sku.weight} ${sku.weight_type}` : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* الأسعار المخصصة (Scoped Prices) */}
        {details.scoped_prices && details.scoped_prices.length > 0 && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Tag className="size-4 text-primary" />
              الأسعار المخصصة (Scoped Prices)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/30">
                    <th className="py-2.5 px-4 font-bold text-muted-foreground">Scope ID</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground">السعر</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground">التكلفة</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground">العملة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {details.scoped_prices.map((scope: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="py-2.5 px-4 font-mono text-[10px] text-foreground">{scope.scope_id}</td>
                      <td className="py-2.5 px-4 font-semibold text-foreground">{scope.price ?? '—'}</td>
                      <td className="py-2.5 px-4 font-semibold text-amber-600">{scope.cost_price ?? '—'}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{scope.currency || 'SAR'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* المخزون والفروع */}
        {details.branches_quantities && details.branches_quantities.length > 0 && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Store className="size-4 text-primary" />
              المخزون حسب الفروع
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/30">
                    <th className="py-2.5 px-4 font-bold text-muted-foreground">اسم الفرع / المستودع</th>
                    <th className="py-2.5 px-4 font-bold text-muted-foreground">الكمية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {details.branches_quantities.map((branch: any, idx: number) => {
                    const branchName = branch.branch?.name || branch.name || 'فرع غير مسمى';
                    return (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="py-2.5 px-4 text-foreground font-semibold">{branchName}</td>
                        <td className="py-2.5 px-4 text-primary font-bold">
                          {branch.unlimited_quantity ? '∞' : branch.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* الميتا داتا وقنوات البيع والروابط */}
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <Globe className="size-4 text-primary" />
            ميتا داتا وقنوات البيع
          </h3>
          <div className="grid grid-cols-1 gap-4">
            
            {details.channels && details.channels.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground block mb-2">قنوات البيع المدعومة</span>
                <div className="flex gap-2">
                  {details.channels.map((ch: string, i: number) => (
                    <Badge key={i} variant="outline" className="capitalize">{ch}</Badge>
                  ))}
                </div>
              </div>
            )}

            {details.metadata && (
              <div className="p-4 bg-muted/10 border border-border/20 rounded-xl space-y-2">
                <span className="text-xs font-bold text-foreground block mb-2 border-b border-border/10 pb-1">بيانات SEO (Metadata)</span>
                {details.metadata.title && (
                  <p className="text-xs text-foreground"><span className="font-semibold text-muted-foreground">العنوان:</span> {details.metadata.title}</p>
                )}
                {details.metadata.description && (
                  <p className="text-xs text-foreground"><span className="font-semibold text-muted-foreground">الوصف:</span> {details.metadata.description}</p>
                )}
                {details.metadata.url && (
                  <p className="text-xs text-foreground truncate"><span className="font-semibold text-muted-foreground">الرابط:</span> <a href={details.metadata.url} className="text-primary hover:underline" target="_blank" rel="noreferrer">{details.metadata.url}</a></p>
                )}
              </div>
            )}

            {details.urls && (
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-xs font-bold text-foreground block mb-1">روابط سريعة</span>
                {details.urls.customer && (
                  <a href={details.urls.customer} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                    رابط العميل (Customer URL)
                  </a>
                )}
                {details.urls.admin && (
                  <a href={details.urls.admin} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                    رابط الإدارة (Admin URL)
                  </a>
                )}
              </div>
            )}

            <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/10">
              آخر تحديث للمنتج: {details.updated_at || 'غير متوفر'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
