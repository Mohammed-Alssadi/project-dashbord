import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductsSkeletonProps {
  rows?: number;
}

/**
 * هيكل تحميل صفوف جدول المنتجات — يطابق أعمدة الجدول الحالية (8 أعمدة)
 */
export function ProductsSkeleton({ rows = 8 }: ProductsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <TableRow key={idx}>
          {/* 1. الصورة */}
          <TableCell className="w-[60px] py-2">
            <Skeleton className="size-10 rounded-lg" />
          </TableCell>

          {/* 2. المنتج والـ SKU */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[180px] mb-1.5" />
            <Skeleton className="h-3 w-[80px]" />
          </TableCell>

          {/* 3. السعر */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[70px] mb-1" />
            <Skeleton className="h-3 w-[50px]" />
          </TableCell>

          {/* 4. الكمية */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[35px]" />
          </TableCell>

          {/* 5. التصنيف */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[70px]" />
          </TableCell>

          {/* 6. النوع */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[55px]" />
          </TableCell>

          {/* 7. الحالة */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-5 w-[50px] rounded-md" />
          </TableCell>

          {/* 8. العمليات */}
          <TableCell className="text-left w-[100px] py-2">
            <div className="flex gap-1 justify-end">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
