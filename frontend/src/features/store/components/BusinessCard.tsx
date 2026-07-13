import type { StoreBusiness } from '../types/storeProfile.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Users, GitBranch, FileCheck, ExternalLink } from 'lucide-react';

interface BusinessCardProps {
  business: StoreBusiness;
}

const businessTypeMap: Record<string, string> = {
  individual:   'فردي',
  company:      'شركة',
  freelance:    'عمل حر',
  corporation:  'مؤسسة',
};

const InfoRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
};

const CertLink = ({ url, label }: { url: string | null | undefined; label: string }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 p-3 rounded-lg border border-border/40 hover:bg-muted/50 hover:border-primary/30 transition-colors text-sm font-medium"
    >
      <FileCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
    </a>
  );
};

export function BusinessCard({ business }: BusinessCardProps) {
  const hasCertificates =
    business.commercialRegisterCertificate ||
    business.maroofCertificate ||
    business.civilIdImage;

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-amber-500" />
          بيانات النشاط التجاري
        </CardTitle>
        <CardDescription>معلومات السجل التجاري والنشاط</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* المعلومات الأساسية */}
        <div className="bg-muted/20 rounded-xl border border-border/40 px-4 py-1 divide-y divide-border/30">
          <InfoRow label="نوع النشاط"  value={businessTypeMap[business.businessType || ''] || business.businessType} />
          <InfoRow label="الاسم التجاري"     value={business.commercialName} />
          <InfoRow label="الاسم الاجتماعي"   value={business.corporateName} />
          <InfoRow label="البريد الإلكتروني" value={business.email} />
          <InfoRow label="رقم الهوية المدنية" value={business.civilId} mono />
          <InfoRow label="رقم معروف"          value={business.maroofNumber} mono />
          {business.commercialRegistrationNumber && (
            <InfoRow label="رقم السجل التجاري" value={business.commercialRegistrationNumber} mono />
          )}
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {business.employeeCount != null && (
            <div className="flex flex-col items-center gap-1 p-3 bg-muted/20 rounded-xl border border-border/40">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-xl font-bold">{business.employeeCount}</span>
              <span className="text-xs text-muted-foreground">موظف</span>
            </div>
          )}
          {business.hasBranches && business.branchCount != null && (
            <div className="flex flex-col items-center gap-1 p-3 bg-muted/20 rounded-xl border border-border/40">
              <GitBranch className="h-5 w-5 text-emerald-500" />
              <span className="text-xl font-bold">{business.branchCount}</span>
              <span className="text-xs text-muted-foreground">فرع</span>
            </div>
          )}
        </div>

        {/* الوثائق والشهادات */}
        {hasCertificates && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">الوثائق والشهادات</p>
            <div className="space-y-2">
              <CertLink url={business.commercialRegisterCertificate} label="شهادة السجل التجاري" />
              <CertLink url={business.maroofCertificate}             label="شهادة معروف" />
              <CertLink url={business.civilIdImage}                  label="صورة الهوية المدنية" />
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
