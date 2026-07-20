import { useState } from 'react';
import type { ZidProductDetails } from '../types/product';
import { extractName } from '../utils/functions/extractName';
import { Package, Store, Sliders, Star, LineChart } from 'lucide-react';

interface ZidProductDetailProps {
  details: ZidProductDetails;
}

export function ZidProductDetail({ details }: ZidProductDetailProps) {
  const [activeImage, setActiveImage] = useState<string>(
    details.images?.[0]?.image?.large || details.images?.[0]?.image?.medium || ''
  );

  const name = extractName(details.name);
  const description = extractName(details.short_description);
  const categoriesList = details.categories && details.categories.length > 0 
    ? details.categories.map(c => extractName(c.name)).filter(Boolean).join('، ')
    : 'غير مصنف';
  const seoTitle = details.seo?.title ? extractName(details.seo.title) : null;
  const seoDescription = details.seo?.description ? extractName(details.seo.description) : null;

  let status = '';
  let statusColor = '';
  if (details.is_draft) {
    status = 'مسودة';
    statusColor = 'text-amber-600 bg-amber-500/10';
  } else if (details.is_published === false) {
    status = 'غير منشور';
    statusColor = 'text-destructive bg-destructive/10';
  } else {
    status = 'منشور';
    statusColor = 'text-emerald-600 bg-emerald-500/10';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in font-sans text-right" dir="rtl">
      {/* العمود الأيمن */}
      <div className="space-y-6">
        {activeImage ? (
          <div className="aspect-square rounded-2xl border border-border/40 overflow-hidden bg-muted/10 relative group shadow-sm">
            <img src={activeImage} alt={name} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
              {details.images.map((img: any, idx: number) => {
                const imgUrl = img.image?.large || img.image?.medium || '';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`aspect-square rounded-lg border overflow-hidden bg-muted/20 transition-all ${
                      activeImage === imgUrl
                        ? 'border-primary ring-2 ring-primary/20 scale-95'
                        : 'border-border/60 hover:border-primary/50'
                    }`}
                  >
                    <img src={img.image?.thumbnail || imgUrl} alt="صورة فرعية" className="size-full object-cover" />
                  </button>
                )
              })}
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
              <span className="text-xs text-muted-foreground block mb-0.5">المعرف (ID)</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.id || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">المعرف الأب (Parent ID)</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.parent_id || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الاسم الكامل</span>
              <span className="font-semibold text-foreground">{name}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الرابط (Slug)</span>
              <span className="font-semibold text-foreground" dir="ltr">{details.slug || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">رابط الويب (HTML URL)</span>
              <a href={details.html_url} target="_blank" rel="noreferrer" className="font-mono text-xs font-semibold text-primary hover:underline block truncate" dir="ltr">{details.html_url || '—'}</a>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الفئة</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.product_class || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">التصنيفات</span>
              <span className="font-semibold text-foreground">{categoriesList}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الباركود (Barcode)</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.barcode || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">SKU</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.sku || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الوزن</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.weight?.value ?? 0} {details.weight?.unit}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الكمية الإجمالية</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.is_infinite ? 'لا محدود (∞)' : details.quantity}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الترتيب (Display Order)</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.display_order ?? '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">إعدادات المنتجات ذات الصلة</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.related_products_settings || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">الكمية المباعة (Sold)</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.sold_products_count ?? 0}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">العملاء المنتظرين</span>
              <span className="font-mono text-xs font-semibold text-foreground">{details.waiting_customers_count ?? 0}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">تاريخ الإنشاء</span>
              <span className="font-mono text-[10px] font-semibold text-foreground" dir="ltr">{details.created_at || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">تاريخ التحديث</span>
              <span className="font-mono text-[10px] font-semibold text-foreground" dir="ltr">{details.updated_at || '—'}</span>
            </div>
            {details.badge && (
              <div className="col-span-1 md:col-span-2">
                <span className="text-xs text-muted-foreground block mb-0.5">شارة المنتج (Badge)</span>
                <span className="font-semibold text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">{extractName(details.badge?.body) || '—'} ({details.badge?.icon?.code})</span>
              </div>
            )}
          </div>
          {description && (
            <div className="border-t border-border/10 pt-3 mt-3">
              <span className="text-xs text-muted-foreground block mb-1">الوصف المختصر</span>
              <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: description }}></p>
            </div>
          )}
          {details.description?.ar && (
            <div className="border-t border-border/10 pt-3 mt-3">
              <span className="text-xs text-muted-foreground block mb-1">الوصف الكامل</span>
              <div className="text-sm text-foreground max-h-40 overflow-y-auto bg-muted/10 p-2 rounded-lg border border-border/20 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: details.description.ar }}></div>
            </div>
          )}
        </div>

        {/* التسعير */}
        <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <LineChart className="size-4 text-primary" />
            التسعير
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">السعر الأساسي</span>
              <span className="text-sm font-bold text-foreground">{details.formatted_price || `${details.price} ${details.currency_symbol || 'ر.س'}`}</span>
            </div>
            {details.sale_price !== null && (
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">سعر التخفيض</span>
                <span className="text-sm font-bold text-emerald-600">{details.formatted_sale_price || `${details.sale_price} ${details.currency_symbol || 'ر.س'}`}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">سعر التكلفة</span>
              <span className="text-sm font-bold text-amber-600">{details.cost ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* التقييم */}
        {details.rating && (
          <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-2">
             <span className="text-xs font-bold text-foreground block">التقييم العام</span>
             <div className="flex items-center gap-1">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{details.rating.average}</span>
                <span className="text-xs text-muted-foreground">({details.rating.total_count} تقييم)</span>
             </div>
          </div>
        )}

      </div>

      {/* العمود الأيسر */}
      <div className="space-y-6">
        
        {/* الحالة والخصائص (Flags) */}
        <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <Sliders className="size-4 text-primary" />
            الحالة والخصائص
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-0.5">الحالة</span>
              <span className={`font-bold ${statusColor.split(' ')[0]}`}>{status}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-0.5">خاضع للضريبة</span>
              <span className={`font-bold ${details.is_taxable ? 'text-emerald-600' : 'text-destructive'}`}>{details.is_taxable ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-0.5">يتطلب شحن</span>
              <span className={`font-bold ${details.requires_shipping ? 'text-emerald-600' : 'text-destructive'}`}>{details.requires_shipping ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-0.5">يحتوي خيارات</span>
              <span className={`font-bold ${details.has_options ? 'text-emerald-600' : 'text-muted-foreground'}`}>{details.has_options ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-0.5">يحتوي حقول</span>
              <span className={`font-bold ${details.has_fields ? 'text-emerald-600' : 'text-muted-foreground'}`}>{details.has_fields ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-0.5">كمية لا محدودة</span>
              <span className={`font-bold ${details.is_infinite ? 'text-emerald-600' : 'text-muted-foreground'}`}>{details.is_infinite ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-0.5">الهيكلية</span>
              <span className="font-bold text-primary truncate" title={details.structure}>{details.structure || '—'}</span>
            </div>
          </div>
        </div>

        {/* قيود الشراء */}
        {details.purchase_restrictions && (
          <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Store className="size-4 text-primary" />
              قيود الشراء والفترات
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">أقل كمية للسلة</span>
                <span className="font-semibold">{details.purchase_restrictions.min_quantity_per_cart ?? '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">أقصى كمية للسلة</span>
                <span className="font-semibold">{details.purchase_restrictions.max_quantity_per_cart ?? '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-0.5">فترة التوفر</span>
                <span className="font-semibold block truncate" dir="ltr">{details.purchase_restrictions.availability_period_start || '—'}</span>
                <span className="font-semibold block truncate" dir="ltr">{details.purchase_restrictions.availability_period_end || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-0.5">فترة التخفيض</span>
                <span className="font-semibold block truncate" dir="ltr">{details.purchase_restrictions.sale_price_period_start || '—'}</span>
                <span className="font-semibold block truncate" dir="ltr">{details.purchase_restrictions.sale_price_period_end || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* المخزون (Stocks) */}
        {details.stocks && details.stocks.length > 0 && (
          <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Package className="size-4 text-primary" />
              المخزون (Stocks)
            </h3>
            <div className="space-y-3">
              {details.stocks.map((stock: any, idx: number) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-border/40 text-xs">
                  <div className="flex justify-between items-start mb-2 border-b border-border/10 pb-2">
                    <div>
                      <span className="font-bold text-foreground block">{extractName(stock.location?.name) || 'موقع غير معروف'}</span>
                      <span className="text-[10px] text-muted-foreground">{stock.location?.type || '—'}</span>
                    </div>
                    <div className="text-left flex flex-col items-end">
                      <span className="text-muted-foreground">الكمية المتاحة</span>
                      <span className={`font-bold text-sm ${stock.available_quantity === 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                        {stock.is_infinite ? 'لا محدود (∞)' : (stock.available_quantity ?? '—')}
                      </span>
                    </div>
                  </div>
                  {stock.location?.full_address && (
                    <div className="text-muted-foreground/80 mt-1">
                      <span className="block truncate" dir="ltr" title={stock.location.full_address}>{stock.location.full_address}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الحقول المخصصة والسمات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attributes */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Sliders className="size-4 text-primary" />
              السمات (Attributes) - {details.attributes?.length || 0}
            </h3>
            {details.attributes && details.attributes.length > 0 ? (
              <div className="space-y-3">
                {details.attributes.map((attr: any, idx: number) => (
                  <div key={idx} className="flex flex-col bg-muted/20 p-2 rounded-lg border border-border/40">
                    <span className="text-[10px] text-muted-foreground">ID: {attr.id}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-semibold">{attr.name} ({attr.type})</span>
                      <span className="text-xs font-bold text-primary">{extractName(attr.value) || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">لا توجد سمات مضافة.</span>
            )}
          </div>

          {/* Metafields */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Sliders className="size-4 text-primary" />
              الميتا داتا (Metafields) - {details.metafields?.length || 0}
            </h3>
            {details.metafields && details.metafields.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {details.metafields.map((mf: any, idx: number) => (
                  <div key={idx} className="flex flex-col bg-muted/20 p-2 rounded-lg border border-border/40">
                    <span className="text-[10px] text-muted-foreground">Type: {mf.data_type}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-semibold">{extractName(mf.name) || mf.slug}</span>
                      <span className="text-xs font-bold text-primary">{mf.value ?? '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">لا توجد ميتا داتا.</span>
            )}
          </div>
        </div>

        {/* الخيارات والمنتجات الفرعية (Variants) */}
        {details.has_options && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Package className="size-4 text-primary" />
              المنتجات الفرعية (Variants) - {details.variants?.length || 0}
            </h3>
            {details.options && details.options.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-bold mb-2 block">أنواع الخيارات:</span>
                <div className="flex flex-wrap gap-2">
                  {details.options.map((opt: any, idx: number) => (
                    <div key={idx} className="bg-muted px-2 py-1 rounded border border-border text-xs">
                      <span className="font-semibold">{opt.name}: </span>
                      <span className="text-muted-foreground">{opt.choices?.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {details.variants && details.variants.length > 0 ? (
              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-right text-xs">
                  <thead className="bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="py-2 px-3">الاسم</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">السعر</th>
                      <th className="py-2 px-3">الكمية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {details.variants.map((variant: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="py-2 px-3 font-semibold max-w-[200px] truncate">{extractName(variant.name)}</td>
                        <td className="py-2 px-3 font-mono text-muted-foreground" dir="ltr">{variant.sku || '—'}</td>
                        <td className="py-2 px-3 text-primary">{variant.formatted_price}</td>
                        <td className="py-2 px-3 font-bold">{variant.is_infinite ? '∞' : variant.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">لا توجد منتجات فرعية.</span>
            )}
          </div>
        )}

        {/* الحقول المخصصة للمستخدم والخيارات المخصصة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Sliders className="size-4 text-primary" />
              حقول إدخال المستخدم
            </h3>
            {details.custom_user_input_fields && details.custom_user_input_fields.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {details.custom_user_input_fields.map((field: any, idx: number) => (
                  <div key={idx} className="bg-muted/10 border border-border/50 rounded-lg p-3 space-y-2 text-xs">
                    {Object.entries(field).map(([key, value]) => {
                      if (key === 'id') return null; // إخفاء الآيدي لتبسيط العرض
                      
                      let displayValue: any = value;
                      if (value && typeof value === 'object') {
                         displayValue = extractName(value);
                         if (!displayValue || typeof displayValue === 'object') {
                           displayValue = JSON.stringify(value);
                         }
                      } else if (typeof value === 'boolean') {
                         displayValue = value ? 'نعم' : 'لا';
                      }
                      if (displayValue === null || displayValue === undefined) displayValue = '—';

                      return (
                        <div key={key} className="flex justify-between items-center gap-4 border-b border-border/10 pb-1 last:border-0 last:pb-0">
                          <span className="text-muted-foreground font-mono">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-foreground truncate max-w-[60%] text-left" dir="auto" title={String(displayValue)}>
                            {String(displayValue)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">لا توجد حقول.</span>
            )}
          </div>
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Sliders className="size-4 text-primary" />
              الخيارات المخصصة
            </h3>
            {details.custom_option_fields && details.custom_option_fields.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {details.custom_option_fields.map((field: any, idx: number) => (
                  <div key={idx} className="bg-muted/10 border border-border/50 rounded-lg p-3 space-y-2 text-xs">
                    {Object.entries(field).map(([key, value]) => {
                      if (key === 'id') return null; // إخفاء الآيدي لتبسيط العرض
                      
                      let displayValue: any = value;
                      if (value && typeof value === 'object') {
                         displayValue = extractName(value);
                         if (!displayValue || typeof displayValue === 'object') {
                           displayValue = JSON.stringify(value);
                         }
                      } else if (typeof value === 'boolean') {
                         displayValue = value ? 'نعم' : 'لا';
                      }
                      if (displayValue === null || displayValue === undefined) displayValue = '—';

                      return (
                        <div key={key} className="flex justify-between items-center gap-4 border-b border-border/10 pb-1 last:border-0 last:pb-0">
                          <span className="text-muted-foreground font-mono">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-foreground truncate max-w-[60%] text-left" dir="auto" title={String(displayValue)}>
                            {String(displayValue)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">لا توجد حقول.</span>
            )}
          </div>
        </div>

        {/* المنتجات ذات الصلة */}
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
            <Package className="size-4 text-primary" />
            المنتجات ذات الصلة
          </h3>
          {details.related_products && details.related_products.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {details.related_products.map((rp: any, idx: number) => (
                <span key={idx} className="bg-muted text-xs font-semibold px-2 py-1 rounded border border-border">ID: {rp.id || rp}</span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">لا توجد منتجات ذات صلة محددة يدوياً.</span>
          )}
        </div>

        {/* مقاطع الفيديو */}
        {details.videos && details.videos.length > 0 && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Package className="size-4 text-primary" />
              مقاطع الفيديو (Videos)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {details.videos.map((vid: any, idx: number) => (
                <a key={idx} href={vid.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs truncate" dir="ltr">
                  {vid.url}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* الميتا داتا و SEO */}
        {(seoTitle || seoDescription) && (
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Sliders className="size-4 text-primary" />
              بيانات SEO
            </h3>
            <div className="space-y-3">
              {seoTitle && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">العنوان (Title)</span>
                  <span className="text-sm font-semibold text-foreground">{seoTitle}</span>
                </div>
              )}
              {seoDescription && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">الوصف (Description)</span>
                  <p className="text-sm text-foreground">{seoDescription}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
