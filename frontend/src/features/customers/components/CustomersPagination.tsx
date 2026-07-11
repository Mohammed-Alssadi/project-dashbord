import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerStore } from '../store/customerStore';

interface CustomersPaginationProps {
  platform: 'salla' | 'zid';
}

export function CustomersPagination({ platform }: CustomersPaginationProps) {
  const { pagination, goToPage, loading } = useCustomerStore();
  const { currentPage, totalPages, totalCount, perPage, hasNext, hasPrev } = pagination;

  // If there's no data or only 1 page
  if (totalPages <= 1 && totalCount <= perPage) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalCount || currentPage * perPage);

  return (
    <div className="px-4 py-3 border-t border-border/30 bg-muted/5 flex items-center justify-between gap-4" dir="rtl">
      {/* Display info */}
      <span className="text-xs text-muted-foreground shrink-0">
        عرض <strong className="text-foreground">{from}–{to}</strong> 
        {totalCount > 0 ? (
          <> من <strong className="text-foreground">{totalCount.toLocaleString('ar')}</strong> عميل</>
        ) : (
          ' عميل'
        )}
      </span>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/60"
          onClick={() => goToPage(platform, currentPage - 1)}
          disabled={!hasPrev || loading}
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
          onClick={() => goToPage(platform, currentPage + 1)}
          disabled={!hasNext || loading}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
