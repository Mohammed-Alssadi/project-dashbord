import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react"

interface OrdersPaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  onPageChange: (page: number) => void;
  loading: boolean;
}

export function OrdersPagination({ pagination, onPageChange, loading }: OrdersPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/5">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1 || loading}
          variant="outline"
          size="sm"
        >
          السابق
        </Button>
        <Button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages || loading}
          variant="outline"
          size="sm"
        >
          التالي
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            إجمالي الطلبات: <span className="font-semibold text-foreground">{pagination.totalCount}</span>
            {loading && <Loader2 className="size-3 animate-spin text-primary" />}
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination" dir="ltr">
            <Button
              variant="outline"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground hover:bg-muted/50 rounded-r-none h-9 border-r-0"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
            >
              <span className="sr-only">السابق</span>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            
            <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border/40 h-9 bg-card">
              صفحة {pagination.currentPage} من {pagination.totalPages}
            </div>

            <Button
              variant="outline"
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground hover:bg-muted/50 rounded-l-none h-9 border-l-0"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || loading}
            >
              <span className="sr-only">التالي</span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
