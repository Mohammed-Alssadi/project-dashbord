import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginationMeta } from '../store/productStore';

interface ProductsPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function ProductsPagination({ pagination, onPageChange, loading }: ProductsPaginationProps) {
  const { currentPage, totalPages, totalCount, perPage, hasNext, hasPrev } = pagination;

  if (totalPages <= 1) return null;

  // حساب نطاق الصفحات المعروضة (نافذة من 5 صفحات)
  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | '...')[] = [];
    const start = Math.max(2, currentPage - delta);
    const end   = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (start > 2) range.push('...');
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  // نطاق المنتجات المعروضة
  const from = (currentPage - 1) * perPage + 1;
  const to   = Math.min(currentPage * perPage, totalCount);

  return (
    <div
      className="px-4 py-3 border-t border-border/30 bg-muted/5 flex items-center justify-between gap-4"
      dir="rtl"
    >
      {/* معلومات العرض */}
      <span className="text-xs text-muted-foreground shrink-0">
        عرض <strong className="text-foreground">{from}–{to}</strong> من{' '}
        <strong className="text-foreground">{totalCount.toLocaleString('ar')}</strong> منتج
      </span>

      {/* أزرار التنقل */}
      <div className="flex items-center gap-1">
        {/* السابق */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/60"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev || loading}
        >
          <ChevronRight className="size-3.5" />
        </Button>

        {/* أرقام الصفحات */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`dots-${idx}`} className="w-7 text-center text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'ghost'}
              size="icon"
              className={`h-7 w-7 rounded-lg text-xs font-medium ${
                page === currentPage ? '' : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
              onClick={() => onPageChange(page as number)}
              disabled={loading}
            >
              {page}
            </Button>
          )
        )}

        {/* التالي */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/60"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext || loading}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
