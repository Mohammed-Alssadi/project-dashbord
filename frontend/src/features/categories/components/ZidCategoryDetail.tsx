import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder, Link as LinkIcon, Edit, Settings, FileText, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ZidCategoryDetails } from "../types/category"

interface ZidCategoryDetailProps {
  category: ZidCategoryDetails;
}

export function ZidCategoryDetail({ category }: ZidCategoryDetailProps) {
  const imageUrl = category.image_full_size || category.image || '';
  const name = category.names?.ar || category.names?.en || category.name || 'بدون اسم';
  const enName = category.names?.en || '';
  const isPublished = category.is_published ?? true;
  const url = category.url || '';

  return (
    <div className="space-y-6 animate-fade-in text-right font-sans" dir="rtl">
      
      {/* 1. Header Card */}
      <Card className="p-6 border-border/40 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Image */}
          <div className="shrink-0 relative group">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={name}
                className="w-32 h-32 rounded-2xl border border-border/50 object-cover shadow-sm bg-muted/20"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl border border-border bg-muted/40 flex items-center justify-center text-muted-foreground shadow-sm">
                <Folder className="size-10 opacity-50" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 pt-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                  {name}
                  <Badge variant="outline" className={`text-xs px-2.5 py-0.5 rounded-md font-mono border-muted-foreground/30 ${!isPublished ? 'text-destructive bg-destructive/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                    {isPublished ? 'منشور' : 'غير منشور'}
                  </Badge>
                </h1>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                  <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border">ID: {category.id}</span>
                  <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border" dir="ltr">{category.slug || '—'}</span>
                </div>
                {enName && (
                  <p className="text-sm text-muted-foreground" dir="ltr">{enName}</p>
                )}
              </div>

              <div className="flex gap-2">
                {url && (
                  <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="size-4" />
                      عرض في المتجر
                    </a>
                  </Button>
                )}
                <Button variant="default" size="sm" className="h-9 gap-2">
                  <Edit className="size-4" />
                  تعديل
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/40">
              <div>
                <p className="text-xs text-muted-foreground mb-1">المنتجات المرتبطة</p>
                <p className="font-semibold text-foreground text-lg">
                  {category.products_count ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">الأقسام الفرعية</p>
                <p className="font-semibold text-foreground text-lg">
                  {category.sub_categories?.length || 0}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">المسار الكامل (Flat Name)</p>
                <p className="font-semibold text-foreground text-sm mt-1">
                  {category.flat_name || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. SEO & Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border/40 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">بيانات محركات البحث (SEO)</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">العنوان (SEO Title)</p>
              <div className="p-3 bg-muted/20 rounded-lg border border-border/50 text-sm">
                {category.SEO_category_title || <span className="text-muted-foreground/50">لا يوجد</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الوصف (SEO Description)</p>
              <div className="p-3 bg-muted/20 rounded-lg border border-border/50 text-sm">
                {category.SEO_category_description || <span className="text-muted-foreground/50">لا يوجد</span>}
              </div>
            </div>
          </div>
        </Card>

        {category.metafields && category.metafields.length > 0 && (
          <Card className="p-6 border-border/40 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">الحقول المخصصة (Metafields)</h2>
            </div>
            <div className="space-y-3">
              {category.metafields.map((meta: any, idx: number) => {
                const metaName = meta.name?.ar || meta.name?.en || meta.slug || `حقل ${idx + 1}`;
                return (
                  <div key={meta.id || idx} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/10">
                    <div>
                      <p className="text-sm font-semibold">{metaName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{meta.slug}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase">{meta.data_type}</Badge>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* 3. Sub Categories if any */}
      {category.sub_categories && category.sub_categories.length > 0 && (
        <Card className="p-6 border-border/40 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">الأقسام الفرعية ({category.sub_categories.length})</h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-bold">المعرف (ID)</th>
                  <th className="py-3 px-4 font-bold">الاسم</th>
                  <th className="py-3 px-4 font-bold">الرابط (Slug)</th>
                  <th className="py-3 px-4 font-bold">المسار الكامل (Flat Name)</th>
                  <th className="py-3 px-4 font-bold">عدد المنتجات</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {category.sub_categories.map((sub: any, idx: number) => {
                  const subName = sub.names?.ar || sub.names?.en || sub.name || '—';
                  const isPublished = sub.is_published ?? true;
                  return (
                    <tr key={sub.id || idx} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{sub.id}</td>
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <Folder className="size-4 text-muted-foreground" />
                          {subName}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs" dir="ltr">{sub.slug || '—'}</td>
                      <td className="py-3 px-4">{sub.flat_name || '—'}</td>
                      <td className="py-3 px-4 font-semibold">{sub.products_count ?? 0}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-md font-mono border-muted-foreground/30 ${!isPublished ? 'text-destructive bg-destructive/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                          {isPublished ? 'منشور' : 'غير منشور'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}
