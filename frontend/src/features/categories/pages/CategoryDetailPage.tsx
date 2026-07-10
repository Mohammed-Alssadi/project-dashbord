import { useParams, useNavigate } from 'react-router-dom';
import { useCategoryDetail } from '../hooks/useCategoryDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronRight,
  FolderOpen,
  Info,
  ExternalLink,
  Eye,
  Settings,
  Layers,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthState } from '@/features/auth/hooks/useAuthState';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { category, loading, error } = useCategoryDetail(id || '');
  const [showRaw, setShowRaw] = useState(false);

  const details = category?.categoryDetails || {};
  const { user } = useAuthState();
  const platform = user?.platform || 'unknown';
  const isSalla = platform === 'salla';
  const isZid = platform === 'zid';

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right pb-2" dir="rtl">
      
      {/* 1. الترويسة العليا */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 w-full border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/categories')}
            className="h-9 w-9 rounded-xl hover:bg-muted"
          >
            <ChevronRight className="size-5" />
          </Button>
          <div className="flex flex-col text-right">
            {loading ? (
              <>
                <Skeleton className="h-7 w-[200px] mb-1.5" />
                <Skeleton className="h-4 w-[100px]" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-foreground">{category?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono" dir="ltr">
                  ID: {category?.id}
                </p>
              </>
            )}
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-2">
          {!loading && category?.url && (
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 h-9" asChild>
              <a href={category.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
                عرض القسم في المتجر
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
          <Info className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. المحتوى الرئيسي مجزأ إلى كروت احترافية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيمن: الصورة والـ SEO */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* كارت صورة القسم */}
          <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <FolderOpen className="size-4 text-primary" />
              أيقونة وصورة القسم
            </h3>
            
            {loading ? (
              <Skeleton className="w-full aspect-square rounded-xl" />
            ) : (
              <div className="aspect-square rounded-xl border border-border/50 overflow-hidden bg-muted/20 flex items-center justify-center">
                {category?.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} className="size-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                    <FolderOpen className="size-16" />
                    <span className="text-xs text-muted-foreground/60">بدون صورة للقسم</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* كارت محركات البحث (SEO & Metadata) - متوفر في كلا المنصتين */}
          <div className="border border-border/40 rounded-2xl bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Eye className="size-4 text-primary" />
              مظهر محركات البحث (SEO)
            </h3>
            
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {(details.metadata?.title !== undefined || details.SEO_category_title !== undefined) && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">عنوان SEO</span>
                    <span className="font-semibold text-foreground">{details.metadata?.title ?? details.SEO_category_title ?? 'بدون عنوان'}</span>
                  </div>
                )}
                {(details.metadata?.description !== undefined || details.SEO_category_description !== undefined) && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">وصف SEO</span>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/30">
                      {details.metadata?.description ?? details.SEO_category_description ?? 'بدون وصف'}
                    </p>
                  </div>
                )}
                {details.metadata?.url !== undefined && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">رابط SEO مخصص</span>
                    <span className="text-xs font-mono text-primary break-all block">{details.metadata?.url === null ? 'null' : details.metadata?.url}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* العمود الأيسر: المعلومات الأساسية والإعدادات */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* كارت المعلومات الأساسية */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Layers className="size-4 text-primary" />
              معلومات القسم الهيكلية
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">اسم القسم</span>
                  <span className="font-bold text-foreground text-base">{category?.name}</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">القسم الأب (الرئيسي)</span>
                  <span className="font-semibold text-foreground text-mono">
                    {details.parent_id === 0 || !details.parent_id ? 'قسم رئيسي مستقل (لا يوجد)' : `ID القسم الأب: ${details.parent_id}`}
                  </span>
                </div>
                {isSalla && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">نوع ترتيب المنتجات في القسم</span>
                    <span className="font-mono text-xs font-semibold text-foreground">{details.product_sort_type}</span>
                  </div>
                )}
                {isZid && category?.productsCount !== undefined && category?.productsCount !== null && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">عدد المنتجات بالقسم</span>
                    <span className="font-mono text-base font-bold text-foreground">{category.productsCount}</span>
                  </div>
                )}
                {(details.update_at !== undefined || details.updated_at !== undefined) && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5 flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      تاريخ التحديث الأخير
                    </span>
                    <span className="font-semibold font-mono text-xs text-foreground mt-0.5 block">{details.update_at || details.updated_at}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* كارت خيارات الظهور والتحكم */}
          <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/10 pb-2">
              <Settings className="size-4 text-primary" />
              إعدادات الظهور والخصوصية
            </h3>
            
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                
                {/* الحالة */}
                {details.status !== undefined && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">حالة القسم الحالية</span>
                    <Badge variant="outline" className={`text-xs font-mono px-2.5 py-0.5 rounded-lg ${details.status === 'active' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-destructive/30 text-destructive bg-destructive/5'}`}>
                      {details.status}
                    </Badge>
                  </div>
                )}

                {/* الترتيب */}
                {details.sort_order !== undefined && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">ترتيب ظهور القسم</span>
                    <span className="font-bold text-foreground text-sm font-mono">{details.sort_order}</span>
                  </div>
                )}

                {/* خيارات السلة المخصصة للظهور */}
                {isSalla && details.show_in && (
                  <>
                    <div className="p-3 bg-muted/10 border border-border/20 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">الظهور في التطبيق للجوال</span>
                      <Badge variant={details.show_in.app ? 'default' : 'secondary'} className="text-[10px] font-mono px-2 py-0">
                        {details.show_in.app ? 'TRUE' : 'FALSE'}
                      </Badge>
                    </div>
                    <div className="p-3 bg-muted/10 border border-border/20 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">الظهور في نقاط سلة</span>
                      <Badge variant={details.show_in.salla_points ? 'default' : 'secondary'} className="text-[10px] font-mono px-2 py-0">
                        {details.show_in.salla_points ? 'TRUE' : 'FALSE'}
                      </Badge>
                    </div>
                  </>
                )}

                {/* إخفاء المنتجات المخفية */}
                {isSalla && (
                  <div className="p-3 bg-muted/10 border border-border/20 rounded-xl flex items-center justify-between col-span-1 md:col-span-2">
                    <span className="text-xs text-muted-foreground">يحتوي القسم على منتجات مخفية</span>
                    <Badge variant={details.has_hidden_products ? 'default' : 'secondary'} className="text-[10px] font-mono px-2 py-0">
                      {details.has_hidden_products ? 'TRUE' : 'FALSE'}
                    </Badge>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. عرض البيانات الخام أسفل الصفحة */}
      {showRaw && !loading && (
        <div className="border border-border/40 rounded-2xl bg-card p-6 shadow-sm space-y-3 mt-4 overflow-x-auto text-left" dir="ltr">
          <div className="flex items-center justify-between border-b border-border/10 pb-2">
            <span className="text-xs font-bold text-muted-foreground">Category Response Object JSON</span>
            <Button variant="ghost" size="sm" onClick={() => setShowRaw(false)} className="h-7 text-xs">Close</Button>
          </div>
          <pre className="text-xs font-mono bg-muted/30 p-4 rounded-xl max-h-[450px] overflow-y-auto leading-relaxed">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
export default CategoryDetailPage;
