import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductsSkeletonProps {
  rows?: number;
  platform?: 'salla' | 'zid' | 'unknown';
}

export function ProductsSkeleton({ rows = 8, platform = 'unknown' }: ProductsSkeletonProps) {
  const isZid = platform === 'zid';

  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <TableRow key={idx}>
          {/* 1. الصورة */}
          <TableCell className="w-[60px] py-2">
            <Skeleton className="size-10 rounded-lg" />
          </TableCell>

          {/* 2. اسم المنتج */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[140px]" />
          </TableCell>

          {/* 3. الـ SKU */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>

          {/* 4. السعر الحالي */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[60px]" />
          </TableCell>

          {/* 5. السعر الأساسي */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[60px]" />
          </TableCell>

          {/* 6. الكمية */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[35px]" />
          </TableCell>

          {/* الأعمدة المخصصة للمنصة */}
          {isZid ? (
            <>
              {/* 7. التصنيف (Zid) */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-[70px]" />
              </TableCell>

              {/* 8. الفئة (Zid) */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-[55px]" />
              </TableCell>
            </>
          ) : (
            <>
              {/* 7. النوع (Salla) */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-[60px]" />
              </TableCell>

              {/* 8. قنوات البيع (Salla) */}
              <TableCell className="text-right py-2">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-[40px] rounded-md" />
                  <Skeleton className="h-5 w-[30px] rounded-md" />
                </div>
              </TableCell>
            </>
          )}

          {/* 9. الحالة */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-5 w-[50px] rounded-md" />
          </TableCell>

          {/* 10. العمليات */}
          <TableCell className="text-left w-[120px] py-2">
            <div className="flex items-center justify-end gap-1">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
