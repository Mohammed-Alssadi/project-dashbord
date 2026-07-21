import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Warehouse } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getColorHex } from "../../../utils/functions/getColorHex";
import { useProductEditStore } from '../../../store/productEditStore';

interface VariantsTableProps {
  variantFields: any[];
  variantTypes: any[];
  variantsRows: any[];
  activeStockIdx: number | null;
  tempStocks: any[];
  setTempStocks: React.Dispatch<React.SetStateAction<any[]>>;
  openStockModal: (idx: number) => void;
  saveStockModal: () => void;
  closeStockModal: () => void;
  removeVariant: (idx: number) => void;
  platform?: 'salla' | 'zid' | null;
}

export function VariantsTable({
  variantFields,
  variantTypes,
  variantsRows,
  activeStockIdx,
  tempStocks,
  setTempStocks,
  openStockModal,
  saveStockModal,
  closeStockModal,
  removeVariant,
  platform,
}: VariantsTableProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { } = useProductEditStore();

  // تصفية الخيارات الديناميكية للتأكد من اختيار نوع الخيار واختيار قيمة واحدة على الأقل
  const activeOptionRows = variantsRows.filter(row => row.typeId && row.selectedValues.length > 0);

  // حساب إجمالي الكمية التراكمية لكافة المتغيرات
  const allVariants = watch('variants') || [];
  const totalVariantsCount = allVariants.length;
  const totalItemsQuantity = allVariants.reduce((sum: number, v: any) => sum + (v.isUnlimited ? 0 : (Number(v.quantity) || 0)), 0);
  const hasUnlimitedVariant = allVariants.some((v: any) => v.isUnlimited);

  return (
    <div className="mt-8 pt-6 border-t border-border w-full max-w-full overflow-hidden">
      <h4 className="text-lg font-bold text-foreground text-right mb-4">خيارات المنتج الفرعية (المتغيرات)</h4>
      <div className="border rounded-xl overflow-hidden bg-card shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full block">
          <table className={`w-full text-right border-collapse text-sm table-auto ${platform === 'salla' ? 'min-w-[1100px]' : 'min-w-[800px]'}`}>
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground font-semibold">
                {activeOptionRows.length === 0 ? (
                  <th className="p-4 min-w-[120px]">الخيار الفرعي</th>
                ) : (
                  activeOptionRows.map(row => {
                    const type = variantTypes.find(t => t.id === row.typeId);
                    return (
                      <th key={row.id} className="p-4 text-center min-w-[100px]">
                        {type?.label || 'خيار'}
                      </th>
                    );
                  })
                )}
                <th className="p-4 min-w-[140px]">رمز SKU</th>
                <th className="p-4 min-w-[140px]">الباركود</th>
                {platform === 'salla' && (
                  <>
                    <th className="p-4 min-w-[140px]">MPN</th>
                    <th className="p-4 min-w-[140px]">GTIN</th>
                  </>
                )}
                <th className="p-4 min-w-[100px]">السعر (ر.س)</th>
                <th className="p-4 min-w-[100px]">السعر المخفض</th>
                <th className="p-4 min-w-[100px]">سعر التكلفة</th>
                <th className="p-4 min-w-[110px]">الكمية</th>

                <th className="p-4 min-w-[90px]">الوزن (كج)</th>
                {platform !== 'salla' && (
                  <th className="p-4 w-12 text-center">إجراء</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {variantFields.map((vField, idx) => {
                const name = watch(`variants.${idx}.displayName`);
                const isUnlimited = watch(`variants.${idx}.isUnlimited`);
                const qtyVal = isUnlimited ? '∞' : (watch(`variants.${idx}.quantity`) ?? 0);

                // استخراج الأخطاء الخاصة بالسطر الحالي من مصفوفة المتغيرات
                const rowErrors = (errors.variants as any)?.[idx];
                const skuErr = rowErrors?.sku;
                const priceErr = rowErrors?.price;
                const weightErr = rowErrors?.weight;
                const salePriceErr = rowErrors?.salePrice;
                const costPriceErr = rowErrors?.costPrice;
                const barcodeErr = rowErrors?.barcode;

                return (
                  <tr key={vField.id} className="hover:bg-muted/10 transition-colors">
                    {activeOptionRows.length === 0 ? (
                      <td className="p-4 font-semibold text-foreground">
                        {name}
                      </td>
                    ) : (
                      (() => {
                        const attributes = watch(`variants.${idx}.attributes`) || [];
                        return activeOptionRows.map((row, optionRowIdx) => {
                          const type = variantTypes.find(t => t.id === row.typeId);

                          // 1. البحث بمطابقة ID الخاصية المباشر
                          let attr = attributes.find((a: any) => {
                            const attrId = String(a.id || a.attribute_id || '');
                            return attrId === String(row.typeId || '');
                          });

                          // 2. Fallback: البحث بمطابقة اسم الخيار (مثل "المقاس" أو "اللون")
                          if (!attr && type?.label) {
                            attr = attributes.find((a: any) => {
                              const aName = typeof a.name === 'object' ? (a.name?.ar || a.name?.en || '') : String(a.name || '');
                              return aName.trim().toLowerCase() === type.label.trim().toLowerCase();
                            });
                          }

                          // 3. Fallback: القراءة بالترتيب (index) في مصفوفة attributes للمتغير
                          if (!attr && attributes[optionRowIdx]) {
                            attr = attributes[optionRowIdx];
                          }

                          const rawVal = attr?.value;
                          let valueText = typeof rawVal === 'string'
                            ? rawVal
                            : rawVal && typeof rawVal === 'object'
                              ? (rawVal.ar || rawVal.en || rawVal.name || rawVal.display_value || String(rawVal))
                              : '';

                          // 4. Fallback: القراءة من displayName للمتغير (شريطة ألا يكون اسماً تجميعياً مثل "متغير 1234")
                          if ((!valueText || valueText.startsWith('متغير ')) && typeof name === 'string' && name.trim() && !name.startsWith('متغير ')) {
                            const parts = name.split(' / ');
                            if (parts[optionRowIdx]) {
                              valueText = parts[optionRowIdx].trim();
                            }
                          }

                          // 5. Fallback: القراءة المباشرة من type.values إذا توفر valueId أو مطابقة القيمة
                          const isColorOption = type?.displayType === 'color';
                          const matchedVal = type?.values?.find((v: any) =>
                            String(v.id) === String(attr?.valueId) ||
                            (valueText && v.label.trim().toLowerCase() === valueText.trim().toLowerCase())
                          );

                          if ((!valueText || valueText.startsWith('متغير ')) && matchedVal?.label) {
                            valueText = matchedVal.label;
                          }

                          // تنظيف النهائي: إذا كانت القيمة لا تزال "متغير 1234" نمنع عرضها كاسم خاصية
                          if (valueText.startsWith('متغير ')) {
                            valueText = '';
                          }

                          const colorHex = matchedVal?.hex || (isColorOption ? getColorHex(valueText) : null);

                          return (
                            <td key={row.id} className="p-4 text-center font-semibold text-foreground">
                              <div className="flex items-center justify-center gap-1.5">
                                {colorHex && (
                                  <span
                                    className="h-4.5 w-4.5 rounded-full shrink-0 border border-border shadow-sm"
                                    style={{ backgroundColor: colorHex }}
                                    title={valueText}
                                  />
                                )}
                                <span>{valueText || '—'}</span>
                              </div>
                            </td>
                          );
                        });
                      })()
                    )}
                    <td className="p-4">
                      <Input
                        {...register(`variants.${idx}.sku`)}
                        className={`h-9 text-right ${skuErr ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        placeholder="SKU"
                      />
                      {skuErr && <span className="text-[10px] text-destructive block mt-1 font-semibold">{skuErr.message}</span>}
                    </td>
                    <td className="p-4">
                      <Input
                        {...register(`variants.${idx}.barcode`)}
                        className={`h-9 text-right ${barcodeErr ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        placeholder="الباركود"
                      />
                      {barcodeErr && <span className="text-[10px] text-destructive block mt-1 font-semibold">{barcodeErr.message}</span>}
                    </td>
                    {platform === 'salla' && (
                      <>
                        <td className="p-4">
                          <Input
                            {...register(`variants.${idx}.mpn`)}
                            className={`h-9 text-right ${rowErrors?.mpn ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            placeholder="MPN"
                          />
                          {rowErrors?.mpn && <span className="text-[10px] text-destructive block mt-1 font-semibold">{rowErrors.mpn.message}</span>}
                        </td>
                        <td className="p-4">
                          <Input
                            {...register(`variants.${idx}.gtin`)}
                            className={`h-9 text-right ${rowErrors?.gtin ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            placeholder="GTIN"
                          />
                          {rowErrors?.gtin && <span className="text-[10px] text-destructive block mt-1 font-semibold">{rowErrors.gtin.message}</span>}
                        </td>
                      </>
                    )}
                    <td className="p-4">
                      <Input
                        type="number"
                        step="any"
                        {...register(`variants.${idx}.price`, { valueAsNumber: true })}
                        className={`h-9 text-right w-24 ${priceErr ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        placeholder="0"
                      />
                      {priceErr && <span className="text-[10px] text-destructive block mt-1 font-semibold">{priceErr.message}</span>}
                    </td>
                    <td className="p-4">
                      <Input
                        type="number"
                        step="any"
                        {...register(`variants.${idx}.salePrice`, { valueAsNumber: true })}
                        className={`h-9 text-right w-24 ${salePriceErr ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        placeholder="لا يوجد"
                      />
                      {salePriceErr && <span className="text-[10px] text-destructive block mt-1 font-semibold">{salePriceErr.message}</span>}
                    </td>
                    <td className="p-4">
                      <Input
                        type="number"
                        step="any"
                        {...register(`variants.${idx}.costPrice`, { valueAsNumber: true })}
                        className={`h-9 text-right w-24 ${costPriceErr ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        placeholder="لا يوجد"
                      />
                      {costPriceErr && <span className="text-[10px] text-destructive block mt-1 font-semibold">{costPriceErr.message}</span>}
                    </td>
                    <td className="p-4 text-center">
                      {platform === 'salla' ? (
                        /* لسلة: إدخال مباشر للكمية + خيار غير محدود بجانبه */
                        <div className="flex items-center gap-2 justify-center min-w-[170px]">
                          <Input
                            type="number"
                            step="any"
                            disabled={isUnlimited}
                            {...register(`variants.${idx}.quantity`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                // تحديث كمية الفرع الأول ليتزامن مع المدخل المباشر (إذا كان فرع واحد)
                                const varStocks = watch(`variants.${idx}.stocks`) || [];
                                if (varStocks.length === 1) {
                                  const newVal = Math.max(0, Number(e.target.value) || 0);
                                  setValue(`variants.${idx}.stocks.0.quantity`, newVal, { shouldDirty: true });
                                }
                              }
                            })}
                            className={`h-9 text-center w-20 shrink-0 ${rowErrors?.quantity ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            placeholder="0"
                          />
                          <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                            <input
                              type="checkbox"
                              checked={isUnlimited}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setValue(`variants.${idx}.isUnlimited`, checked, { shouldDirty: true });
                                // مزامنة جميع فروع الصنف مع حالة unlimited
                                const varStocks = watch(`variants.${idx}.stocks`) || [];
                                const updatedStocks = varStocks.map((st: any) => ({
                                  ...st,
                                  isUnlimited: checked,
                                  quantity: checked ? 0 : st.quantity
                                }));
                                setValue(`variants.${idx}.stocks`, updatedStocks, { shouldDirty: true });
                                if (checked) {
                                  setValue(`variants.${idx}.quantity`, 0, { shouldDirty: true });
                                }
                              }}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-primary"
                            />
                            <span>غير محدود</span>
                          </label>
                          {/* زر الفروع — يظهر للمتاجر ذات فروع متعددة */}
                          {(watch(`variants.${idx}.stocks`) || []).length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 text-primary border-primary/25 hover:bg-primary/5 transition-all shrink-0"
                              onClick={() => openStockModal(idx)}
                              title="تعديل كميات الفروع"
                            >
                              <Warehouse className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        /* لزد: عرض الرمز والأيقونة المنبثقة للمستودعات */
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-sm font-semibold px-2.5 py-1 rounded-md ${isUnlimited ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-muted text-foreground'}`}>
                            {qtyVal}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-primary border-primary/25 hover:bg-primary/5 transition-all"
                            onClick={() => openStockModal(idx)}
                            title="تفاصيل المخزون للفروع والمستودعات"
                          >
                            <Warehouse className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <Input
                        type="number"
                        step="any"
                        {...register(`variants.${idx}.weight`, { valueAsNumber: true })}
                        className={`h-9 text-right w-20 ${weightErr ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        placeholder="0"
                      />
                      {weightErr && <span className="text-[10px] text-destructive block mt-1 font-semibold">{weightErr.message}</span>}
                    </td>
                    {platform !== 'salla' && (
                      <td className="p-4 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(idx)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
                          title="حذف المتغير"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* شريط ملخص إحصائيات المتغيرات */}
      {totalVariantsCount > 0 && (
        <div className="mt-3 flex items-center justify-between p-3.5 rounded-xl bg-muted/20 border border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>عدد المتغيرات الكلي: <strong className="text-foreground font-bold">{totalVariantsCount}</strong></span>
            <span className="h-3.5 w-px bg-border inline-block" />
            <span>إجمالي الكمية التراكمية: <strong className="text-primary font-bold text-sm">{totalItemsQuantity}</strong> قطعة {hasUnlimitedVariant && <span className="text-blue-600 font-semibold">(تتضمن عناصر غير محدودة)</span>}</span>
          </div>
          <span className="text-[11px] opacity-80">تُحسب الكمية التراكمية تلقائياً في سلة من جمع أصناف المنتج</span>
        </div>
      )}

      {/* ── Dialog: إدارة المخزون للفروع والمستودعات ── */}
      <Dialog open={activeStockIdx !== null} onOpenChange={(open) => { if (!open) closeStockModal(); }}>
        <DialogContent className="rtl max-w-xl p-6 rounded-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-md font-semibold text-right flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              إدارة مخزون المتغير: {activeStockIdx !== null ? watch(`variants.${activeStockIdx}.displayName`) : ''}
            </DialogTitle>
            <DialogDescription className="text-right text-muted-foreground text-sm mt-1">
              اداره مخزن المتغيرات
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {tempStocks.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">لا توجد مستودعات أو فروع مسجلة لهذا المتجر.</p>
            ) : (
              tempStocks.map((st, sIdx) => (
                <div key={st.locationId} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">{st.locationName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id={`unlimited-${st.locationId}`}
                        checked={st.isUnlimited}
                        onChange={(e) => {
                          const updated = tempStocks.map((s: any) => ({ ...s }));
                          updated[sIdx].isUnlimited = e.target.checked;
                          // عند تفعيل unlimited: صفّر الكمية (ليس 999999)
                          // عند الإلغاء: احتفظ بالكمية الحالية (0 إذا كانت صفراً)
                          if (e.target.checked) {
                            updated[sIdx].quantity = 0;
                          }
                          setTempStocks(updated);
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <label htmlFor={`unlimited-${st.locationId}`} className="text-xs text-muted-foreground cursor-pointer select-none">غير محدود</label>
                    </div>

                    <Input
                      type="number"
                      disabled={st.isUnlimited}
                      value={st.isUnlimited ? '' : st.quantity}
                      onChange={(e) => {
                        // إصلاح #18: Deep copy للحفاظ على سلامة بيانات الإلغاء
                        const updated = tempStocks.map(st => ({ ...st }));
                        updated[sIdx].quantity = Number(e.target.value);
                        setTempStocks(updated);
                      }}
                      placeholder="الكمية"
                      className="h-9 w-24 text-center"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="border-nine pt-3 flex justify-end gap-2 bg-card">
            <Button
              type="button"
              variant="outline"
              onClick={closeStockModal}
              className="px-4"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={saveStockModal}
              className="px-6 py-3"
            >
              تطبيق التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
