import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersSkeletonProps {
  rowsCount?: number;
}

export function OrdersSkeleton({ rowsCount = 5 }: OrdersSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, idx) => (
        <TableRow key={`skeleton-${idx}`}>
          {/* 1. رقم الطلب */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[80px] animate-pulse" />
          </TableCell>

          {/* 2. التاريخ */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[100px] animate-pulse" />
          </TableCell>

          {/* 3. العميل */}
          <TableCell className="py-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-[120px] animate-pulse" />
              <Skeleton className="h-3 w-[90px] animate-pulse" />
            </div>
          </TableCell>

          {/* 4. الحالة */}
          <TableCell className="py-4">
            <Skeleton className="h-6 w-[80px] rounded-full animate-pulse" />
          </TableCell>

          {/* 5. الدفع */}
          <TableCell className="py-4">
            <Skeleton className="h-6 w-[70px] rounded-md animate-pulse" />
          </TableCell>

          {/* 6. الإجمالي */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[60px] animate-pulse" />
          </TableCell>

          {/* 7. العمليات */}
          <TableCell className="py-4 text-left w-[120px]">
            <div className="flex gap-1.5 justify-end">
              <Skeleton className="h-8 w-8 rounded-lg animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
