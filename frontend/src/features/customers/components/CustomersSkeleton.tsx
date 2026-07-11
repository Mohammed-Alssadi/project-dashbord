import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomersSkeletonProps {
  platform?: 'salla' | 'zid';
  rowsCount?: number;
}

export function CustomersSkeleton({ rowsCount = 5, platform = 'zid' }: CustomersSkeletonProps) {
  const isZid = platform === 'zid';
  const isSalla = platform === 'salla';

  return (
    <>
      {Array.from({ length: rowsCount }).map((_, idx) => (
        <TableRow key={`skeleton-${idx}`}>
          {/* 1. # */}
          <TableCell className="py-4 w-12 text-center">
            <Skeleton className="h-4 w-4 mx-auto animate-pulse" />
          </TableCell>
          
          {/* 2. الصورة */}
          <TableCell className="py-4 w-[60px]">
            <Skeleton className="size-10 rounded-full animate-pulse" />
          </TableCell>
          
          {/* 3. الاسم */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[120px] animate-pulse" />
          </TableCell>

          {/* 4. المعرف (ID) */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[80px] animate-pulse" />
          </TableCell>

          {/* 5. الجوال */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[100px] animate-pulse" />
          </TableCell>

          {/* 6. البريد الإلكتروني */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[140px] animate-pulse" />
          </TableCell>

          {/* 7. الدولة */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[60px] animate-pulse" />
          </TableCell>

          {/* 8. المدينة */}
          <TableCell className="py-4">
            <Skeleton className="h-4 w-[60px] animate-pulse" />
          </TableCell>

          {isSalla && (
            <>
              {/* 9. تاريخ التحديث */}
              <TableCell className="py-4">
                <Skeleton className="h-4 w-[80px] animate-pulse" />
              </TableCell>
              {/* 10. الجنس */}
              <TableCell className="py-4">
                <Skeleton className="h-5 w-[50px] rounded-md animate-pulse" />
              </TableCell>
            </>
          )}

          {isZid && (
            <>
              {/* 9. إجمالي الطلبات */}
              <TableCell className="py-4">
                <Skeleton className="h-4 w-[30px] animate-pulse" />
              </TableCell>
              {/* 10. النقاط */}
              <TableCell className="py-4">
                <Skeleton className="h-4 w-[30px] animate-pulse" />
              </TableCell>
              {/* 11. حالة النشاط */}
              <TableCell className="py-4">
                <Skeleton className="h-5 w-[65px] rounded-md animate-pulse" />
              </TableCell>
              {/* 12. التوثيق */}
              <TableCell className="py-4">
                <Skeleton className="h-5 w-[60px] rounded-md animate-pulse" />
              </TableCell>
            </>
          )}

          {/* العمليات */}
          <TableCell className="py-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Skeleton className="h-8 w-8 rounded-lg animate-pulse" />
              <Skeleton className="h-8 w-8 rounded-lg animate-pulse" />
              <Skeleton className="h-8 w-8 rounded-lg animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
