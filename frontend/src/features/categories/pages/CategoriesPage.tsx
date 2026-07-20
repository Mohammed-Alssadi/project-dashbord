import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useCategoryStore } from "../store/categoryStore"
import { useAuthStore } from "@/features/auth/store/authStore"
import { SallaCategoryRow } from "../components/SallaCategoryRow"
import { ZidCategoryRow } from "../components/ZidCategoryRow"
import { CategoriesSkeleton } from "../components/CategoriesSkeleton"
import { CategoriesPagination } from "../components/CategoriesPagination"
import { Button } from "@/components/ui/button"
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
  AlertCircle,
  Folder
} from "lucide-react"
import { CategoryFiltersBar } from "../components/CategoryFiltersBar"
import type { SallaCategoryItem, ZidCategoryItem } from "../types/category"

export function CategoriesPage() {
  const { categories, pagination, loading, error, fetchCategories } = useCategoryStore()
  const { user } = useAuthStore()
  
  const platform = (user?.platform as 'salla' | 'zid') || 'zid'
  const isZid = platform === 'zid'
  const isSalla = platform === 'salla'

  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = parseInt(searchParams.get("page") || "1", 10)

  const urlFilters = {
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    is_published: searchParams.get("is_published") || "",
  };

  useEffect(() => {
    // الطريقة القديمة
    // fetchCategories(platform, pageParam);
    
    // الطريقة الجديدة
    fetchCategories(platform, pageParam, urlFilters);
  }, [fetchCategories, platform, pageParam, urlFilters.search, urlFilters.status, urlFilters.is_published]);

  const handleRefresh = () => {
    fetchCategories(platform, pageParam, urlFilters);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newParams.delete("page");
    } else {
      newParams.set("page", page.toString());
    }
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      {/* 1. الترويسة والتحكم */}
      <div className="flex items-center justify-between gap-4 pb-1 w-full">
        <div className="flex flex-col text-right">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            أقسام المتجر 📁
          </h2>
          <p className="text-muted-foreground text-[11px] mt-0.5">
            عرض وتصفح الأقسام والتصنيفات الحية مباشرة من متجرك مع إمكانية عرض تفاصيل الـ JSON الخام.
          </p>
        </div>
        
        <Button 
          onClick={handleRefresh} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          تحديث البيانات
        </Button>
      </div>

      {/* حالة الخطأ */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* حاوية إطار الجدول */}
      <div className="border border-border/40 rounded-lg bg-card shadow-sm overflow-hidden w-full">
        {/* شريط البحث والفلترة */}
        <CategoryFiltersBar platform={platform} />

        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3 w-[60px]">الصورة</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">القسم</TableHead>
              {isZid && (
                <>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الرابط (Slug)</TableHead>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">عدد المنتجات</TableHead>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">فروع</TableHead>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">النشر</TableHead>
                </>
              )}
              {isSalla && (
                <>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الترتيب</TableHead>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">طريقة الفرز</TableHead>
                  <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الحالة</TableHead>
                </>
              )}
              <TableHead className="text-left text-xs font-bold text-muted-foreground py-3 w-[120px]">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <CategoriesSkeleton platform={platform} />
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isZid ? 7 : 6} className="text-center py-8 text-sm text-muted-foreground h-48">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Folder className="size-8 text-muted-foreground/30" />
                    لا توجد تصنيفات أو أقسام حالياً في هذا المتجر.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                isSalla ? (
                  <SallaCategoryRow key={category.id} category={category as SallaCategoryItem} />
                ) : (
                  <ZidCategoryRow key={category.id} category={category as ZidCategoryItem} />
                )
              ))
            )}
          </TableBody>
        </Table>

        <CategoriesPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </div>
  )
}
