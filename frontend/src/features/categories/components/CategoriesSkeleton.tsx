import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface CategoriesSkeletonProps {
  platform?: 'salla' | 'zid';
}

/**
 * هيكل تحميل صفوف جدول الأقسام/التصنيفات
 */
export function CategoriesSkeleton({ platform = 'zid' }: CategoriesSkeletonProps) {
  const isZid = platform === 'zid';
  const isSalla = platform === 'salla';

  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <TableRow key={idx}>
          {/* 1. الصورة */}
          <TableCell className="w-[60px] py-2">
            <Skeleton className="size-10 rounded-lg animate-pulse" />
          </TableCell>
          
          {/* 2. القسم */}
          <TableCell className="text-right py-2">
            <Skeleton className="h-4 w-[160px] mb-2 animate-pulse" />
          </TableCell>

          {isZid && (
            <>
              {/* 3. الرابط (Slug) */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-3 w-[80px] animate-pulse" />
              </TableCell>
              
              {/* 4. عدد المنتجات */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-[40px] animate-pulse" />
              </TableCell>

              {/* 5. فروع */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-[30px] animate-pulse" />
              </TableCell>

              {/* 6. النشر */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-5 w-[65px] rounded-md animate-pulse" />
              </TableCell>
            </>
          )}

          {isSalla && (
            <>
              {/* 3. الترتيب */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-4 w-[30px] animate-pulse" />
              </TableCell>

              {/* 4. طريقة الفرز */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-5 w-[80px] rounded-md animate-pulse" />
              </TableCell>

              {/* 5. الحالة */}
              <TableCell className="text-right py-2">
                <Skeleton className="h-5 w-[65px] rounded-md animate-pulse" />
              </TableCell>
            </>
          )}
          
          {/* العمليات */}
          <TableCell className="text-left w-[120px] py-2">
            <div className="flex gap-1 justify-end">
              <Skeleton className="h-7 w-7 rounded-lg animate-pulse" />
              <Skeleton className="h-7 w-7 rounded-lg animate-pulse" />
              <Skeleton className="h-7 w-7 rounded-lg animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

