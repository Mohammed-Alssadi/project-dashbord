import { useNavigate } from 'react-router-dom';
import type { SallaCustomerItem } from '../types/customer';
import { User, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  customer: SallaCustomerItem;
  index: number;
}

export const SallaCustomerRow = ({ customer, index }: Props) => {
  const navigate = useNavigate();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/customers/${customer.id}`);
  };

  const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || '-';
  const mobile = customer.mobile ? `${customer.mobile_code || ''}${customer.mobile}` : '-';

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors group">
      {/* 1. Index */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground w-12 text-center">
        {index + 1}
      </td>
      
      {/* 2. Avatar */}
      <td className="px-4 py-4 whitespace-nowrap w-[60px]">
        {customer.avatar ? (
          <img 
            src={customer.avatar} 
            alt={fullName} 
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <User className="w-5 h-5" />
          </div>
        )}
      </td>

      {/* 3. Name */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="font-medium text-foreground">{fullName}</div>
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
        <div className="text-sm text-foreground">{customer.country || '-'}</div>
      </td>

      {/* 8. City */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-foreground">{customer.city || '-'}</div>
      </td>

      {/* 9. Updated At */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="text-sm text-muted-foreground">
          {customer.updated_at?.date ? new Date(customer.updated_at.date).toLocaleDateString('ar-SA') : '-'}
        </div>
      </td>

      {/* 10. Gender */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${customer.gender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
            customer.gender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' : 
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
        >
          {customer.gender || '-'}
        </span>
      </td>

      {/* 11. Actions */}
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
