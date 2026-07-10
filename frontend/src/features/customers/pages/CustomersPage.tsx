import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerStore } from '../store/customerStore';
import { CustomersSkeleton } from '../components/CustomersSkeleton';
import { CustomersPagination } from '../components/CustomersPagination';
import { getCustomerColumns } from '../utils/customerTableHelper';
import { useAuthState } from '@/features/auth/hooks/useAuthState';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Loader2,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  CircleUser
} from "lucide-react";
import { type UnifiedCustomer } from '../services/customerAdapter';

export function CustomersPage() {
  const { customers, pagination, loading, error, goToPage, refresh } = useCustomers();
  const { user } = useAuthState();
  const [detailOpen, setDetailOpen] = useState(false);

  const selectedCustomer = useCustomerStore(s => s.selectedCustomer);
  const loadingDetail = useCustomerStore(s => s.loadingDetail);
  const errorDetail = useCustomerStore(s => s.errorDetail);
  const fetchCustomerById = useCustomerStore(s => s.fetchCustomerById);
  
  const platform = user?.platform || 'default';

  const handleViewDetail = (cust: UnifiedCustomer) => {
    setDetailOpen(true);
    fetchCustomerById(cust.id, platform === 'zid');
  };

  const columns = getCustomerColumns(platform, handleViewDetail);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-1 w-full">
        <div className="flex flex-col text-right">
          <p className="text-2xl font-bold text-foreground flex items-center gap-2">
            إدارة العملاء <Users className="size-6 text-primary shrink-0" />
          </p>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loading && customers.length === 0
              ? 'جارٍ تحميل العملاء...'
              : error
              ? 'تعذّر جلب البيانات'
              : `${pagination.totalCount.toLocaleString('ar')} عميل مسجل`
            }
          </p>
        </div>

        <Button
          onClick={refresh}
          disabled={loading}
          variant="outline"
          size="sm"
          className="rounded-xl h-9 text-xs gap-1.5 border-border/80 hover:bg-muted"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          تحديث البيانات
        </Button>
      </div>

      {/* Content Card */}
      <div className="border border-border/40 rounded-2xl bg-card shadow-sm overflow-hidden w-full">
        
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
            <AlertCircle className="size-10 text-destructive" />
            <h3 className="text-sm font-bold text-foreground">فشل جلب قائمة العملاء</h3>
            <p className="text-xs text-muted-foreground max-w-md">{error}</p>
            <Button onClick={refresh} variant="outline" size="sm" className="rounded-xl mt-2">
              إعادة المحاولة
            </Button>
          </div>
        ) : !loading && customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="size-14 rounded-2xl border border-dashed border-border/80 flex items-center justify-center text-muted-foreground/40 mb-1">
              <Users className="size-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">لا يوجد عملاء</h3>
            <p className="text-xs text-muted-foreground max-w-sm">لم يتم تسجيل أي عملاء في متجرك حتى الآن.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border/40">
                    {columns.map((col) => (
                      <TableHead
                        key={col.key}
                        className={col.align === 'left' ? 'text-left font-bold' : 'text-right font-bold'}
                        style={{ width: col.width }}
                      >
                        {col.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/20">
                  {loading && customers.length === 0 ? (
                    <CustomersSkeleton rowsCount={5} columnsCount={columns.length} />
                  ) : (
                    customers.map((cust) => (
                      <TableRow key={cust.id} className="hover:bg-muted/30 transition-colors group">
                        {columns.map((col) => (
                          <TableCell
                            key={col.key}
                            className={col.align === 'left' ? 'text-left' : 'text-right'}
                          >
                            {col.render(cust)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <CustomersPagination
              pagination={pagination}
              onPageChange={goToPage}
              loading={loading}
            />
          </>
        )}

      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => !open && setDetailOpen(false)}>
        <DialogContent className="sm:max-w-[420px] font-sans text-right rounded-2xl p-5" dir="rtl">
          <DialogHeader className="text-right border-b border-border/10 pb-2.5" dir="rtl">
            <DialogTitle className="text-base font-bold text-foreground">تفاصيل العميل</DialogTitle>
          </DialogHeader>
          
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">جاري تحميل تفاصيل العميل...</span>
            </div>
          ) : errorDetail ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-xs text-muted-foreground">{errorDetail}</p>
            </div>
          ) : selectedCustomer ? (
            <div className="flex flex-col gap-4 mt-2">
              {/* Profile Card */}
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/30">
                <Avatar className="size-11 border border-border">
                  {selectedCustomer.avatar && <AvatarImage src={selectedCustomer.avatar} />}
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    <CircleUser className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-right">
                  <h3 className="font-bold text-foreground text-sm">
                    {selectedCustomer.name}
                  </h3>
                  <span className="text-[9px] text-muted-foreground mt-0.5 max-w-max bg-muted/80 px-2 py-0.5 rounded border border-border/30">
                    {selectedCustomer.type === 'business' ? 'حساب تجاري' : 'عميل فردي'}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="flex flex-col gap-3.5 text-right text-xs">
                <div className="flex items-center gap-2.5">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground leading-none mb-0.5">البريد الإلكتروني</span>
                    <span className="text-foreground font-medium font-mono" dir="ltr">{selectedCustomer.email || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground leading-none mb-0.5">رقم الجوال</span>
                    <span className="text-foreground font-medium font-mono" dir="ltr">
                      {selectedCustomer.mobile ? `${selectedCustomer.mobileCode ? `(${selectedCustomer.mobileCode}) ` : ''}${selectedCustomer.mobile}` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground leading-none mb-0.5">المدينة والمنطقة</span>
                    <span className="text-foreground font-medium">
                      {selectedCustomer.city || '—'}
                    </span>
                  </div>
                </div>

                {selectedCustomer.location && typeof selectedCustomer.location === 'string' && selectedCustomer.location !== 'null' && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground leading-none mb-0.5">العنوان بالتفصيل</span>
                      <span className="text-foreground font-medium">{selectedCustomer.location}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Demographics */}
              <div className="border border-border/30 rounded-xl bg-card p-3.5 shadow-sm flex flex-col gap-2.5 text-xs">
                <h4 className="font-bold text-foreground text-[10px] border-b border-border/10 pb-1.5">تفاصيل إضافية</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[9px] mb-0.5">الجنس</span>
                    <span className="font-semibold text-foreground">{selectedCustomer.gender || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] mb-0.5">تاريخ الميلاد</span>
                    <span className="font-semibold text-foreground">
                      {selectedCustomer.birthday || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] mb-0.5">تاريخ التسجيل</span>
                    <span className="font-semibold text-foreground text-[10px] font-mono">
                      {selectedCustomer.createdAt || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] mb-0.5">آخر تحديث</span>
                    <span className="font-semibold text-foreground text-[10px] font-mono">
                      {selectedCustomer.updatedAt || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Zid Specific Points / Orders */}
              {platform === 'zid' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="border border-border/30 rounded-xl bg-card p-2.5 shadow-sm flex flex-col text-right">
                    <span className="text-[9px] text-muted-foreground">عدد الطلبات</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{selectedCustomer.orderCounts || 0} طلب</span>
                  </div>
                  <div className="border border-border/30 rounded-xl bg-card p-2.5 shadow-sm flex flex-col text-right">
                    <span className="text-[9px] text-muted-foreground">نقاط الولاء</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{selectedCustomer.points || 0} نقطة</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

