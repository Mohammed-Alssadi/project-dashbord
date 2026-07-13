import { TableRow, TableCell } from "@/components/ui/table";
import type { ZidOrder } from "../types/order";
import { Button } from "@/components/ui/button";
import { Eye, CreditCard, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ZidOrderRowProps {
  order: ZidOrder;
}

export function ZidOrderRow({ order }: ZidOrderRowProps) {
  const navigate = useNavigate();

  // Format Date safely
  let formattedDate = 'تاريخ غير معروف';
  try {
    if (order.created_at) {
      formattedDate = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(order.created_at));
    }
  } catch (e) {
    console.error("Date formatting error", e);
  }

  const customerName = order.customer?.name || '—';
  const statusColor = order.display_status?.color || '#9e9e9e';
  const statusText = order.display_status?.name || order.order_status?.name || '—';

  // Extract totals
  const totalDisplay = order.order_total_string || order.transaction_amount_string || `${order.transaction_amount || 0} ${order.currency_code || 'SAR'}`;

  return (
    <TableRow 
      className="hover:bg-muted/30 transition-colors group cursor-pointer" 
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      {/* 1. رقم الطلب */}
      <TableCell className="text-right py-3">
        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors inline-block" dir="ltr">
          #{order.code || order.invoice_number || order.id}
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
        <span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-[11px] font-bold border shrink-0"
          style={{ 
            backgroundColor: `${statusColor}12`, // 10% opacity
            color: statusColor,
            borderColor: `${statusColor}30`
          }}
        >
          {statusText}
        </span>
        {order.payment_status === 'pending' && (
          <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-1">
            <AlertTriangle className="size-3" /> بانتظار الدفع
          </span>
        )}
      </TableCell>

      {/* 5. طريقة الدفع */}
      <TableCell className="text-right py-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <CreditCard className="size-3.5" />
          {order.payment?.method?.name || '—'}
        </div>
      </TableCell>

      {/* 6. الإجمالي */}
      <TableCell className="text-right py-3">
        <span className="text-sm font-bold text-foreground" dir="ltr">
          {totalDisplay}
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
