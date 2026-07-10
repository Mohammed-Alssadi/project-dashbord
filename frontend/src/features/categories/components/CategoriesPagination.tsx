import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type PaginationMeta } from '@/features/products/services/productQueryAdapter';

interface CategoriesPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function CategoriesPagination({ pagination, onPageChange, loading }: CategoriesPaginationProps) {
  const { currentPage, totalPages, totalCount, perPage } = pagination;

  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalCount);

  return (
    <div className="px-4 py-3 border-t border-border/30 bg-muted/5 flex items-center justify-between gap-4" dir="rtl">
      {/* Display info */}
      <span className="text-xs text-muted-foreground shrink-0">
        عرض <strong className="text-foreground">{from}–{to}</strong> من{' '}
        <strong className="text-foreground">{totalCount.toLocaleString('ar')}</strong> قسم
      </span>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/60"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <ChevronRight className="size-3.5" />
        </Button>

        <span className="text-xs px-2 text-muted-foreground select-none font-medium">
          صفحة {currentPage} من {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/60"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
