import type { SallaCustomerDetails } from '../types/customer';
import { Mail, Phone, MapPin, User, Calendar, ExternalLink, Link2, Info } from 'lucide-react';

interface Props {
  customer: SallaCustomerDetails;
}

export const SallaCustomerDetail = ({ customer }: Props) => {
  const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || '-';
  const mobile = customer.mobile ? `${customer.mobile_code || ''}${customer.mobile}` : '-';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          {customer.avatar ? (
            <img 
              src={customer.avatar} 
              alt={fullName} 
              className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-sm">
              <User className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md font-mono">
                ID: {customer.id}
              </span>
              <span className={`text-xs px-2 py-1 rounded-md capitalize font-medium
                ${customer.gender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                  customer.gender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
              >
                {customer.gender || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Contact Information */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
            <Info className="w-5 h-5 text-primary" />
            <h2>معلومات الاتصال</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4"/> الجوال</span>
              <span className="text-sm font-medium" dir="ltr">{mobile}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> البريد الإلكتروني</span>
              <span className="text-sm font-medium truncate max-w-[150px]">{customer.email || '-'}</span>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2>العنوان الجغرافي</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">الدولة</span>
              <span className="text-sm font-medium">{customer.country || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">المدينة</span>
              <span className="text-sm font-medium">{customer.city || '-'}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap">العنوان التفصيلي</span>
              <span className="text-sm font-medium text-left max-w-[150px]">{customer.location || '-'}</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2>بيانات الحساب</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">آخر تحديث</span>
              <span className="text-sm font-medium" dir="ltr">
                {customer.updated_at?.date ? new Date(customer.updated_at.date).toLocaleDateString('ar-SA') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">المجموعات</span>
              <span className="text-sm font-medium">
                {customer.groups?.length ? customer.groups.join(', ') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h2>روابط سلة</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {customer.urls?.customer ? (
              <a 
                href={customer.urls.customer} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-sm font-medium"
              >
                رابط العميل <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}
            {customer.urls?.admin ? (
              <a 
                href={customer.urls.admin} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors rounded-lg text-sm font-medium"
              >
                العميل في لوحة تحكم سلة <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}
            {!customer.urls?.customer && !customer.urls?.admin && (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
