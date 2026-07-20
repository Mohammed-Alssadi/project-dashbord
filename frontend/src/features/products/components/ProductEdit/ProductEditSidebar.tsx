import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Separator } from "../../../../components/ui/separator";
import { useFormContext, Controller } from "react-hook-form";
import { useProductEditStore } from "../../store/productEditStore";

export function ProductEditSidebar() {
  const { product, unifiedProduct } = useProductEditStore();
  const { control, watch } = useFormContext();

  if (!unifiedProduct) return null;

  const isPublished = watch('isPublished');

  // ── تحذيرات مخصصة ومعلومات إضافية ──
  const isLinkOnly = product?.status === 'hidden';

  return (
    <div className="space-y-6 text-right">

      {/* ── ظهور المنتج ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ظهور المنتج</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">
                {isPublished ? 'منشور' : 'مسودة'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isPublished ? 'المنتج ظاهر للعملاء' : 'المنتج غير ظاهر للعملاء'}
              </p>
            </div>
            <Controller
              name="isPublished"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {isLinkOnly && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <span>⚠️ مرئي عبر الرابط المباشر فقط</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── خصائص المنتج ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">خصائص المنتج</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>يتطلب الشحن</Label>
              <p className="text-xs text-muted-foreground">هل يحتاج هذا المنتج لشحن؟</p>
            </div>
            <Controller
              name="requiresShipping"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>خاضع للضريبة</Label>
              <p className="text-xs text-muted-foreground">تطبيق الضريبة على هذا المنتج</p>
            </div>
            <Controller
              name="isTaxable"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* ── معلومات إضافية من API ─────────────────────────────────── */}
          {product && (
            <>
              <Separator />
              <div className="space-y-2">
                {/* هيكل المنتج — زد */}
                {product.structure && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">النوع</span>
                    <span className="font-medium capitalize">{product.structure === 'parent' ? 'رئيسي' : 'بسيط'}</span>
                  </div>
                )}

                {/* الشارة الحالية — زد */}
                {product.badge?.body?.ar && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الشارة</span>
                    <span className="font-medium text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {product.badge.body.ar}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
