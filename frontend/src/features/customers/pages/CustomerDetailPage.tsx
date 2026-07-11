import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerStore } from '../store/customerStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { SallaCustomerDetail } from '../components/SallaCustomerDetail';
import { ZidCustomerDetail } from '../components/ZidCustomerDetail';
import { SallaCustomerDetailSkeleton } from '../components/SallaCustomerDetailSkeleton';
import { ZidCustomerDetailSkeleton } from '../components/ZidCustomerDetailSkeleton';
import type { SallaCustomerDetails, ZidCustomerDetails } from '../types/customer';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCustomer, loadingDetail, errorDetail, fetchCustomerById, clearSelectedCustomer } = useCustomerStore();
  const { user } = useAuthStore();
  const platform = (user?.platform as 'salla' | 'zid') || 'zid';

  useEffect(() => {
    if (id) {
      fetchCustomerById(platform, id);
    }
    return () => {
      clearSelectedCustomer();
    };
  }, [id, platform, fetchCustomerById, clearSelectedCustomer]);

  const handleBack = () => {
    navigate('/dashboard/customers');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <p className="text-3xl font-bold tracking-tight text-foreground">تفاصيل العميل</p>
            <p className="text-muted-foreground mt-1">
              عرض كافة المعلومات الخاصة بالعميل
            </p>
          </div>
        </div>
        <Button
          onClick={() => id && fetchCustomerById(platform, id)}
          disabled={loadingDetail}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 rounded-xl text-xs font-semibold shadow-sm shrink-0 border-border/80 hover:bg-muted/50 h-9"
        >
          {loadingDetail ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          تحديث البيانات
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loadingDetail && !selectedCustomer ? (
          platform === 'salla' ? <SallaCustomerDetailSkeleton /> : <ZidCustomerDetailSkeleton />
        ) : errorDetail ? (
          <div className="bg-destructive/10 text-destructive p-6 rounded-xl text-center border border-destructive/20">
            {errorDetail}
          </div>
        ) : !selectedCustomer ? (
          <div className="text-muted-foreground p-6 text-center bg-card rounded-xl border border-border">
            لم يتم العثور على بيانات العميل
          </div>
        ) : (
          platform === 'salla' ? (
            <SallaCustomerDetail customer={selectedCustomer as SallaCustomerDetails} />
          ) : (
            <ZidCustomerDetail customer={selectedCustomer as ZidCustomerDetails} />
          )
        )}
      </div>
    </div>
  );
};
