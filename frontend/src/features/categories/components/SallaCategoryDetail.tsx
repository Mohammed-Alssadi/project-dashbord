import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder, Link as LinkIcon, Edit, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SallaCategoryDetails } from "../types/category"

interface SallaCategoryDetailProps {
  category: SallaCategoryDetails;
}

export function SallaCategoryDetail({ category }: SallaCategoryDetailProps) {
  const imageUrl = category.image_url || category.image || '';
  const name = typeof category.name === 'string' 
    ? category.name 
    : (category.name?.ar || category.name?.en || 'بدون اسم');

  const status = category.status || 'active';
  const url = category.urls?.customer || category.html_url || '';

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
                  <Badge variant="outline" className={`text-xs px-2.5 py-0.5 rounded-md font-mono border-muted-foreground/30 ${status === 'hidden' ? 'text-destructive bg-destructive/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                    {status}
                  </Badge>
                </h1>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-mono">ID: {category.id}</span>
                </div>
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border/40">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ترتيب الفرز</p>
                <p className="font-semibold text-foreground text-sm">
                  {category.sort_order ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">الأقسام الفرعية</p>
                <p className="font-semibold text-foreground text-sm">
                  {category.sub_categories?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">الظهور في التطبيق</p>
                <p className="font-semibold text-foreground text-sm">
                  {category.show_in?.app ? 'نعم' : 'لا'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">طريقة الفرز</p>
                <p className="font-semibold text-foreground text-sm font-mono">
                  {category.product_sort_type || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">نقاط سلة</p>
                <p className="font-semibold text-foreground text-sm">
                  {category.salla_points !== undefined ? category.salla_points : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">منتجات مخفية؟</p>
                <p className="font-semibold text-foreground text-sm">
                  {category.has_hidden_products ? 'يوجد' : 'لا يوجد'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Sub Categories if any */}
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
                  <th className="py-3 px-4 font-bold">الرابط</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {category.sub_categories.map((sub: any, idx: number) => {
                  const subName = typeof sub.name === 'string' ? sub.name : (sub.name?.ar || sub.name?.en || '—');
                  const status = sub.status || 'active';
                  const url = sub.urls?.customer || sub.html_url || '';
                  return (
                    <tr key={sub.id || idx} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{sub.id}</td>
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <Folder className="size-4 text-muted-foreground" />
                          {subName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                            <LinkIcon className="size-3" /> عرض
                          </a>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-md font-mono border-muted-foreground/30 ${status === 'hidden' ? 'text-destructive bg-destructive/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                          {status}
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
