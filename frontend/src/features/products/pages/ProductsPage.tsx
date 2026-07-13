import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useProductStore } from "../store/productStore"
import { useAuthStore } from "@/features/auth/store/authStore"
import { SallaProductRow } from "../components/SallaProductRow"
import { ZidProductRow } from "../components/ZidProductRow"
import { ProductsPagination } from "../components/ProductsPagination"
import { ProductsSkeleton } from "../components/ProductsSkeleton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table"
import { Loader2, RefreshCw, Package, AlertCircle } from "lucide-react"
import type { SallaProductItem, ZidProductItem } from "../types/product"

import { LocalErrorBoundary } from "@/components/LocalErrorBoundary"

export function ProductsPage() {
  const { products, pagination, loading, error, fetchProducts } = useProductStore()
  const { user } = useAuthStore()
  const platform = (user?.platform as 'salla' | 'zid') || 'zid'
  
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = parseInt(searchParams.get("page") || "1", 10)

  useEffect(() => {
    fetchProducts(platform, pageParam);
  }, [fetchProducts, platform, pageParam]);

  const handleRefresh = () => {
    fetchProducts(platform, pageParam);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">

      {/* الترويسة والتحكم */}
      <div className="flex items-center justify-between gap-4 pb-1 w-full">
        <div className="flex flex-col text-right">
          <p className="text-2xl font-bold text-foreground flex items-center gap-2">
            إدارة المنتجات 📦
          </p>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loading && products.length === 0
              ? 'جارٍ تحميل المنتجات...'
              : error
              ? 'تعذّر جلب البيانات'
              : `${pagination.totalCount.toLocaleString('ar')} منتج مسجل بالمتجر`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50 h-9"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* حالة الخطأ */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* حاوية الجدول الكاملة */}
      <LocalErrorBoundary>
        <div className="border border-border/40 rounded-xl bg-card shadow-sm overflow-hidden w-full">

          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3 w-[60px]">الصورة</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">اسم المنتج</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">رمز SKU</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">السعر الحالي</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">السعر الأساسي</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الكمية</TableHead>
                {platform === 'zid' ? (
                  <>
                    <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">التصنيف</TableHead>
                    <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الفئة (Class)</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">النوع (Type)</TableHead>
                    <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">قنوات البيع</TableHead>
                  </>
                )}
                <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الحالة</TableHead>
                <TableHead className="text-left text-xs font-bold text-muted-foreground py-3 w-[120px]">العمليات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <ProductsSkeleton rows={8} platform={platform} />
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Package className="size-10 opacity-25" />
                      <span className="text-sm">لا توجد منتجات متوفرة بالمتجر حالياً</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => 
                  platform === 'zid' ? (
                    <ZidProductRow key={product.id} product={product as ZidProductItem} />
                  ) : (
                    <SallaProductRow key={product.id} product={product as SallaProductItem} />
                  )
                )
              )}
            </TableBody>
          </Table>

          {/* الباجينيشن — أسفل الجدول */}
          <ProductsPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </LocalErrorBoundary>

    </div>
  )
}
