import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Edit, Trash, ExternalLink } from "lucide-react"
import type { Product } from "../services/productService"

interface ProductRowProps {
  product: Product;
}

/**
 * صف منتج يعرض البيانات الخام كأعمدة منفصلة دون إضافات أو ترجمات مخصصة
 */
export function ProductRow({ product }: ProductRowProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      {/* 1. الصورة */}
      <TableCell className="w-[80px]">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="size-10 rounded-lg border border-border/80 object-cover bg-background shrink-0 shadow-sm"
          />
        ) : (
          <div className="size-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground/60 shrink-0">
            <Package className="size-4.5" />
          </div>
        )}
      </TableCell>

      {/* 2. المنتج والـ SKU */}
      <TableCell className="text-right font-medium">
        <div className="flex flex-col text-right">
          <span className="text-sm font-bold text-foreground line-clamp-1 max-w-[280px]">
            {product.name}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono" dir="ltr">
            SKU: {product.sku || 'N/A'}
          </span>
        </div>
      </TableCell>

      {/* 3. السعر */}
      <TableCell className="text-right">
        <span className="font-bold text-sm text-foreground">
          {product.price} {product.currency}
        </span>
      </TableCell>

      {/* 4. التكلفة */}
      <TableCell className="text-right">
        <span className="text-sm text-muted-foreground font-medium">
          {product.costPrice} {product.currency}
        </span>
      </TableCell>

      {/* 5. الكمية */}
      <TableCell className="text-right">
        <span className="text-sm text-foreground/80 font-semibold">
          {product.quantity}
        </span>
      </TableCell>

      {/* 6. القسم (عمود منفصل) */}
      <TableCell className="text-right">
        <span className="text-xs text-muted-foreground font-medium">
          {product.category || 'N/A'}
        </span>
      </TableCell>

      {/* 7. النوع (عمود منفصل) */}
      <TableCell className="text-right font-mono text-xs text-muted-foreground/80">
        {product.type || 'N/A'}
      </TableCell>

      {/* 8. الحالة */}
      <TableCell className="text-right">
        <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 rounded-md lowercase">
          {product.status || 'N/A'}
        </Badge>
      </TableCell>

      {/* 9. العمليات */}
      <TableCell className="text-left w-[130px]">
        <div className="flex items-center justify-end gap-1">
          {product.productUrl && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="عرض في المتجر"
              asChild
            >
              <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors shrink-0"
            title="تعديل المنتج"
          >
            <Edit className="size-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-colors shrink-0"
            title="حذف المنتج"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
