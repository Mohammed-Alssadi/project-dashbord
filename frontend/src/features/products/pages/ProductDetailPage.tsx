import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronRight,
  Package,
  ExternalLink,
  Coins,
  Store,
  Sliders,
  Star,
  LineChart,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthState } from '@/features/auth/hooks/useAuthState';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProductDetail(id || '');
  const [showRaw, setShowRaw] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // تحديث الصورة الفعالة بمجرد تحميل بيانات المنتج
  useEffect(() => {
    if (product?.imageUrl) {
      setActiveImage(product.imageUrl);
    }
  }, [product]);

  // استخراج البيانات التفصيلية الخام من المتجر الموحد
  const details = product?.productDetails || {};
  const { user } = useAuthState();
  const platform = user?.platform || 'unknown';
  const isZid = platform === 'zid';
  const isSalla = platform === 'salla';

  // معالجة المخازن والفروع بناءً على المنصة
  const renderStocks = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    let stocksList: { branchName: string; quantity: string | number }[] = [];

    if (isZid && details.stocks) {
      stocksList = details.stocks.map((s: any) => {
        const nameObj = s.location?.name;
        const branchName = typeof nameObj === 'object' 
          ? (nameObj?.ar || nameObj?.en || 'فرع غير مسمى')
          : (nameObj || 'فرع غير مسمى');
        return {
          branchName,
          quantity: s.is_infinite ? '∞' : (s.available_quantity ?? 0)
        };
      });
    } else if (isSalla && details.branches_quantities) {
      stocksList = details.branches_quantities.map((b: any) => {
        const branchName = b.branch?.name || b.name || 'الفرع الرئيسي';
        return {
          branchName,
          quantity: b.quantity ?? 0
        };
      });
    }

    if (stocksList.length === 0) {
      return (
        <div className="text-center py-6 text-sm text-muted-foreground">
          لا توجد تفاصيل فروع مخزنة للمنتج
        </div>
      );
    }

    return (
      <div className="border border-border/40 rounded-xl overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border/30">
              <th className="py-2.5 px-4 font-bold text-muted-foreground">اسم الفرع / المستودع</th>
              <th className="py-2.5 px-4 font-bold text-muted-foreground text-left">الكمية المتوفرة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {stocksList.map((st, idx) => (
              <tr key={idx} className="hover:bg-muted/10">
                <td className="py-2.5 px-4 font-semibold text-foreground">{st.branchName}</td>
                <td className="py-2.5 px-4 font-bold text-left text-primary">{st.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // معالجة الصور الإضافية (معرض الصور)
  const renderGallery = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
        </div>
      );
    }

    const images = details.images || [];
    if (images.length <= 1) {
      return null;
    }

    return (
      <div className="mt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">معرض الصور ({images.length})</p>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 overflow-x-auto pb-2">
          {images.map((img: any, idx: number) => {
            // معالجة هياكل الصور المختلفة للمنصتين سلة وزد
            let thumbnailUrl = '';
            let largeUrl = '';

            if (typeof img === 'string') {
              thumbnailUrl = img;
              largeUrl = img;
            } else if (isZid) {
              thumbnailUrl = img.image?.small || img.image?.thumbnail || img.url || '';
              largeUrl = img.image?.large || img.image?.medium || img.image?.full_size || img.image?.small || img.url || '';
            } else {
              // لمنصة سلة والمنصات الأخرى
              thumbnailUrl = img.original || img.url || img.src || img.thumbnail || img.image?.small || '';
              largeUrl = img.original || img.url || img.src || img.large || img.image?.large || img.image?.medium || thumbnailUrl;
            }

            if (!thumbnailUrl && !largeUrl) return null;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(largeUrl)}
                className={`aspect-square rounded-lg border overflow-hidden bg-muted/20 transition-all ${
                  activeImage === largeUrl
                    ? 'border-primary ring-2 ring-primary/20 scale-95'
                    : 'border-border/60 hover:border-primary/50'
                }`}
              >
                <img src={thumbnailUrl} alt={`صورة فرعية ${idx + 1}`} className="size-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // معالجة الخيارات / المقاسات والألوان
  const renderOptions = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    const options = details.options || [];
    const customOptions = details.custom_option_fields || [];
    const customInputs = details.custom_user_input_fields || [];
    const skus = details.skus || [];
    
    if (options.length === 0 && customOptions.length === 0 && customInputs.length === 0 && skus.length === 0) {
      return (
        <div className="text-center py-6 text-sm text-muted-foreground">
          لا توجد خيارات أو مقاسات مسجلة لهذا المنتج
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Salla Options or Standard Zid Options */}
        {options.map((opt: any, idx: number) => {
          const optName = isZid ? (opt.name || 'خيارات') : (opt.name || 'خيارات');
          const values = isZid ? (opt.presets || []) : (opt.values || []);

          return (
            <div key={`opt-${idx}`} className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground">{optName}:</span>
              <div className="flex flex-wrap gap-1.5">
                {values.map((val: any, vIdx: number) => {
                  const displayVal = isZid ? val.value : (val.name || val.value);
                  return (
                    <Badge key={vIdx} variant="secondary" className="px-2.5 py-1 text-xs rounded-lg font-medium">
                      {displayVal}
                    </Badge>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Zid Custom Option Fields (e.g., Checkboxes, Dropdowns) */}
        {customOptions.map((opt: any, idx: number) => {
          const optName = typeof opt.label === 'object' ? (opt.label.ar || opt.label.en) : opt.label;
          const choices = opt.choices || [];
          return (
            <div key={`custom-opt-${idx}`} className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground">{optName} ({opt.type}):</span>
              <div className="flex flex-wrap gap-1.5">
                {choices.map((choice: any, cIdx: number) => {
                  const choiceName = choice.name || choice.ar || choice.en;
                  const priceStr = choice.formatted_price ? ` (+${choice.formatted_price})` : '';
                  return (
                    <Badge key={cIdx} variant="outline" className="px-2.5 py-1 text-xs rounded-lg font-medium border-primary/20 bg-primary/5">
                      {choiceName} {priceStr}
                    </Badge>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Zid Custom User Input Fields (e.g., Text, File) */}
        {customInputs.map((input: any, idx: number) => {
          const inputName = typeof input.label === 'object' ? (input.label.ar || input.label.en) : input.label;
          const priceStr = input.formatted_price ? ` (+${input.formatted_price})` : '';
          return (
            <div key={`custom-input-${idx}`} className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/20">
              <span className="text-xs font-bold text-foreground block">{inputName}</span>
              <span className="text-[10px] text-muted-foreground block">
                نوع الإدخال: {input.type} {input.is_required ? '(مطلوب)' : '(اختياري)'} {priceStr}
              </span>
            </div>
          );
        })}

        {/* Salla SKUs (Variants) */}
        {isSalla && skus.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-border/10">
            <span className="text-xs font-bold text-foreground block mb-2">أنواع المنتج الفرعية (SKUs):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skus.map((skuObj: any, idx: number) => {
                const skuPrice = skuObj.price?.amount ? `${skuObj.price.amount} ${skuObj.price.currency}` : '';
                return (
                  <div key={`sku-${idx}`} className="flex flex-col gap-1 p-3 bg-muted/5 border border-border/40 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold font-mono">SKU ID: {skuObj.id}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {skuPrice || 'السعر الافتراضي'}
                      </Badge>
                    </div>
                    {skuObj.barcode && <span className="text-[10px] text-muted-foreground font-mono">باركود: {skuObj.barcode}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right pb-2" dir="rtl">
      {/* الترويسة العليا */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 w-full border-b border-border/20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/products')}
            className="h-9 w-9 rounded-xl hover:bg-muted"
          >
            <ChevronRight className="size-5" />
          </Button>
          <div className="flex flex-col text-right">
            {loading ? (
              <>
                <Skeleton className="h-7 w-[220px] mb-1.5" />
                <Skeleton className="h-4 w-[120px]" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">{product?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono" dir="ltr">
                  ID: {product?.id} | SKU: {product?.sku || 'N/A'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* إجراءات سريعة */}
        <div className="flex items-center gap-2">
          {!loading && product?.productUrl && (
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 h-9" asChild>
              <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
                عرض في المتجر
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRaw(!showRaw)}
            className="rounded-xl text-xs h-9"
          >
            {showRaw ? 'إخفاء البيانات الخام' : 'عرض JSON الخام'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* المحتوى الرئيسي مجزأ إلى كروت أنيقة وسكلتونات متطابقة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيمن: الصورة والترويج */}
        <div className="lg:col-span-1 space-y-6">
          {/* كارت الصورة */}
          <div className="border border-border/40 rounded-2xl bg-card p-4 shadow-sm">
            {loading ? (
              <Skeleton className="w-full aspect-square rounded-xl" />
            ) : (
              <div className="aspect-square rounded-xl border border-border/50 overflow-hidden bg-muted/20 flex items-center justify-center">
                {activeImage ? (
                  <img src={activeImage} alt={product?.name} className="size-full object-cover transition-all duration-300" />
                ) : (
                  <Package className="size-16 text-muted-foreground/40" />
                )}
              </div>
            )}
            {renderGallery()}
          </div>

          {/* كارت إحصائيات سريعة */}
          <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <LineChart className="size-4 text-primary" />
              أداء ومؤشرات المنتج
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {isSalla && (
                <>
                  <div className="p-3 bg-muted/20 rounded-xl">
                    <span className="text-[10px] text-muted-foreground block">المبيعات</span>
                    {loading ? (
                      <Skeleton className="h-5 w-10 mt-1" />
                    ) : (
                      <span className="text-sm font-bold text-foreground">{details.sold_quantity ?? 0}</span>
                    )}
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl">
                    <span className="text-[10px] text-muted-foreground block">المشاهدات</span>
                    {loading ? (
                      <Skeleton className="h-5 w-10 mt-1" />
                    ) : (
                      <span className="text-sm font-bold text-foreground">{details.views ?? 0}</span>
                    )}
                  </div>
                </>
              )}
              <div className="p-3 bg-muted/20 rounded-xl col-span-2 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">التقييم العام</span>
                  {loading ? (
                    <Skeleton className="h-5 w-24 mt-1" />
                  ) : (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="size-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-foreground">
                        {isZid ? (details.rating?.average ?? 0) : (details.rating?.rate ?? 0)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({isZid ? (details.rating?.total_count ?? 0) : (details.rating?.count ?? 0)} تقييم)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* العمود الأيسر: بقية التفاصيل */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* كارت المعلومات الأساسية */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Package className="size-4 text-primary" />
              المعلومات الأساسية
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">الاسم الكامل</span>
                  <span className="font-semibold text-foreground">{product?.name}</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">التصنيف الرئيسي</span>
                  <span className="font-semibold text-foreground">{product?.category || 'عام'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">نوع المنتج</span>
                  <span className="font-mono text-xs font-semibold text-foreground">{product?.type || 'N/A'}</span>
                </div>
                {(details.barcode || details.gtin) && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">الباركود (Barcode/GTIN)</span>
                    <span className="font-mono text-xs font-semibold text-foreground">{details.barcode || details.gtin}</span>
                  </div>
                )}
                {(details.require_shipping !== undefined || details.requires_shipping !== undefined) && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">يتطلب شحن؟</span>
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {(details.require_shipping || details.requires_shipping) ? 'نعم' : 'لا'}
                    </span>
                  </div>
                )}
                {details.description && (
                  <div className="col-span-1 md:col-span-2 border-t border-border/10 pt-3">
                    <span className="text-xs text-muted-foreground block mb-1">وصف المنتج</span>
                    <div 
                      className="text-xs text-muted-foreground leading-relaxed max-h-[150px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: details.description }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* كارت التسعير والضريبة */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Coins className="size-4 text-primary" />
              التسعير والمالية
            </h3>
            
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted/10 border border-border/20 rounded-xl">
                  <span className="text-xs text-muted-foreground block">سعر البيع الافتراضي</span>
                  <span className="text-base font-bold text-foreground mt-1 block">
                    {product?.price} {product?.currency}
                  </span>
                </div>
                <div className="p-3 bg-muted/10 border border-border/20 rounded-xl">
                  <span className="text-xs text-muted-foreground block">سعر العرض المخفض</span>
                  <span className="text-base font-bold text-primary mt-1 block">
                    {product?.salePrice !== null ? `${product?.salePrice} ${product?.currency}` : 'لا يوجد خصم'}
                  </span>
                </div>
                
                {isSalla && details.cost_price !== undefined && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl">
                    <span className="text-xs text-muted-foreground block">سعر التكلفة</span>
                    <span className="text-base font-bold text-muted-foreground mt-1 block">
                      {details.cost_price || '—'} {product?.currency}
                    </span>
                  </div>
                )}
                {isZid && details.cost !== undefined && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl">
                    <span className="text-xs text-muted-foreground block">سعر التكلفة</span>
                    <span className="text-base font-bold text-muted-foreground mt-1 block">
                      {details.cost || '—'} {product?.currency}
                    </span>
                  </div>
                )}

                {/* Salla Specific Pricing & Taxes */}
                {isSalla && details.regular_price && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl">
                    <span className="text-xs text-muted-foreground block">السعر الأساسي</span>
                    <span className="text-base font-bold text-muted-foreground mt-1 block">
                      {details.regular_price.amount} {details.regular_price.currency}
                    </span>
                  </div>
                )}
                {isSalla && details.pre_tax_price && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl">
                    <span className="text-xs text-muted-foreground block">السعر قبل الضريبة</span>
                    <span className="text-base font-bold text-muted-foreground mt-1 block">
                      {details.pre_tax_price.amount} {details.pre_tax_price.currency}
                    </span>
                  </div>
                )}
                {isSalla && details.tax !== undefined && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl col-span-2 md:col-span-1">
                    <span className="text-xs text-muted-foreground block">الضريبة ({details.with_tax ? 'شامل' : 'غير شامل'})</span>
                    <span className="text-xs font-semibold text-foreground mt-1 block">
                      {details.tax.amount} {details.tax.currency} {details.tax_reason ? `(${details.tax_reason})` : ''}
                    </span>
                  </div>
                )}

                {details.weight !== undefined && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl col-span-2 md:col-span-1">
                    <span className="text-xs text-muted-foreground block">الوزن التقديري</span>
                    <span className="text-xs font-semibold text-foreground mt-1 block">
                      {isZid ? `${details.weight?.value ?? 0} ${details.weight?.unit ?? ''}` : `${details.weight ?? 0} ${details.weight_type || 'kg'}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Salla: كارت الإعدادات المتقدمة (Booleans & Dates) */}
          {isSalla && (
            <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
                <Sliders className="size-4 text-primary" />
                خصائص المنتج الإضافية (سلة)
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant={details.is_available ? "default" : "secondary"} className="rounded-md">
                  {details.is_available ? 'متاح للبيع' : 'غير متاح للبيع'}
                </Badge>
                {details.hide_quantity && <Badge variant="secondary" className="rounded-md">إخفاء الكمية</Badge>}
                {details.show_in_app && <Badge variant="secondary" className="rounded-md">يظهر في التطبيق</Badge>}
                {details.is_pinned && <Badge variant="secondary" className="rounded-md">مثبت</Badge>}
                {details.active_advance && <Badge variant="secondary" className="rounded-md">الخيارات المتقدمة مفعلة</Badge>}
                {details.managed_by_branches && <Badge variant="secondary" className="rounded-md">يُدار عبر الفروع</Badge>}
                {details.allow_attachments && <Badge variant="secondary" className="rounded-md">يسمح بالمرفقات</Badge>}
                {details.enable_note && <Badge variant="secondary" className="rounded-md">تفعيل الملاحظات</Badge>}
                {details.has_restriction && <Badge variant="secondary" className="rounded-md">يوجد قيود</Badge>}
                {details.customized_sku_quantity && <Badge variant="secondary" className="rounded-md">كمية الـ SKU مخصصة</Badge>}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground border-t border-border/10 pt-3">
                {details.updated_at && <span>آخر تحديث: {details.updated_at}</span>}
                {details.pinned_date && <span>تاريخ التثبيت: {details.pinned_date}</span>}
              </div>
              
              {(details.promotion || details.calories || details.channels || details.metadata) && (
                <div className="border-t border-border/10 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.promotion?.title && (
                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                      <span className="text-xs text-primary font-bold block mb-1">عرض ترويجي (Promotion)</span>
                      <span className="text-sm font-bold text-foreground block">{details.promotion.title}</span>
                      {details.promotion.sub_title && <span className="text-xs text-muted-foreground block">{details.promotion.sub_title}</span>}
                    </div>
                  )}
                  {details.calories && (
                    <div className="p-3 bg-muted/10 border border-border/20 rounded-xl">
                      <span className="text-xs text-muted-foreground block mb-1">السعرات الحرارية</span>
                      <span className="text-sm font-bold text-foreground block">{details.calories} كالوري</span>
                    </div>
                  )}
                  {details.channels && details.channels.length > 0 && (
                    <div className="p-3 bg-muted/10 border border-border/20 rounded-xl md:col-span-2">
                      <span className="text-xs text-muted-foreground block mb-2">قنوات البيع المدعومة</span>
                      <div className="flex gap-2">
                        {details.channels.map((ch: string, i: number) => (
                          <Badge key={i} variant="outline" className="capitalize">{ch}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {details.metadata?.title && (
                    <div className="p-3 bg-muted/10 border border-border/20 rounded-xl md:col-span-2 space-y-1">
                      <span className="text-xs font-bold text-foreground block">بيانات SEO (Metadata)</span>
                      <span className="text-xs text-foreground block">العنوان: {details.metadata.title}</span>
                      {details.metadata.description && <span className="text-[10px] text-muted-foreground block">الوصف: {details.metadata.description}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* كارت المخزون والفروع */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Store className="size-4 text-primary" />
              تفاصيل المخزون والمستودعات
            </h3>
            
            {loading ? (
              <Skeleton className="h-6 w-1/3 mb-2" />
            ) : (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">الإجمالي الإداري:</span>
                <Badge variant="secondary" className="text-xs font-bold font-mono">
                  {details.unlimited_quantity || details.is_infinite ? '∞ كمية غير محدودة' : (product?.quantity ?? 0)}
                </Badge>
              </div>
            )}
            
            {renderStocks()}
          </div>

          {/* كارت الخصائص والخيارات */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Sliders className="size-4 text-primary" />
              الخصائص والمتغيرات (Options)
            </h3>
            {renderOptions()}
          </div>

        </div>
      </div>

      {/* عرض البيانات الخام في الأسفل إن فُعّلت */}
      {showRaw && (
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-3 mt-4 overflow-x-auto text-left" dir="ltr">
          <div className="flex items-center justify-between border-b border-border/10 pb-2">
            <span className="text-xs font-bold text-muted-foreground">Images Data Debug (Salla/Zid)</span>
            <Button variant="ghost" size="sm" onClick={() => setShowRaw(false)} className="h-7 text-xs">Close</Button>
          </div>
          <pre className="text-xs font-mono bg-muted/30 p-4 rounded-xl max-h-[400px] overflow-y-auto leading-relaxed">
            {JSON.stringify({
              images: details.images,
              urls: details.urls,
              media: details.media,
              thumbnail: details.thumbnail,
              main_image: details.main_image
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
