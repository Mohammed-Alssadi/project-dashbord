import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useProductEditStore } from '../store/productEditStore';

/**
 * خطاف مخصص لعزل منطق قسم الأسعار والكميات والمخزون.
 *
 * ملاحظة مهمة: جميع hooks (useState، useEffect) تُستدعى في أعلى الدالة
 * دائماً — قبل أي return مبكر — وفقاً لقواعد React Hooks.
 */
export function useProductPricingInventory() {
    const { unifiedProduct } = useProductEditStore();
    const { register, formState: { errors }, watch, setValue, control } = useFormContext();

    // ── جميع useState و useEffect أولاً (قبل أي return مشروط) ──────────────
    const [selectedLocationId, setSelectedLocationId] = useState<string>('');

    // قراءة القيم من النموذج — دائماً في الأعلى
    const isDiscountActive = watch('isDiscountActive');
    const rawStocks = watch('stocks');
    const stocks: any[] = Array.isArray(rawStocks) ? rawStocks : (unifiedProduct?.stocks || []);
    const isUnlimitedProduct = watch('isUnlimited') ?? false;

    // تهيئة الفرع النشط الأول عند تحميل المنتج
    useEffect(() => {
        if (stocks.length > 0 && !selectedLocationId) {
            setSelectedLocationId(String(stocks[0].locationId));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stocks.length, selectedLocationId]);

    // ── Early return بعد جميع hooks ─────────────────────────────────────────
    if (!unifiedProduct) {
        return {
            errors,
            register,
            control,
            isDiscountActive: false,
            stocks: [] as any[],
            isUnlimitedProduct: false,
            selectedLocationId,
            setSelectedLocationId,
            isCurrentUnlimited: false,
            currentQty: 0,
            handleQtyChange: () => { },
            handleUnlimitedToggle: () => { },
            unifiedProduct: null,
        };
    }

    // ── المنطق الفعلي ────────────────────────────────────────────────────────
    const activeLocationIdx = stocks.findIndex(
        (loc: any) => String(loc.locationId) === selectedLocationId
    );
    const activeLocation = activeLocationIdx !== -1 ? stocks[activeLocationIdx] : null;

    const isCurrentUnlimited = activeLocation
        ? Boolean(activeLocation.isUnlimited)
        : isUnlimitedProduct;

    const currentQty: number = activeLocation
        ? Number(activeLocation.quantity ?? 0)
        : Number(watch('quantity') ?? 0);

    // تعديل الكمية للمخزن النشط أو للمنتج مباشرة
    const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));

        if (activeLocation && activeLocationIdx !== -1) {
            const updatedStocks = stocks.map((st: any, idx: number) =>
                idx === activeLocationIdx ? { ...st, quantity: val } : { ...st }
            );
            setValue('stocks', updatedStocks, { shouldDirty: true });
            // تحديث الكمية الكلية للمنتج كمجموع كميات الفروع
            const totalQty = updatedStocks.reduce((sum: number, st: any) =>
                sum + (st.isUnlimited ? 0 : Number(st.quantity || 0)), 0
            );
            setValue('quantity', totalQty, { shouldDirty: true });
        } else {
            setValue('quantity', val, { shouldDirty: true });
        }
    };

    // تفعيل / إلغاء الكمية غير المحدودة
    const handleUnlimitedToggle = (checked: boolean) => {
        if (activeLocation && activeLocationIdx !== -1) {
            const updatedStocks = stocks.map((st: any, idx: number) =>
                idx === activeLocationIdx
                    ? {
                        ...st,
                        isUnlimited: checked,
                        // عند التفعيل: صفّر الكمية — عند الإلغاء: احتفظ بالكمية الحالية
                        quantity: checked ? 0 : st.quantity
                    }
                    : { ...st }
            );
            setValue('stocks', updatedStocks, { shouldDirty: true });

            // تحديث isUnlimited على مستوى المنتج إذا كان كل الفروع unlimited
            const allUnlimited = updatedStocks.every((st: any) => st.isUnlimited);
            setValue('isUnlimited', allUnlimited, { shouldDirty: true });
        } else {
            setValue('isUnlimited', checked, { shouldDirty: true });
            if (checked) {
                setValue('quantity', 0, { shouldDirty: true });
            }
        }
    };

    return {
        errors,
        register,
        control,
        isDiscountActive,
        stocks,
        isUnlimitedProduct,
        selectedLocationId,
        setSelectedLocationId,
        isCurrentUnlimited,
        currentQty,
        handleQtyChange,
        handleUnlimitedToggle,
        unifiedProduct,
    };
}
