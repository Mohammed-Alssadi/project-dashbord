import { useEffect } from 'react';
import { useCustomerStore } from '../store/customerStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CustomersSkeleton } from '../components/CustomersSkeleton';
import { CustomersPagination } from '../components/CustomersPagination';
import { SallaCustomerRow } from '../components/SallaCustomerRow';
import { ZidCustomerRow } from '../components/ZidCustomerRow';
import type { SallaCustomerItem, ZidCustomerItem } from '../types/customer';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CustomersPage = () => {
  const { customers, pagination, loading, error, fetchCustomers } = useCustomerStore();
  const { user } = useAuthStore();
  const platform = (user?.platform as 'salla' | 'zid') || 'zid';

  useEffect(() => {
    fetchCustomers(platform);
  }, [fetchCustomers, platform]);

  const handleRefresh = () => {
    fetchCustomers(platform, pagination.currentPage);
  };

  const columnsCount = platform === 'salla' ? 10 : 12;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-foreground flex items-center gap-2">
            إدارة العملاء 📦
          </p>
          <p className="text-muted-foreground mt-1">
            {loading && customers.length === 0
              ? 'جارٍ تحميل العملاء...'
              : error
              ? 'تعذّر جلب البيانات'
              : 'إدارة ومتابعة بيانات العملاء في متجرك'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50 h-9"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            تحديث البيانات
          </Button>
        </div>
      </div>

      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right whitespace-nowrap">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold w-[60px]">الصورة</th>
                <th className="px-4 py-3 font-semibold">الاسم</th>
                <th className="px-4 py-3 font-semibold">المعرف (ID)</th>
                <th className="px-4 py-3 font-semibold">الجوال</th>
                <th className="px-4 py-3 font-semibold">البريد الإلكتروني</th>
                <th className="px-4 py-3 font-semibold">الدولة</th>
                <th className="px-4 py-3 font-semibold">المدينة</th>
                
                {platform === 'salla' ? (
                  <>
                    <th className="px-4 py-3 font-semibold">تاريخ التحديث</th>
                    <th className="px-4 py-3 font-semibold">الجنس</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold">إجمالي الطلبات</th>
                    <th className="px-4 py-3 font-semibold">النقاط</th>
                    <th className="px-4 py-3 font-semibold">حالة النشاط</th>
                    <th className="px-4 py-3 font-semibold">التوثيق</th>
                  </>
                )}
                <th className="px-4 py-3 font-semibold text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <CustomersSkeleton platform={platform} />}
              
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={columnsCount} className="py-20 text-center text-muted-foreground">
                    لا يوجد عملاء متاحين حالياً
                  </td>
                </tr>
              )}

              {!loading && customers.map((customer, index) => {
                if (platform === 'salla') {
                  return (
                    <SallaCustomerRow 
                      key={customer.id} 
                      customer={customer as SallaCustomerItem} 
                      index={index} 
                    />
                  );
                }
                return (
                  <ZidCustomerRow 
                    key={customer.id} 
                    customer={customer as ZidCustomerItem} 
                    index={index} 
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        <CustomersPagination platform={platform} />
      </div>
    </div>
  );
};
