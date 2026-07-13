import { useNavigate } from 'react-router-dom';
import type { ZidCustomerItem } from '../types/customer';
import { User, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  customer: ZidCustomerItem;
  index: number;
}

export const ZidCustomerRow = ({ customer, index }: Props) => {
  const navigate = useNavigate();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/customers/${customer.id}`);
  };

  const name = customer.name || '-';
  const mobile = customer.mobile || '-';
  const country = customer.city?.country_name || '-';
  const city = customer.city?.ar_name || customer.city?.name || '-';

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors group">
      {/* 1. Index */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground w-12 text-center">
        {index + 1}
      </td>
      
      {/* 2. Avatar */}
      <td className="px-4 py-4 whitespace-nowrap w-[60px]">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <User className="w-5 h-5" />
        </div>
      </td>

      {/* 3. Name */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="font-medium text-foreground">{name}</div>
      </td>

      {/* 4. ID */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md inline-block">
          {customer.id}
        </div>
      </td>

      {/* 5. Mobile */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-foreground" dir="ltr">{mobile}</div>
      </td>

      {/* 6. Email */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-foreground truncate max-w-[150px]">{customer.email || '-'}</div>
      </td>

      {/* 7. Country */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-foreground">{country}</div>
      </td>

      {/* 8. City */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-foreground">{city}</div>
      </td>

      {/* 9. Orders */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-semibold text-foreground">{customer.order_counts || 0}</div>
      </td>

      {/* 10. Points */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-bold text-amber-500">{customer.points || 0}</div>
      </td>

      {/* 11. Active Status */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
          ${customer.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
        >
          {customer.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {customer.is_active ? 'نشط' : 'غير نشط'}
        </span>
      </td>

      {/* 12. Verification */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
          ${customer.verified ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}
        >
          {customer.verified ? 'موثق' : 'غير موثق'}
        </span>
      </td>

      {/* 13. Actions */}
      <td className="px-4 py-4 whitespace-nowrap text-left w-[120px]">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleView}
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-muted-foreground"
            title="تعديل العميل"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            title="حذف العميل"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
