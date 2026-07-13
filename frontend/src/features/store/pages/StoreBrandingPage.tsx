import { useStoreProfileStore } from '../store/storeProfileStore';
import { LocalErrorBoundary } from '@/components/LocalErrorBoundary';
import { RefreshCw, Palette, Monitor, Image, Brush, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { StoreBranding } from '../types/storeProfile.types';
import { useState } from 'react';

// ─── Skeleton مطابق للصفحة ─────────────────────────────────────────────────
function BrandingPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* الهوية - شعار وأيقونة */}
      <section className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card flex flex-col items-center gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-20 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      {/* الثيم */}
      <section className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-video rounded-lg" />)}
          </div>
        </div>
      </section>

      {/* الألوان */}
      <section className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-card">
              <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-3.5 w-16 font-mono" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── قسم الهوية (الأيقونة، الشعار، الغلاف) ────────────────────────────────
function IdentitySection({ branding }: { branding: StoreBranding }) {
  const items = [
    { label: 'الأيقونة', url: branding.icon, type: 'icon' },
    { label: 'الشعار', url: branding.logo, type: 'logo' },
    { label: 'الغلاف', url: branding.cover, type: 'cover' },
  ].filter(i => i.url);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Image className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">الشعار والأيقونة</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map(item => (
          <div key={item.type} className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
            <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            {item.type === 'icon' && (
              <img src={item.url!} alt={item.label} className="h-20 w-20 rounded-2xl object-cover shadow-sm border border-border/30" />
            )}
            {item.type === 'logo' && (
              <div className="h-30 w-full flex items-center justify-center rounded-md border-none p-1">
                <img src={item.url!} alt={item.label} className="max-h-full max-w-full object-contain" />
              </div>
            )}
            {item.type === 'cover' && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border/30">
                <img src={item.url!} alt={item.label} className="w-full h-full object-cover" />
              </div>
            )}
            <a href={item.url!} target="_blank" rel="noreferrer"
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background/80 rounded-md border border-border/50">
              <ZoomIn className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── قسم الثيم ──────────────────────────────────────────────────────────────
function ThemeSection({ branding }: { branding: StoreBranding }) {
  const [active, setActive] = useState(0);
  const theme = branding.theme;
  if (!theme) return null;

  const images = theme.images ?? [];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Monitor className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">الثيم</h2>
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        {/* رأس الثيم */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{theme.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">الثيم المفعّل حالياً</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-medium border border-emerald-500/20">
            مفعّل
          </span>
        </div>

        {/* الصورة الرئيسية */}
        {images.length > 0 && (
          <div className="space-y-3">
            {/* الحاوية بنسبة 16:9 — تضمن ظهور الصورة كاملة بلا فراغات */}
            <div className="relative w-full aspect-video  overflow-hidden  shadow-sm py-4 ">
              <img
                key={active}
                src={images[active]}
                alt={`ثيم ${active + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300 p-1"
              />
              {/* نقاط التنقل — داخل الحاوية فوق الصورة */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full">
                  {images.slice(0, 9).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`h-1.5 rounded-full transition-all duration-200 ${i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* شريط الصور المصغرة — منفصل تماماً خارج الحاوية */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 mt-5">
                {images.slice(0, 9).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 ${i === active
                        ? 'border-primary shadow-sm ring-1 ring-primary/40 opacity-100'
                        : 'border-border/40 opacity-50 hover:opacity-90 hover:border-primary/50'
                      }`}
                  >
                    <img src={img} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}


      </div>
    </section>
  );
}

// ─── قسم الألوان ─────────────────────────────────────────────────────────────
const colorLabels: Record<string, string> = {
  btnDefaultBackground: 'خلفية الزر الافتراضي',
  btnDefaultText: 'نص الزر الافتراضي',
  btnDefaultBorder: 'حدود الزر الافتراضي',
  btnHoverBackground: 'خلفية الزر عند التحويم',
  btnPressedBackground: 'خلفية الزر عند الضغط',
  btnPressedText: 'نص الزر عند الضغط',
  btnPressedBorder: 'حدود الزر عند الضغط',
};

function ColorsSection({ branding }: { branding: StoreBranding }) {
  const colors = branding.colors;
  if (!colors) return null;

  const entries = Object.entries(colors).filter(([, v]) => v) as [string, string][];
  if (entries.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Brush className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ألوان الأزرار</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/20 transition-colors"
          >
            <div
              className="h-9 w-9 rounded-lg border border-border/40 shadow-sm flex-shrink-0"
              style={{ backgroundColor: value }}
              title={value}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-muted-foreground truncate">{colorLabels[key] || key}</span>
              <span className="text-sm font-mono font-medium">{value}</span>
            </div>
            {/* معاينة مصغرة */}
            <div
              className="hidden sm:flex h-6 w-14 rounded text-[10px] font-bold items-center justify-center flex-shrink-0"
              style={{ backgroundColor: value, color: '#fff', textShadow: '0 0 3px rgba(0,0,0,.4)' }}
            >
              زر
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────
export function StoreBrandingPage() {
  const storeProfile = useStoreProfileStore(state => state.profile);
  const loading = useStoreProfileStore(state => state.loading);
  const isRefreshing = useStoreProfileStore(state => state.isRefreshing);
  const refetch = useStoreProfileStore(state => state.fetchProfile);

  const showSkeleton = (loading && !storeProfile) || isRefreshing;
  const branding = storeProfile?.branding;

  return (
    <div className="px-6 py-2 space-y-8 w-full" dir="rtl">

      {/* هيدر الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-foreground">الهوية البصرية</p>
          <p className="text-sm text-muted-foreground">
            ثيم المتجر، الألوان، الشعار والأيقونة المستخدمة في الواجهة
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={() => refetch(true)}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {showSkeleton ? (
        <BrandingPageSkeleton />
      ) : branding ? (
        <LocalErrorBoundary>
          <div className="space-y-8">
            <IdentitySection branding={branding} />
            <ThemeSection branding={branding} />
            <ColorsSection branding={branding} />
          </div>
        </LocalErrorBoundary>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Palette className="h-12 w-12 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">لا توجد بيانات هوية بصرية</p>
          <p className="text-sm text-muted-foreground/60">تأكد من أن المتجر مرتبط بمنصة زد</p>
        </div>
      )}
    </div>
  );
}
