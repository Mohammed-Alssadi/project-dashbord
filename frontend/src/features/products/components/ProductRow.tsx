import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ExternalLink, Eye } from "lucide-react"
import { type UnifiedProduct } from "../services/productAdapter"
import { Link } from "react-router-dom"

interface ProductRowProps {
  product: UnifiedProduct;
}

/**
 * صف منتج — يعرض البيانات الموحدة التفاعلية
 */
export function ProductRow({ product }: ProductRowProps) {
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;



  return (
    <TableRow className="hover:bg-muted/30 transition-colors group">

      {/* 1. الصورة */}
      <TableCell className="w-[60px] py-2">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-10 rounded-lg border border-border/60 object-cover bg-muted/30 shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="size-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground/60 shrink-0">
            <Package className="size-4" />
          </div>
        )}
      </TableCell>

      {/* 2. الاسم والـ SKU */}
      <TableCell className="text-right py-2">
        <div className="flex flex-col gap-0.5">
          <Link
            to={`/dashboard/products/${product.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 max-w-[260px] hover:underline"
          >
            {product.name}
          </Link>
          <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">
            {product.sku || '—'}
          </span>
        </div>
      </TableCell>

      {/* 3. السعر */}
      <TableCell className="text-right py-2">
        <div className="flex flex-col gap-0.5">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-foreground">
                {product.salePrice} {product.currency}
              </span>
              <span className="text-[10px] text-muted-foreground line-through">
                {product.price} {product.currency}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-foreground">
              {product.price} {product.currency}
            </span>
          )}
        </div>
      </TableCell>

      {/* 4. الكمية */}
      <TableCell className="text-right py-2">
        <span className={`text-sm font-semibold ${product.quantity === 0 ? 'text-destructive' : 'text-foreground/80'}`}>
          {product.quantity}
        </span>
      </TableCell>

      {/* 5. التصنيف */}
      <TableCell className="text-right py-2">
        <span className="text-xs text-muted-foreground">
          {product.category || 'غير مصنف'}
        </span>
      </TableCell>

      {/* 6. النوع */}
      <TableCell className="text-right py-2">
        <span className="text-xs text-muted-foreground/70 font-mono">
          {product.type || 'product'}
        </span>
      </TableCell>

      {/* 7. الحالة */}
      <TableCell className="text-right py-2">
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md font-mono border-muted-foreground/30 text-muted-foreground bg-muted/5">
          {product.status}
        </Badge>
      </TableCell>

      {/* 8. العمليات */}
      <TableCell className="text-left w-[120px] py-2">
        <div className="flex items-center justify-end gap-1">
          {product.productUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              title="عرض في المتجر"
              asChild
            >
              <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            title="عرض التفاصيل"
            asChild
          >
            <Link to={`/dashboard/products/${product.id}`}>
              <Eye className="size-3.5" />
            </Link>
          </Button>

        </div>
      </TableCell>

    </TableRow>
  );
}

