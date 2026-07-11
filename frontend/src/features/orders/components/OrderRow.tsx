import { TableRow, TableCell } from "@/components/ui/table";
import type { UnifiedOrder } from "../adapters/orderAdapter";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, CreditCard, Clock, AlertTriangle } from "lucide-react";

interface OrderRowProps {
  order: UnifiedOrder;
  onViewDetails: (orderId: string | number) => void;
}

export function OrderRow({ order, onViewDetails }: OrderRowProps) {
  // Format Date safely
  let formattedDate = 'تاريخ غير معروف';
  try {
    if (order.date) {
      formattedDate = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(order.date));
    }
  } catch (e) {
    console.error("Date formatting error", e);
  }

  return (
    <TableRow className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => onViewDetails(order.id)}>
      
      {/* 1. رقم الطلب */}
      <TableCell className="text-right py-3">
        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors inline-block" dir="ltr">
          #{order.referenceNo}
        </span>
      </TableCell>

      {/* 2. التاريخ */}
      <TableCell className="text-right py-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-3.5" />
          <span className="text-xs">{formattedDate}</span>
        </div>
      </TableCell>

      {/* 3. العميل */}
      <TableCell className="text-right py-3">
        <span className="text-sm font-semibold text-foreground line-clamp-1">
          {order.customerName}
        </span>
      </TableCell>

      {/* 4. الحالة */}
      <TableCell className="text-right py-3">
        <OrderStatusBadge statusSlug={order.statusSlug} statusText={order.statusText} />
        {order.isPendingPayment && (
          <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-1">
            <AlertTriangle className="size-3" /> بانتظار الدفع
          </span>
        )}
      </TableCell>

      {/* 5. طريقة الدفع */}
      <TableCell className="text-right py-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <CreditCard className="size-3.5" />
          {order.paymentMethod}
        </div>
      </TableCell>

      {/* 6. الإجمالي */}
      <TableCell className="text-right py-3">
        <span className="text-sm font-bold text-foreground">
          {order.totalAmount.toLocaleString('ar-SA')} <span className="text-xs text-muted-foreground font-normal">{order.currency}</span>
        </span>
      </TableCell>

      {/* 7. العمليات */}
      <TableCell className="text-left py-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            onViewDetails(order.id);
          }}
        >
          <Eye className="size-4 ml-1.5" />
          التفاصيل
        </Button>
      </TableCell>
    </TableRow>
  );
}
