import type { StoreProfile } from '../types/storeProfile.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, Globe, CircleDollarSign, BadgeCheck, Phone, Mail, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StoreInfoCardProps {
  profile: StoreProfile;
}

export function StoreInfoCard({ profile }: StoreInfoCardProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          المعلومات الأساسية
        </CardTitle>
        <CardDescription>معلومات المتجر الأساسية القادمة من المنصة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 rounded-2xl border-2 border-primary/10 shadow-sm">
            <AvatarImage src={profile.avatar ?? undefined} alt={profile.name} className="object-cover" />
            <AvatarFallback className="rounded-2xl text-2xl font-bold bg-primary/5 text-primary">
              {profile.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  {profile.name}
                  {profile.verified && (
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                  )}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">{profile.description || 'لا يوجد وصف للمتجر'}</p>
              </div>
              <Badge variant={profile.status === 'active' ? 'default' : 'secondary'} className="w-fit">
                {profile.status === 'active' ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">النطاق (الرابط)</span>
                  <a href={profile.domain} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline text-blue-600 truncate max-w-[200px]" dir="ltr">
                    {profile.domain}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CircleDollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">الباقة & العملة</span>
                  <span className="text-sm font-medium capitalize">
                    {profile.plan ? `${profile.plan} - ` : ''}{profile.currency}
                  </span>
                </div>
              </div>

              {/* هاتف المتجر — زد */}
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">رقم المتجر</span>
                    <span className="text-sm font-medium" dir="ltr">{profile.phone}</span>
                  </div>
                </div>
              )}

              {/* بريد المتجر — زد */}
              {profile.email && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">البريد الإلكتروني</span>
                    <span className="text-sm font-medium truncate max-w-[200px]">{profile.email}</span>
                  </div>
                </div>
              )}

              {/* المنطقة الزمنية — زد */}
              {profile.timezone && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">المنطقة الزمنية</span>
                    <span className="text-sm font-medium" dir="ltr">{profile.timezone}</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
