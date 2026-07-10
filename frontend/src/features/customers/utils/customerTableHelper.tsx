import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CircleUser, Mail, Phone, MapPin, Eye } from "lucide-react";
import { type UnifiedCustomer } from '../services/customerAdapter';

export interface CustomerColumn {
  key: string;
  header: string;
  render: (cust: UnifiedCustomer) => React.ReactNode;
  align?: 'right' | 'left';
  width?: string;
}

// Arabic labels dictionary based on platform (translation dictionary)
export const customerLabels: Record<string, Record<string, string>> = {
  salla: {
    avatar: 'الصورة',
    name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    mobile: 'رقم الجوال',
    city: 'المدينة',
    location: 'العنوان بالتفصيل',
    actions: 'العمليات'
  },
  zid: {
    avatar: 'الصورة',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    mobile: 'رقم الجوال',
    city: 'المدينة',
    points: 'نقاط الولاء',
    order_counts: 'عدد الطلبات',
    actions: 'العمليات'
  },
  default: {
    avatar: 'الصورة',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    mobile: 'رقم الجوال',
    city: 'المدينة',
    actions: 'العمليات'
  }
};

export function getCustomerColumns(platform: string, onViewDetail: (cust: UnifiedCustomer) => void): CustomerColumn[] {
  const labels = customerLabels[platform] || customerLabels.default;

  const cols: CustomerColumn[] = [
    {
      key: 'avatar',
      header: labels.avatar || '',
      width: '60px',
      align: 'right',
      render: (cust) => {
        return (
          <Avatar className="size-9 border border-border/60">
            {cust.avatar && <AvatarImage src={cust.avatar} alt={cust.name} />}
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
              <CircleUser className="size-4" />
            </AvatarFallback>
          </Avatar>
        );
      }
    },
    {
      key: 'name',
      header: labels.name,
      align: 'right',
      render: (cust) => {
        return (
          <button 
            type="button"
            onClick={() => onViewDetail(cust)}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 max-w-[200px] hover:underline text-right bg-transparent border-none p-0 cursor-pointer"
          >
            {cust.name}
          </button>
        );
      }
    },
    {
      key: 'email',
      header: labels.email,
      align: 'right',
      render: (cust) => cust.email ? (
        <span className="flex items-center justify-end gap-1.5 font-mono text-xs" dir="ltr">
          {cust.email}
          <Mail className="size-3 text-muted-foreground/60 shrink-0" />
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    {
      key: 'mobile',
      header: labels.mobile,
      align: 'right',
      render: (cust) => cust.mobile ? (
        <span className="flex items-center justify-end gap-1.5 font-mono text-xs" dir="ltr">
          {cust.mobileCode ? `(${cust.mobileCode}) ` : ''}{cust.mobile}
          <Phone className="size-3 text-muted-foreground/60 shrink-0" />
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    {
      key: 'city',
      header: labels.city,
      align: 'right',
      render: (cust) => {
        return (
          <span className="flex items-center gap-1.5 justify-start text-xs text-muted-foreground">
            <MapPin className="size-3 text-muted-foreground/60 shrink-0" />
            {cust.city || '—'}
          </span>
        );
      }
    }
  ];

  // Salla specific address/location column
  if (platform === 'salla') {
    cols.push({
      key: 'location',
      header: labels.location,
      align: 'right',
      render: (cust) => cust.location && cust.location !== 'null' ? (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={cust.location}>
          {cust.location}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    });
  }

  // Zid specific points and orders count
  if (platform === 'zid') {
    cols.push({
      key: 'points',
      header: labels.points,
      align: 'right',
      render: (cust) => cust.points !== null ? (
        <span className="text-xs text-foreground font-semibold">{cust.points} نقطة</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    });
    cols.push({
      key: 'order_counts',
      header: labels.order_counts,
      align: 'right',
      render: (cust) => cust.orderCounts !== null ? (
        <span className="text-xs text-foreground font-semibold">{cust.orderCounts} طلب</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    });
  }

  // Action column
  cols.push({
    key: 'actions',
    header: labels.actions,
    width: '80px',
    align: 'left',
    render: (cust) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          title="عرض التفاصيل"
          onClick={() => onViewDetail(cust)}
        >
          <Eye className="size-3.5" />
        </Button>
      </div>
    )
  });

  return cols;
}

