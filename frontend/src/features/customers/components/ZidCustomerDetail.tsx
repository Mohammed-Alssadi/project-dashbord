import type { ZidCustomerDetails } from '../types/customer';
import { Mail, Phone, MapPin, User, Calendar, Activity, CheckCircle, XCircle, Info, Hash, Briefcase } from 'lucide-react';

interface Props {
  customer: ZidCustomerDetails;
}

export const ZidCustomerDetail = ({ customer }: Props) => {
  const name = customer.name || '-';
  const mobile = customer.mobile || '-';
  
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md font-mono">
                ID: {customer.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
                ${customer.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
              >
                {customer.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {customer.is_active ? 'نشط' : 'غير نشط'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
                ${customer.verified ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}
              >
                {customer.verified ? 'موثق' : 'غير موثق'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`}>
                {customer.type === 'business' ? 'أعمال' : customer.type === 'individual' ? 'أفراد' : (customer.type || '-')}
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
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">الجنس</span>
              <span className="text-sm font-medium capitalize">{customer.gender || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">الاسم المستعار</span>
              <span className="text-sm font-medium">{customer.nickname || '-'}</span>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2>الموقع الجغرافي</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">الدولة</span>
              <span className="text-sm font-medium">{customer.city?.country_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">المدينة (عربي)</span>
              <span className="text-sm font-medium">{customer.city?.ar_name || customer.city?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">المدينة (إنجليزي)</span>
              <span className="text-sm font-medium">{customer.city?.en_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">رمز الدولة</span>
              <span className="text-sm font-medium">{customer.city?.country_code || '-'}</span>
            </div>
          </div>
        </div>

        {/* Activity & Business */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2>النشاط والأعمال</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> إجمالي الطلبات</span>
              <span className="text-sm font-medium">{customer.order_counts ?? '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">نقاط العميل</span>
              <span className="text-sm font-bold text-amber-500">{customer.points ?? '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">الدفع عند الاستلام</span>
              <span className={`text-sm font-medium ${customer.is_cod_enabled ? 'text-emerald-500' : 'text-red-500'}`}>
                {customer.is_cod_enabled ? 'مفعل' : 'معطل'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">إجمالي المدفوعات</span>
              <span className="text-sm font-medium">{customer.order_total_payments || '-'}</span>
            </div>
          </div>
        </div>

        {/* Business Details (if exists) */}
        {customer.type === 'business' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2>بيانات الأعمال (Business)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block">اسم النشاط التجاري</span>
                <span className="text-sm font-medium">{customer.business_name || '-'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block flex items-center gap-1"><Hash className="w-3 h-3"/> الرقم الضريبي</span>
                <span className="text-sm font-medium" dir="ltr">{customer.tax_number || '-'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block flex items-center gap-1"><Hash className="w-3 h-3"/> السجل التجاري</span>
                <span className="text-sm font-medium" dir="ltr">{customer.commercial_registration || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Account Dates */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/50 pb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2>التواريخ الهامة</h2>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground block">تاريخ التسجيل</span>
              <span className="text-sm font-medium block" dir="ltr">
                {customer.created_at ? new Date(customer.created_at).toLocaleDateString('ar-SA') : '-'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground block">تاريخ آخر طلب</span>
              <span className="text-sm font-medium block" dir="ltr">
                {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('ar-SA') : '-'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground block">تاريخ الميلاد</span>
              <span className="text-sm font-medium block" dir="ltr">
                {customer.birth_date ? new Date(customer.birth_date).toLocaleDateString('ar-SA') : '-'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground block">آخر تحديث</span>
              <span className="text-sm font-medium block" dir="ltr">
                {customer.updated_at ? new Date(customer.updated_at).toLocaleDateString('ar-SA') : '-'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
