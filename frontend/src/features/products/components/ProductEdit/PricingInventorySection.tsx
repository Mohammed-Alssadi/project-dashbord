import { useFormContext, Controller } from "react-hook-form";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Checkbox } from "../../../../components/ui/checkbox";
import { FormFieldError } from "../../../../components/ui/FormFieldError";
import { useProductPricingInventory } from "../../hooks/useProductPricingInventory";

export function PricingInventorySection() {
  const { setValue, watch } = useFormContext();
  const {
    errors,
    register,
    control,
    isDiscountActive,
    stocks,
    selectedLocationId,
    setSelectedLocationId,
    isCurrentUnlimited,
    currentQty,
    handleQtyChange,
    handleUnlimitedToggle,
    unifiedProduct
  } = useProductPricingInventory();

  if (!unifiedProduct) return null; // حماية ضد عدم اكتمال تحميل كائن المنتج الموحد


  return (
    <AccordionItem value="pricing-inventory" className="border rounded-xl bg-card shadow-sm px-6">
      <AccordionTrigger className="hover:no-underline py-6">
        <div className="flex flex-col items-start gap-1 text-right">
          <h3 className="text-xl font-semibold tracking-tight">الكميات والمخزون والتسعير</h3>
          <p className="text-sm text-muted-foreground font-normal">إدارة تسعير المنتج، الخصومات، والمخزون</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8 pt-2 pb-4">

          {/* ── التسعير ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">التسعير</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>سعر البيع</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    {...register('price')}
                    className={errors.price ? "pl-12 border-destructive focus-visible:ring-destructive" : "pl-12"}
                  />
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">ر.س</span>
                </div>
                <FormFieldError message={errors.price?.message as string} />
              </div>
              <div className="space-y-2">
                <Label>سعر التكلفة</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    {...register('costPrice')}
                    className={errors.costPrice ? "pl-12 border-destructive focus-visible:ring-destructive" : "pl-12"}
                  />
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">ر.س</span>
                </div>
                <FormFieldError message={errors.costPrice?.message as string} />
              </div>
            </div>

            {/* ── الخصم ─────────────────────────────────────────────────── */}
            <div className="p-4 border rounded-xl bg-muted/20 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer font-medium">جدولة الخصم</Label>
                <Controller
                  name="isDiscountActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          const basePrice = watch('price') || 0;
                          setValue('salePrice', Number(basePrice) * 0.9, { shouldDirty: true });
                          const today = new Date().toISOString().split('T')[0];
                          const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                          setValue('discountStart', today, { shouldDirty: true });
                          setValue('discountEnd', tomorrow, { shouldDirty: true });
                        } else {
                          setValue('salePrice', null, { shouldDirty: true });
                          setValue('discountStart', null, { shouldDirty: true });
                          setValue('discountEnd', null, { shouldDirty: true });
                        }
                      }}
                    />
                  )}
                />
              </div>

              {isDiscountActive && (
                <div className="pt-2 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">سعر المنتج بعد الخصم</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="any"
                        {...register('salePrice')}
                        className={errors.salePrice ? "h-11 rounded-lg bg-background pl-12 border-destructive focus-visible:ring-destructive" : "h-11 rounded-lg bg-background pl-12 focus-visible:ring-primary/20"}
                      />
                      <span className="absolute left-3 top-3 text-sm text-muted-foreground">ر.س</span>
                    </div>
                    <FormFieldError message={errors.salePrice?.message as string} />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">تاريخ بدء الخصم</Label>
                        <Input
                          type="date"
                          {...register('discountStart')}
                          className={errors.discountStart ? "h-11 rounded-lg bg-background text-sm border-destructive focus-visible:ring-destructive w-full" : "h-11 rounded-lg bg-background text-sm focus-visible:ring-primary/20 w-full"}
                        />
                        <FormFieldError message={errors.discountStart?.message as string} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">تاريخ انتهاء الخصم</Label>
                        <Input
                          type="date"
                          {...register('discountEnd')}
                          className={errors.discountEnd ? "h-11 rounded-lg bg-background text-sm border-destructive focus-visible:ring-destructive w-full" : "h-11 rounded-lg bg-background text-sm focus-visible:ring-primary/20 w-full"}
                        />
                        <FormFieldError message={errors.discountEnd?.message as string} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── الكميات والمخزون ─────────────────────────────────────────── */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {stocks.length > 0 ? (
                /* إذا كانت هناك مواقع مخازن حقيقية قادمة من المنصة */
                <>
                  <div className="space-y-2 text-right">
                    <Label className="text-sm font-semibold">المخزون</Label>
                    <select
                      value={selectedLocationId || (stocks[0]?.locationId ?? '')}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      {stocks.map((st: any) => (
                        <option key={st.locationId} value={st.locationId}>
                          {st.locationName}
                        </option>
                      ))}
                    </select>

                    {/* غير محدود (أسفل المخزون) */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
                      <Checkbox
                        id="unlimited"
                        checked={isCurrentUnlimited}
                        onCheckedChange={handleUnlimitedToggle}
                      />
                      <Label htmlFor="unlimited" className="text-sm font-normal cursor-pointer select-none text-foreground">
                        غير محدود
                      </Label>
                    </div>
                  </div>

                  {/* حقل الكمية (يسار) */}
                  <div className="space-y-2 text-right">
                    <Label className="text-sm font-semibold">الكمية</Label>
                    <Input
                      type="number"
                      value={currentQty}
                      onChange={handleQtyChange}
                      disabled={isCurrentUnlimited}
                      className="h-11 rounded-lg bg-background text-right disabled:opacity-50 disabled:bg-muted/10 disabled:cursor-not-allowed font-medium"
                      placeholder="0"
                    />
                  </div>
                </>
              ) : (
                /* إذا لم توجد فروع مخازن قادمة من المنصة (منتج بسيط بدون فروع) */
                <>
                  <div className="space-y-2 text-right">
                    <Label className="text-sm font-semibold">الكمية</Label>
                    <Input
                      type="number"
                      value={currentQty}
                      onChange={handleQtyChange}
                      disabled={isCurrentUnlimited}
                      className="h-11 rounded-lg bg-background text-right disabled:opacity-50 disabled:bg-muted/10 disabled:cursor-not-allowed font-medium"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-end pb-3 text-right">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox
                        id="unlimited"
                        checked={isCurrentUnlimited}
                        onCheckedChange={handleUnlimitedToggle}
                      />
                      <Label htmlFor="unlimited" className="text-sm font-normal cursor-pointer select-none text-foreground">
                        غير محدود
                      </Label>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
