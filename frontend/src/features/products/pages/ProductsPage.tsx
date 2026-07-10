import { useProducts } from "../hooks/useProducts"
import { ProductRow } from "../components/ProductRow"
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

export function ProductsPage() {
  const { products, pagination, loading, error, goToPage, refresh } = useProducts()

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
            onClick={refresh}
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
      <div className="border border-border/40 rounded-xl bg-card shadow-sm overflow-hidden w-full">

        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3 w-[60px]">الصورة</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">المنتج</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">السعر</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الكمية</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">التصنيف</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">النوع</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الحالة</TableHead>
              <TableHead className="text-left text-xs font-bold text-muted-foreground py-3 w-[120px]">العمليات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* حالة التحميل الأولية */}
            {loading && products.length === 0 && <ProductsSkeleton rows={8} />}

            {/* لا يوجد منتجات */}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Package className="size-10 opacity-25" />
                    <span className="text-sm">لا توجد منتجات متوفرة بالمتجر حالياً</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* صفوف المنتجات */}
            {products.map((product) => (
              <ProductRow 
                key={product.id} 
                product={product} 
              />
            ))}
          </TableBody>
        </Table>

        {/* الباجينيشن — أسفل الجدول */}
        <ProductsPagination
          pagination={pagination}
          onPageChange={goToPage}
          loading={loading}
        />
      </div>


    </div>
  )
}

