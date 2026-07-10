import { useCategories } from "../hooks/useCategories"
import { useAuthState } from "@/features/auth/hooks/useAuthState"
import { CategoryRow } from "../components/CategoryRow"
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
  AlertCircle
} from "lucide-react"

export function CategoriesPage() {
  const { categories, pagination, loading, error, goToPage, refresh } = useCategories()
  const { user } = useAuthState()
  
  const isZid = user?.platform === 'zid'
  const isSalla = user?.platform === 'salla'

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
          onClick={refresh} 
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
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3 w-[80px]">الصورة</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">القسم</TableHead>
              {isZid && (
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">عدد المنتجات</TableHead>
              )}
              {isSalla && (
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الترتيب</TableHead>
              )}
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الحالة</TableHead>
              <TableHead className="text-left text-xs font-bold text-muted-foreground py-3 w-[150px]">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading && categories.length === 0 ? (
              <CategoriesSkeleton />
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  لا توجد تصنيفات أو أقسام حالياً في هذا المتجر.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))
            )}
          </TableBody>
        </Table>

        <CategoriesPagination
          pagination={pagination}
          onPageChange={goToPage}
          loading={loading}
        />
      </div>
    </div>
  )
}

