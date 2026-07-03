import type { StoreLicenses } from '../types/storeProfile.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Receipt, ShieldCheck } from 'lucide-react';

interface StoreLicensesCardProps {
  licenses: StoreLicenses;
}

export function StoreLicensesCard({ licenses }: StoreLicensesCardProps) {
  return (
    <Card className="shadow-sm border-border/60 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          التراخيص والتوثيق
        </CardTitle>
        <CardDescription>البيانات القانونية والضريبية الخاصة بالمتجر</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">الرقم الضريبي</span>
            </div>
            <span className="font-mono text-sm">{licenses.taxNumber || 'غير متوفر'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">السجل التجاري</span>
            </div>
            <span className="font-mono text-sm">{licenses.commercialNumber || 'غير متوفر'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">وثيقة العمل الحر</span>
            </div>
            <span className="font-mono text-sm">{licenses.freelanceNumber || 'غير متوفر'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
