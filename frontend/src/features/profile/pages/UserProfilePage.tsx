import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Calendar, Loader2, 
  ShieldCheck, Globe, Hash, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMerchantProfileStore } from '@/features/dashboard/store/merchantProfileStore';

export function UserProfilePage() {
  const user = useAuthStore(state => state.user);
  const merchantProfile = useMerchantProfileStore(state => state.profile);
  const loadingMerchant = useMerchantProfileStore(state => state.loading);

  // محاولة استخراج كافة الحقول الممكنة من المنصتين (سلة تغلف البيانات داخل data)
  const sallaData = merchantProfile?.data;
  const sallaMerchant = sallaData?.merchant;
  const zidUser = merchantProfile?.user;
  
  const rawName = sallaData?.name || zidUser?.name || sallaMerchant?.name || user?.name || 'مستخدم غير معروف';
  const rawEmail = sallaData?.email || zidUser?.email || sallaMerchant?.username || user?.email || 'لا يوجد بريد';
  const rawAvatar = sallaMerchant?.avatar || merchantProfile?.avatar || user?.avatarUrl || '';
  const rawMobile = sallaData?.mobile || zidUser?.mobile || 'لا يوجد رقم';
  
  // حقول إضافية
  const isEmailVerified = zidUser?.is_email_verified ?? true;
  const role = sallaData?.role || merchantProfile?.role || 'مدير متجر';
  const gender = zidUser?.gender === 'm' ? 'ذكر' : zidUser?.gender === 'f' ? 'أنثى' : 'غير محدد';
  const language = zidUser?.language_code === 'ar' ? 'العربية' : zidUser?.language_code === 'en' ? 'English' : 'الافتراضية';
  const birthDate = zidUser?.user_profile_data?.birth_date || 'غير محدد';
  const createdAt = sallaData?.created_at || sallaMerchant?.created_at || 'غير متوفر';
  const accountId = sallaData?.id || zidUser?.id || sallaMerchant?.id || 'غير متوفر';
  const accountUuid = zidUser?.uuid || 'غير متوفر';

  return (
    <div className="flex flex-col gap-4 w-full animate-fade-in font-sans  mx-auto" dir="rtl">
      <div>
        <p className="text-3xl font-bold text-foreground tracking-tight">الملف الشخصي</p>
        <p className="text-sm text-muted-foreground mt-2">
          إدارة واستعراض تفاصيل حسابك المرتبط بالمنصة بكل احترافية.
        </p>
      </div>

      {loadingMerchant ? (
        <Card className="border-border/60 shadow-sm flex items-center justify-center p-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">جاري جلب البيانات من المنصة...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* العمود الأيمن: البطاقة التعريفية الرئيسية */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="border-border/60 shadow-md overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
              <CardContent className="px-6 pb-6 pt-16 relative flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 rounded-full border-4 border-background shadow-xl mb-4">
                  <AvatarImage src={rawAvatar} alt={rawName} className="object-cover" />
                  <AvatarFallback className="rounded-full text-4xl font-bold bg-primary/10 text-primary">
                    {rawName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-foreground mb-1">{rawName}</h2>
                <Badge variant="secondary" className="mb-4 font-medium px-3 py-1 bg-primary/10 text-primary">
                  {role}
                </Badge>
                
                <div className="flex flex-col gap-3 w-full mt-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    <Mail className="size-4 text-primary/70 shrink-0" />
                    <span className="truncate">{rawEmail}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    <Phone className="size-4 text-primary/70 shrink-0" />
                    <span dir="ltr">{rawMobile}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* حالة الحساب */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  حالة الحساب
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">توثيق البريد الإلكتروني</span>
                  {isEmailVerified ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1 pr-1.5">
                      <CheckCircle2 className="size-3.5" /> موثق
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1 pr-1.5">
                      <XCircle className="size-3.5" /> غير موثق
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">المنصة المتصلة</span>
                  <Badge variant="outline" className="capitalize">{user?.platform}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* العمود الأيسر: التفاصيل الإضافية */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <Card className="border-border/60 shadow-sm h-full">
              <CardHeader className="border-b border-border/40 pb-4 mb-4 bg-muted/30">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="size-5 text-primary" />
                  المعلومات الشخصية والتفاصيل
                </CardTitle>
                <CardDescription>
                  كافة التفاصيل المتقدمة الخاصة بك والمجلوبة من المنصة بشكل مباشر.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2">
                  
                  {/* رقم الحساب */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <Hash className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">معرف الحساب (ID)</p>
                      <p className="text-sm text-muted-foreground mt-0.5 font-mono">{accountId}</p>
                    </div>
                  </div>

                  {/* UUID */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <Hash className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">المعرف الفريد (UUID)</p>
                      <p className="text-sm text-muted-foreground mt-0.5 font-mono text-xs break-all">{accountUuid}</p>
                    </div>
                  </div>

                  {/* الجنس */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <User className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">الجنس</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{gender}</p>
                    </div>
                  </div>

                  {/* تاريخ الميلاد */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">تاريخ الميلاد</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{birthDate}</p>
                    </div>
                  </div>

                  {/* اللغة */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <Globe className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">لغة الحساب</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{language}</p>
                    </div>
                  </div>

                  {/* تاريخ التسجيل */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">تاريخ الإنشاء</p>
                      <p className="text-sm text-muted-foreground mt-0.5" dir="ltr">{createdAt}</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
