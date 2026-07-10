import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomersSkeletonProps {
  rowsCount?: number;
  columnsCount: number;
}

export function CustomersSkeleton({ rowsCount = 5, columnsCount }: CustomersSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, idx) => (
        <TableRow key={`skeleton-${idx}`} className="animate-pulse">
          {Array.from({ length: columnsCount }).map((_, cIdx) => (
            <TableCell key={`skeleton-cell-${cIdx}`} className="py-3">
              {cIdx === 0 ? (
                <Skeleton className="size-9 rounded-full" />
              ) : (
                <div className={cIdx === columnsCount - 1 ? "flex justify-end" : ""}>
                  <Skeleton className={`h-4 rounded-lg ${cIdx === columnsCount - 1 ? "size-7" : "w-24"}`} />
                </div>
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
