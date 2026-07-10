import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersSkeletonProps {
  rowsCount?: number;
  columnsCount: number;
}

export function OrdersSkeleton({ rowsCount = 5, columnsCount }: OrdersSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, idx) => (
        <TableRow key={`skeleton-${idx}`} className="animate-pulse">
          {Array.from({ length: columnsCount }).map((_, cIdx) => (
            <TableCell key={`skeleton-cell-${cIdx}`} className="py-3">
              <div className={cIdx === columnsCount - 1 ? "flex justify-start" : ""}>
                <Skeleton className={`h-4 rounded-lg ${cIdx === columnsCount - 1 ? "w-20" : "w-24"}`} />
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
