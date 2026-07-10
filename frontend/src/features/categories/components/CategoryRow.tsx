import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Folder, Edit, Trash, ExternalLink, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { type UnifiedCategory } from "../services/categoryAdapter"
import { useAuthState } from "@/features/auth/hooks/useAuthState"

export function CategoryRow({ category }: { category: UnifiedCategory }) {
  const { user } = useAuthState()
  const isZid = user?.platform === 'zid'
  const isSalla = user?.platform === 'salla'
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="w-[80px]">
        {category.imageUrl ? (
          <img 
            src={category.imageUrl} 
            alt={category.name} 
            className="size-10 rounded-lg border border-border/80 object-cover bg-background shrink-0 shadow-sm"
          />
        ) : (
          <div className="size-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground/60 shrink-0">
            <Folder className="size-4.5" />
          </div>
        )}
      </TableCell>

      <TableCell className="text-right font-medium">
        <div className="flex flex-col text-right">
          <span className="text-sm font-bold text-foreground line-clamp-1 max-w-[280px]">
            {category.name}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono" dir="ltr">
            ID: {category.id}
          </span>
        </div>
      </TableCell>

      {isZid && (
        <TableCell className="text-right">
          <span className="font-bold text-sm text-foreground">
            {category.productsCount ?? 0} منتجات
          </span>
        </TableCell>
      )}

      {isSalla && (
        <TableCell className="text-right">
          <span className="text-sm text-muted-foreground font-medium">
            {category.sortOrder || 0}
          </span>
        </TableCell>
      )}

      <TableCell className="text-right">
        <Badge variant="outline" className={`text-[10px] font-mono px-2 py-0.5 rounded-md lowercase ${category.status === 'active' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-destructive/30 text-destructive bg-destructive/5'}`}>
          {category.status || 'N/A'}
        </Badge>
      </TableCell>

      <TableCell className="text-left w-[130px]">
        <div className="flex items-center justify-end gap-1">
          {category.url && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="عرض في المتجر"
              asChild
            >
              <a href={category.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors shrink-0"
            title="عرض التفاصيل"
            asChild
          >
            <Link to={`/dashboard/categories/${category.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors shrink-0"
            title="تعديل القسم"
          >
            <Edit className="size-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-colors shrink-0"
            title="حذف القسم"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
