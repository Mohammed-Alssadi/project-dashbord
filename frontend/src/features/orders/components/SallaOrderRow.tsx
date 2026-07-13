import { TableRow, TableCell } from "@/components/ui/table";
import type { SallaOrder } from "../types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, CreditCard, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SallaOrderRowProps {
  order: SallaOrder;
}

export function SallaOrderRow({ order }: SallaOrderRowProps) {
  const navigate = useNavigate();

  // Format Date safely
  let formattedDate = 'تاريخ غير معروف';
  try {
    if (order.date?.date) {
      formattedDate = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(order.date.date));
    }
  } catch (e) {
    console.error("Date formatting error", e);
  }

  const customerName = order.customer
    ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
    : '—';

  const statusText = order.status?.customized?.name || order.status?.name || '—';
  const statusSlug = order.status?.slug || 'unknown';

  return (
    <TableRow 
      className="hover:bg-muted/30 transition-colors group cursor-pointer" 
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      {/* 1. رقم الطلب */}
      <TableCell className="text-right py-3">
        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors inline-block" dir="ltr">
          #{order.reference_id || order.id}
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
          {customerName}
        </span>
      </TableCell>

      {/* 4. الحالة */}
      <TableCell className="text-right py-3">
        <OrderStatusBadge statusSlug={statusSlug} statusText={statusText} />
        {order.is_pending_payment && (
          <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-1">
            <AlertTriangle className="size-3" /> بانتظار الدفع
          </span>
        )}
      </TableCell>

      {/* 5. طريقة الدفع */}
      <TableCell className="text-right py-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <CreditCard className="size-3.5" />
          {order.payment_method || '—'}
        </div>
      </TableCell>

      {/* 6. الإجمالي */}
      <TableCell className="text-right py-3">
        <span className="text-sm font-bold text-foreground">
          {order.total?.amount?.toLocaleString('ar-SA') || '0'}{" "}
          <span className="text-xs text-muted-foreground font-normal">{order.total?.currency || 'SAR'}</span>
        </span>
      </TableCell>

      {/* 7. العمليات */}
      <TableCell className="text-left py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            title="عرض التفاصيل"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              navigate(`/orders/${order.id}`);
            }}
          >
            <Eye className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
