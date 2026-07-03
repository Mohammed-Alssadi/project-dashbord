import { useMemo } from "react"
import { useProducts } from "../hooks/useProducts"
import { ProductRow } from "../components/ProductRow"
import { ProductsSkeleton } from "../components/ProductsSkeleton"
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
  Package, 
  RefreshCw, 
  Search, 
  Filter,
  AlertTriangle
} from "lucide-react"
import { getSallaOAuthUrl } from "@/features/auth/services/sallaAuthApi"

/**
 * صفحة إدارة المنتجات المتقدمة والديناميكية (Enterprise Products Management)
 */
export function ProductsPage() {
  const {
    products,
    loading,
    refresh,
    paginationInfo,
    categories, // قراءة التصنيفات الشاملة من الخطاف
    types,      // قراءة الأنواع الشاملة من الخطاف
    page,
    searchTerm,
    status,
    category,
    type,
    error,
    setPage,
    setSearchTerm,
    setStatus,
    setCategory,
    setType
  } = useProducts()

  // تجهيز قوائم الخيارات مع إضافة خيار "الكل" افتراضياً
  const categoryOptions = useMemo(() => {
    return [
      { id: "الكل", name: "القسم: الكل" },
      ...categories.map(cat => ({
        id: String(cat.id),
        name: `القسم: ${cat.name || 'عام'}`
      }))
    ]
  }, [categories])

  const typeOptions = useMemo(() => {
    return ["الكل", ...types]
  }, [types])

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      
      {/* 1. الترويسة والتحكم */}
      <div className="flex items-center justify-between gap-4 pb-1 w-full">
        <div className="flex flex-col text-right">
          <p className="text-2xl font-bold text-foreground flex items-center gap-2">
            إدارة المنتجات 📦
          </p>
          <p className="text-muted-foreground text-md mt-0.5">
            مراقبة وعرض بيانات المنتجات المتصلة بمتجرك لحظياً.
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
          تحديث ومزامنة البيانات
        </Button>
      </div>

      {/* تنبيه انتهاء الصلاحيات أو فقدان النطاقات (Scopes) */}
      {error && (
        <div className="p-4 border border-amber-500/20 bg-amber-500/5 text-amber-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold animate-shake">
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
            <span>تصفية المنتجات</span>
          </div>

          {/* الفلاتر الفورية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
            {/* البحث بالاسم أو SKU */}
            <div className="relative flex items-center">
              <Search className="size-4 text-muted-foreground absolute right-3 shrink-0 pointer-events-none" />
              <Input
                placeholder="ابحث بالاسم أو SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 h-9 text-xs rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary bg-background shadow-none"
              />
            </div>

            {/* فلترة بالقسم */}
            <div className="flex flex-col">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-9 text-xs border-border/70 bg-background text-foreground rounded-lg shadow-none flex justify-between items-center text-right font-sans">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent className="text-right" align="end">
                  {categoryOptions.map((cat, idx) => (
                    <SelectItem key={idx} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* فلترة بالحالة */}
            <div className="flex flex-col">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full h-9 text-xs border-border/70 bg-background text-foreground rounded-lg shadow-none flex justify-between items-center text-right font-sans">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="text-right" align="end">
                  <SelectItem value="الكل">الحالة: الكل</SelectItem>
                  <SelectItem value="active">الحالة: active</SelectItem>
                  <SelectItem value="hidden">الحالة: hidden</SelectItem>
                  <SelectItem value="out_of_stock">الحالة: out_of_stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* فلترة بالنوع */}
            <div className="flex flex-col">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full h-9 text-xs border-border/70 bg-background text-foreground rounded-lg shadow-none flex justify-between items-center text-right font-sans">
                  <SelectValue placeholder="اختر نوع المنتج" />
                </SelectTrigger>
                <SelectContent className="text-right" align="end">
                  {typeOptions.map((t, idx) => (
                    <SelectItem key={idx} value={t}>{t === "الكل" ? "النوع: الكل" : `النوع: ${t}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* جدول المنتجات */}
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3 w-[80px]">الصورة</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">المنتج</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">السعر</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">التكلفة</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الكمية</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">القسم</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">النوع</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground py-3">الحالة</TableHead>
              <TableHead className="text-left text-xs font-bold text-muted-foreground py-3 w-[130px]"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <ProductsSkeleton />
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="size-10 mb-2.5 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">لم يتم العثور على أي منتجات</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            )}
          </TableBody>
        </Table>

        {/* ذيل إطار الجدول للتنقل والترقيم (Pagination Footer) */}
        {paginationInfo && paginationInfo.totalPages > 1 && (
          <div className="p-4 border-t border-border/30 bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-right font-sans text-xs">
            <div className="text-muted-foreground">
              عرض <span className="font-bold text-foreground">{products.length}</span> منتجات من أصل <span className="font-bold text-foreground">{paginationInfo.total}</span>
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
