import { useCategories } from "../hooks/useCategories"
import { CategoryRow } from "../components/CategoryRow"
import { CategoriesSkeleton } from "../components/CategoriesSkeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table"
import { 
  Loader2, 
  RefreshCw, 
  Search, 
  Folder, 
  Filter,
  AlertTriangle
} from "lucide-react"
import { getSallaOAuthUrl } from "@/features/auth/services/sallaAuthApi"

/**
 * صفحة إدارة أقسام وتصنيفات المتجر (Categories Management)
 */
export function CategoriesPage() {
  const {
    categories,
    loading,
    refresh,
    paginationInfo,
    page,
    searchTerm,
    status,
    error,
    setPage,
    setSearchTerm,
    setStatus
  } = useCategories()

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      
      {/* 1. الترويسة والتحكم */}
      <div className="flex items-center justify-between gap-4 pb-1 w-full">
        <div className="flex flex-col text-right">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            أقسام المتجر 📁
          </h2>
          <p className="text-muted-foreground text-[11px] mt-0.5">
            عرض وإدارة تصنيفات المنتجات والأقسام الفرعية المتصلة بمتجرك لحظياً.
          </p>
        </div>
        
        <Button 
          onClick={() => refresh(true)} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          تحديث ومزامنة الأقسام
        </Button>
      </div>

      {/* تنبيه انتهاء الصلاحيات أو فقدان النطاقات (Scopes) */}
      {error && (
        <div className="p-4 border border-amber-500/20 bg-amber-500/5 text-amber-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 text-amber-600 shrink-0 animate-bounce" />
            <span>
              {error.includes("Unauthorized_Scope")
                ? "يفتقد مفتاح الربط الحالي لصلاحية الوصول إلى الأقسام (categories.read). يرجى إعادة ربط المتجر لمنح التطبيق هذه الصلاحية."
                : error}
            </span>
          </div>
          {error.includes("Unauthorized_Scope") && (
            <Button
              onClick={async () => {
                try {
                  const { oauthUrl } = await getSallaOAuthUrl();
                  window.location.href = oauthUrl;
                } catch (err) {
                  console.error("Failed to redirect for re-auth:", err);
                }
              }}
              variant="outline"
              size="sm"
              className="h-8 border-amber-500/30 hover:bg-amber-500/10 text-amber-800 font-bold shrink-0 rounded-lg text-[10px]"
            >
              إعادة ربط متجر سلة الآن ⚡
            </Button>
          )}
        </div>
      )}

      {/* 2. حاوية إطار الجدول (تحتوي على الفلاتر والجدول بداخلها) */}
      <div className="border border-border/40 rounded-lg bg-card shadow-sm overflow-hidden w-full">
        
        {/* رأس إطار الجدول المدمج: يحتوي على الفلاتر */}
        <div className="p-4 border-b border-border/30 bg-muted/10 space-y-4 text-right">
          
          <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs">
            <Filter className="size-4 text-primary" />
            <span>تصفية الأقسام</span>
          </div>

          {/* الفلاتر الفورية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
            {/* البحث بالاسم */}
            <div className="relative flex items-center col-span-1 sm:col-span-2">
              <Search className="size-4 text-muted-foreground absolute right-3 shrink-0 pointer-events-none" />
              <Input
                placeholder="ابحث باسم القسم أو التصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 h-9 text-xs rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary bg-background shadow-none"
              />
            </div>

            {/* فلترة بالحالة */}
            <div className="flex flex-col">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full h-9 text-xs border-border/70 bg-background text-foreground rounded-lg shadow-none flex justify-between items-center text-right font-sans">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="text-right" align="end">
                  <SelectItem value="الكل">الحالة: الكل</SelectItem>
                  <SelectItem value="active">الحالة: نشط (active)</SelectItem>
                  <SelectItem value="hidden">الحالة: مخفي (hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* جدول الأقسام */}
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="w-[45px]"></TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3 w-[80px]">الصورة</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">القسم</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الترتيب</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الحالة</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">آخر تحديث</TableHead>
              <TableHead className="text-left text-xs font-bold text-muted-foreground py-3 pl-8">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <CategoriesSkeleton />
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Folder className="size-10 mb-2.5 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">لم يتم العثور على أي أقسام</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))
            )}
          </TableBody>
        </Table>

        {/* ذيل إطار الجدول للتنقل والترقيم (Pagination Footer) */}
        {paginationInfo && paginationInfo.totalPages > 1 && (
          <div className="p-4 border-t border-border/30 bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-right font-sans text-xs">
            <div className="text-muted-foreground">
              عرض <span className="font-bold text-foreground">{categories.length}</span> أقسام من أصل <span className="font-bold text-foreground">{paginationInfo.total}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="h-8 rounded-lg text-[11px] font-semibold border-border/85"
              >
                السابق
              </Button>
              
              <span className="text-muted-foreground px-2 font-mono">
                صفحة <span className="font-bold text-foreground">{page}</span> من <span className="font-bold text-foreground">{paginationInfo.totalPages}</span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= paginationInfo.totalPages}
                className="h-8 rounded-lg text-[11px] font-semibold border-border/85"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
