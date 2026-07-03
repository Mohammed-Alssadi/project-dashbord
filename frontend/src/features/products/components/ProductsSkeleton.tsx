import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * هيكل تحميل صفوف جدول المنتجات الموحد
 */
export function ProductsSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, idx) => (
        <TableRow key={idx}>
          {/* 1. الصورة */}
          <TableCell className="w-[80px]">
            <Skeleton className="size-10 rounded-lg animate-pulse" />
          </TableCell>
          
          {/* 2. المنتج والـ SKU */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[200px] mb-2 animate-pulse" />
            <Skeleton className="h-3 w-[80px] animate-pulse" />
          </TableCell>
          
          {/* 3. السعر */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[60px] animate-pulse" />
          </TableCell>

          {/* 4. التكلفة */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[60px] animate-pulse" />
          </TableCell>
          
          {/* 5. الكمية */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[40px] animate-pulse" />
          </TableCell>

          {/* 6. القسم */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[70px] animate-pulse" />
          </TableCell>
          
          {/* 7. النوع */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[70px] animate-pulse" />
          </TableCell>
          
          {/* 8. الحالة */}
          <TableCell className="text-right">
            <Skeleton className="h-5 w-[50px] rounded-md animate-pulse" />
          </TableCell>
          
          {/* 9. العمليات */}
          <TableCell className="text-left w-[130px]">
            <div className="flex gap-1.5 justify-end">
              <Skeleton className="h-8 w-8 rounded-xl animate-pulse" />
              <Skeleton className="h-8 w-8 rounded-xl animate-pulse" />
              <Skeleton className="h-8 w-8 rounded-xl animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
