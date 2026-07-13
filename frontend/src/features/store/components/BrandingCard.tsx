import type { StoreBranding } from '../types/storeProfile.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Palette, Image as ImageIcon, Monitor, Brush } from 'lucide-react';
import { useState } from 'react';

interface BrandingCardProps {
  branding: StoreBranding;
}

const ColorSwatch = ({ color, label }: { color: string | null | undefined; label: string }) => {
  if (!color) return null;
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-7 w-7 rounded-md border border-border/50 shadow-sm flex-shrink-0"
        style={{ backgroundColor: color }}
        title={color}
      />
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-xs font-mono font-medium">{color}</span>
      </div>
    </div>
  );
};

export function BrandingCard({ branding }: BrandingCardProps) {
  const [activeThemeImg, setActiveThemeImg] = useState(0);
  const images = branding.theme?.images || [];

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-violet-500" />
          الهوية البصرية
        </CardTitle>
        <CardDescription>تصميم المتجر، الألوان والشعار</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* الأيقونة والشعار */}
        {(branding.icon || branding.logo) && (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/40">
            {branding.icon && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">الأيقونة</span>
                <img
                  src={branding.icon}
                  alt="Store Icon"
                  className="h-14 w-14 rounded-xl object-cover border border-border/40 shadow-sm"
                />
              </div>
            )}
            {branding.logo && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">الشعار</span>
                <img
                  src={branding.logo}
                  alt="Store Logo"
                  className="h-14 w-auto max-w-[160px] rounded-xl object-contain border border-border/40 shadow-sm bg-white p-1"
                />
              </div>
            )}
            {branding.theme && (
              <div className="flex flex-col gap-0.5 mr-auto">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">الثيم الحالي</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-primary" />
                  {branding.theme.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* معرض صور الثيم */}
        {images.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              معرض لقطات الثيم
            </div>
            {/* الصورة الرئيسية */}
            <div className="relative rounded-xl overflow-hidden border border-border/40 bg-muted/20 aspect-video">
              <img
                src={images[activeThemeImg]}
                alt={`Theme screenshot ${activeThemeImg + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            {/* الصور المصغرة */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-1.5">
                {images.slice(0, 9).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveThemeImg(idx)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
                      activeThemeImg === idx
                        ? 'border-primary shadow-md scale-105'
                        : 'border-border/40 hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ألوان الأزرار */}
        {branding.colors && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Brush className="h-4 w-4 text-muted-foreground" />
              ألوان الأزرار
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/20 rounded-xl border border-border/40">
              <ColorSwatch color={branding.colors.btnDefaultBackground} label="خلفية الزر الافتراضي" />
              <ColorSwatch color={branding.colors.btnDefaultText}       label="نص الزر الافتراضي" />
              <ColorSwatch color={branding.colors.btnDefaultBorder}     label="حدود الزر الافتراضي" />
              <ColorSwatch color={branding.colors.btnHoverBackground}   label="خلفية الزر عند التحويم" />
              <ColorSwatch color={branding.colors.btnPressedBackground} label="خلفية الزر عند الضغط" />
              <ColorSwatch color={branding.colors.btnPressedText}       label="نص الزر عند الضغط" />
              <ColorSwatch color={branding.colors.btnPressedBorder}     label="حدود الزر عند الضغط" />
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
