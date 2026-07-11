import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ExternalLink, Eye, Edit, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import type { SallaProductItem } from "../types/product"

interface SallaProductRowProps {
  product: SallaProductItem;
}

export function SallaProductRow({ product }: SallaProductRowProps) {
  const imageUrl = product.thumbnail || product.main_image || product.images?.[0]?.url || '';
  const price = product.price?.amount ?? 0;
  const regularPrice = product.regular_price?.amount ?? price;
  const currency = product.price?.currency || 'SAR';
  const hasDiscount = regularPrice > price;

  return (
    <TableRow className="hover:bg-muted/30 transition-colors group">
      {/* 1. الصورة */}
      <TableCell className="w-[60px] py-2">
        {imageUrl ? (
          <img
            src={imageUrl}
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

      {/* 2. الاسم */}
      <TableCell className="text-right py-2">
        <Link
          to={`/dashboard/products/${product.id}`}
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 hover:underline"
        >
          {product.name}
        </Link>
      </TableCell>

      {/* 3. الـ SKU */}
      <TableCell className="text-right py-2">
        <span className="text-sm text-muted-foreground font-mono" dir="ltr">
          {product.sku || '—'}
        </span>
      </TableCell>

      {/* 4. السعر الحالي */}
      <TableCell className="text-right py-2">
        <span className="text-sm font-bold text-foreground">
          {price} {currency}
        </span>
      </TableCell>

      {/* 5. السعر القديم */}
      <TableCell className="text-right py-2">
        {hasDiscount ? (
          <span className="text-sm text-muted-foreground line-through">
            {regularPrice} {currency}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* 6. الكمية */}
      <TableCell className="text-right py-2">
        <span className={`text-sm font-semibold ${product.quantity === 0 ? 'text-destructive' : 'text-foreground/80'}`}>
          {product.quantity}
        </span>
      </TableCell>

      {/* 7. النوع (Salla specific) */}
      <TableCell className="text-right py-2">
        <span className="text-xs text-muted-foreground/70 font-mono">
          {product.type || 'product'}
        </span>
      </TableCell>

      {/* 8. قنوات البيع (Salla specific) */}
      <TableCell className="text-right py-2">
        <div className="flex gap-1 flex-wrap">
          {product.channels?.length > 0 ? product.channels.map((ch, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0 capitalize">
              {ch}
            </Badge>
          )) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>

      {/* 9. الحالة */}
      <TableCell className="text-right py-2">
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md font-mono border-muted-foreground/30 text-muted-foreground bg-muted/5">
          {product.status}
        </Badge>
      </TableCell>

      {/* 10. العمليات */}
      <TableCell className="text-left w-[120px] py-2">
        <div className="flex items-center justify-end gap-1">
          {product.url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              title="عرض في المتجر"
              asChild
            >
              <a href={product.url} target="_blank" rel="noopener noreferrer">
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-muted-foreground"
            title="تعديل المنتج"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            title="حذف المنتج"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
