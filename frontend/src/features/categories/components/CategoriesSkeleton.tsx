import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * هيكل تحميل صفوف جدول الأقسام/التصنيفات
 */
export function CategoriesSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <TableRow key={idx}>
          {/* 1. الصورة */}
          <TableCell className="w-[80px]">
            <Skeleton className="size-10 rounded-lg animate-pulse" />
          </TableCell>
          
          {/* 2. القسم والـ ID */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[160px] mb-2 animate-pulse" />
            <Skeleton className="h-3 w-[80px] animate-pulse" />
          </TableCell>
          
          {/* 3. عدد المنتجات */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[60px] animate-pulse" />
          </TableCell>
          
          {/* 4. الترتيب */}
          <TableCell className="text-right">
            <Skeleton className="h-4 w-[40px] animate-pulse" />
          </TableCell>

          {/* 5. الحالة */}
          <TableCell className="text-right">
            <Skeleton className="h-5 w-[65px] rounded-md animate-pulse" />
          </TableCell>
          
          {/* 6. العمليات */}
          <TableCell className="text-left w-[150px]">
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

