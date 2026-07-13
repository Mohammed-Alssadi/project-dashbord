import type { StoreLocalization } from '../types/storeProfile.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, DollarSign, Languages } from 'lucide-react';

interface LocalizationCardProps {
  localization: StoreLocalization;
}

export function LocalizationCard({ localization }: LocalizationCardProps) {
  const { language, languages, currency, currencies } = localization;

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          اللغة والعملة
        </CardTitle>
        <CardDescription>إعدادات اللغة والعملات المتاحة في المتجر</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* اللغة الافتراضية */}
        {language && (
          <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Languages className="h-4 w-4 text-muted-foreground" />
              اللغة الافتراضية
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-base">{language.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded uppercase">{language.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  language.direction === 'rtl'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-blue-500/10 text-blue-600'
                }`}>
                  {language.direction === 'rtl' ? 'يمين ← يسار' : 'Left → Right'}
                </span>
              </div>
            </div>

            {/* اللغات الأخرى المتاحة */}
            {languages.length > 1 && (
              <div className="pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">اللغات المتاحة:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {languages.map(l => (
                    <span
                      key={l.code}
                      className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                        l.code === language.code
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-muted/50 text-muted-foreground border-border/50'
                      }`}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* العملة الافتراضية */}
        {currency && (
          <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              العملة الافتراضية
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currency.flag && (
                  <img src={currency.flag} alt={currency.countryName || ''} className="h-6 w-8 object-cover rounded shadow-sm" />
                )}
                <div>
                  <p className="font-medium text-sm">{currency.name}</p>
                  {currency.countryName && (
                    <p className="text-xs text-muted-foreground">{currency.countryName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-base">{currency.symbol}</span>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{currency.code}</span>
              </div>
            </div>
          </div>
        )}

        {/* العملات الأخرى المتاحة */}
        {currencies.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">العملات المتاحة ({currencies.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {currencies.map((c, idx) => (
                <div
                  key={`${c.code}-${idx}`}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-sm transition-colors ${
                    c.code === currency?.code
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border/40 bg-muted/10 hover:bg-muted/30'
                  }`}
                >
                  {c.flag ? (
                    <img src={c.flag} alt={c.countryName || ''} className="h-4 w-6 object-cover rounded-sm shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="h-4 w-6 bg-muted rounded-sm flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs truncate block">{c.name}</span>
                    {c.countryName && <span className="text-[10px] text-muted-foreground truncate block">{c.countryName}</span>}
                  </div>
                  <span className="text-xs font-bold text-primary flex-shrink-0">{c.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
