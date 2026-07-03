import { useState } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Folder, 
  Edit, 
  Trash, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Smartphone, 
  Gift, 
  EyeOff 
} from "lucide-react"
import type { Category } from "../services/categoryService"

interface CategoryRowProps {
  category: Category;
}

/**
 * صف تصنيف تفاعلي وقابل للتمدد لعرض كافة البيانات الثرية للأقسام
 */
export function CategoryRow({ category }: CategoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // قراءة متغيرات الميتا وأماكن الظهور الإضافية من كائن القسم (إن وجدت)
  const showInApp = (category as any).showIn?.app ?? true
  const showInPoints = (category as any).showIn?.salla_points ?? false
  const hasHiddenProducts = category.hasHiddenProducts ?? false
  
  // قراءة بيانات SEO
  const seoTitle = (category as any).metadata?.title || 'N/A'
  const seoDescription = (category as any).metadata?.description || 'N/A'
  const seoUrl = (category as any).metadata?.url || 'N/A'

  return (
    <>
      {/* الصف الرئيسي للجدول */}
      <TableRow className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* 1. السهم والتمدد */}
        <TableCell className="w-[45px] text-center">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
            {isExpanded ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </Button>
        </TableCell>

        {/* 2. الصورة */}
        <TableCell className="w-[80px]" onClick={(e) => e.stopPropagation()}>
          {category.imageUrl ? (
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="size-10 rounded-lg border border-border/80 object-cover bg-background shrink-0 shadow-sm"
              onError={(e) => {
                // استبدال الصورة بأيقونة المجلد إذا فشل التحميل
                (e.target as any).style.display = 'none';
                const parent = (e.target as any).parentNode;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.className = "size-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground/60 shrink-0";
                  placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div className="size-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground/60 shrink-0">
              <Folder className="size-4.5" />
            </div>
          )}
        </TableCell>

        {/* 3. اسم القسم والمعرف */}
        <TableCell className="text-right font-medium">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-foreground line-clamp-1 max-w-[280px]">
              {category.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                ID: {category.id}
              </span>
              {category.subCategories.length > 0 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-md font-sans">
                  {category.subCategories.length} أقسام فرعية
                </Badge>
              )}
            </div>
          </div>
        </TableCell>

        {/* 4. الترتيب */}
        <TableCell className="text-right">
          <span className="text-sm text-foreground/80 font-mono font-semibold">
            {category.sortOrder}
          </span>
        </TableCell>

        {/* 5. الحالة */}
        <TableCell className="text-right">
          <Badge 
            variant="outline" 
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md lowercase ${
              category.status === 'active' 
                ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' 
                : 'border-destructive/30 text-destructive bg-destructive/5'
            }`}
          >
            {category.status || 'N/A'}
          </Badge>
        </TableCell>

        {/* 6. آخر تحديث */}
        <TableCell className="text-right text-xs text-muted-foreground/80 font-mono">
          {category.updatedAt || 'N/A'}
        </TableCell>

        {/* 7. العمليات */}
        <TableCell className="text-left w-[130px]" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            {category.customerUrl && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="عرض في المتجر"
                asChild
              >
                <a href={category.customerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors shrink-0"
              title="تعديل القسم"
            >
              <Edit className="size-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-colors shrink-0"
              title="حذف القسم"
            >
              <Trash className="size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* صف التفاصيل الممتد (Expanded Details Panel) */}
      {isExpanded && (
        <TableRow className="bg-muted/5 hover:bg-muted/5">
          <TableCell colSpan={7} className="p-4 border-t border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right text-xs text-foreground font-sans">
              
              {/* العمود الأول: أماكن الظهور وخصائص القسم */}
              <div className="space-y-3 border-l border-border/40 pl-4">
                <h4 className="font-bold text-sm text-primary mb-2">خصائص القسم وأماكن الظهور</h4>
                
                <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <span>الظهور في التطبيق:</span>
                  </div>
                  <Badge variant={showInApp ? "default" : "secondary"} className={showInApp ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                    {showInApp ? "نشط" : "معطل"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                  <div className="flex items-center gap-1.5">
                    <Gift className="size-4 text-muted-foreground" />
                    <span>الظهور في نقاط سلة:</span>
                  </div>
                  <Badge variant={showInPoints ? "default" : "secondary"} className={showInPoints ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                    {showInPoints ? "نشط" : "معطل"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-1.5">
                    <EyeOff className="size-4 text-muted-foreground" />
                    <span>يحتوي على منتجات مخفية:</span>
                  </div>
                  <Badge variant={hasHiddenProducts ? "destructive" : "secondary"}>
                    {hasHiddenProducts ? "نعم" : "لا"}
                  </Badge>
                </div>
              </div>

              {/* العمود الثاني: محركات البحث (SEO Metadata) */}
              <div className="space-y-3 border-l border-border/40 pl-4">
                <h4 className="font-bold text-sm text-primary mb-2">تهيئة محركات البحث (SEO)</h4>
                
                <div className="space-y-1">
                  <span className="text-muted-foreground font-bold text-[10px]">العنوان التعريفي (Meta Title)</span>
                  <p className="font-medium text-foreground bg-muted/40 p-2 rounded-lg border border-border/40 line-clamp-1">{seoTitle}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-bold text-[10px]">الوصف التعريفي (Meta Description)</span>
                  <p className="font-medium text-foreground bg-muted/40 p-2 rounded-lg border border-border/40 line-clamp-2">{seoDescription}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-bold text-[10px]">رابط الميتا (Meta URL)</span>
                  <p className="font-medium text-muted-foreground font-mono text-[10px] bg-muted/40 p-2 rounded-lg border border-border/40 truncate" dir="ltr">{seoUrl}</p>
                </div>
              </div>

              {/* العمود الثالث: الأقسام الفرعية */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-primary mb-2">الأقسام الفرعية التابعة ({category.subCategories.length})</h4>
                {category.subCategories.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">لا توجد أقسام فرعية لهذا القسم الرئيسي.</p>
                ) : (
                  <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                    {category.subCategories.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60 shadow-sm hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-2">
                          {sub.imageUrl ? (
                            <img src={sub.imageUrl} alt={sub.name} className="size-6 rounded-md object-cover border border-border/50" />
                          ) : (
                            <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground/60"><Folder className="size-3" /></div>
                          )}
                          <div className="flex flex-col text-right">
                            <span className="font-bold text-[11px] text-foreground">{sub.name}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">ID: {sub.id}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 rounded ${sub.status === 'active' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-destructive/20 text-destructive bg-destructive/5'}`}>
                          {sub.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
