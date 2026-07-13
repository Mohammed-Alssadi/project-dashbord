import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Folder, ExternalLink, Eye, Edit, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import type { ZidCategoryItem } from "../types/category"

interface ZidCategoryRowProps {
  category: ZidCategoryItem;
}

export function ZidCategoryRow({ category }: ZidCategoryRowProps) {
  const imageUrl = category.image || category.image_full_size || '';
  
  // Extract name which might be a string or localized object
  const name = category.names?.ar || category.names?.en || category.name || '—';

  const isPublished = category.is_published ?? true;
  const url = category.url || '';

  return (
    <TableRow className="hover:bg-muted/30 transition-colors group">
      {/* 1. الصورة */}
      <TableCell className="w-[60px] py-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="size-10 rounded-lg border border-border/60 object-cover bg-muted/30 shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="size-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground/60 shrink-0">
            <Folder className="size-4" />
          </div>
        )}
      </TableCell>

      {/* 2. الاسم */}
      <TableCell className="text-right py-2">
        <div className="flex flex-col">
          <Link
            to={`/categories/${category.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 hover:underline"
          >
            {name}
          </Link>
          {category.flat_name && category.flat_name !== name && (
            <span className="text-[10px] text-muted-foreground line-clamp-1">{category.flat_name}</span>
          )}
        </div>
      </TableCell>

      {/* 3. Slug */}
      <TableCell className="text-right py-2">
        <span className="text-xs text-muted-foreground font-mono" dir="ltr">
          {category.slug || '—'}
        </span>
      </TableCell>

      {/* 4. عدد المنتجات */}
      <TableCell className="text-right py-2">
        <span className="text-sm font-bold text-foreground">
          {category.products_count ?? '—'}
        </span>
      </TableCell>

      {/* 5. التصنيف الفرعي (العدد) */}
      <TableCell className="text-right py-2">
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md font-mono">
          {category.sub_categories?.length || 0} فروع
        </Badge>
      </TableCell>

      {/* 6. النشر */}
      <TableCell className="text-right py-2">
        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-md font-mono border-muted-foreground/30 ${!isPublished ? 'text-destructive bg-destructive/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
          {isPublished ? 'منشور' : 'غير منشور'}
        </Badge>
      </TableCell>

      {/* 7. العمليات */}
      <TableCell className="text-left w-[120px] py-2">
        <div className="flex items-center justify-end gap-1">
          {url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              title="عرض في المتجر"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
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
            <Link to={`/categories/${category.id}`}>
              <Eye className="size-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-muted-foreground"
            title="تعديل القسم"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            title="حذف القسم"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
