import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useProductEditStore } from '../store/productEditStore';

/**
 * خطاف مخصص (Custom Hook) لعزل منطق قسم الأسعار والكميات والمخزون.
 * يدير هذا الخطاف:
 * 1. استخراج ومراقبة المخازن (stocks) والكمية الإجمالية للمنتج
 * 2. تبديل حالة كمية غير محدودة وإعادة تصفير الكميات عند إلغاء التفعيل
 * 3. إدارة تبديل وتحديد المستودع النشط لعرض وتحديث كمياته الفردية
 *
 * @returns كائن يحتوي على الحالات والدوال اللازمة لواجهة العرض
 */
export function useProductPricingInventory() {
  const { unifiedProduct } = useProductEditStore();
  const { register, formState: { errors }, watch, setValue, control } = useFormContext();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  if (!unifiedProduct) {
    return {
      errors,
      register,
      control,
      isDiscountActive: false,
      stocks: [],
      isUnlimitedProduct: false,
      selectedLocationId,
      setSelectedLocationId,
      isCurrentUnlimited: false,
      currentQty: '0',
      handleQtyChange: () => { },
      handleUnlimitedToggle: () => { },
    };
  }

  const isDiscountActive = watch('isDiscountActive');
  const stocks: any[] = watch('stocks') || unifiedProduct?.stocks || [];

  const isUnlimitedProduct = watch('isUnlimited');

  // تهيئة الفرع النشط الأول عند تحميل المنتج البسيط
  useEffect(() => {
    if (stocks.length > 0 && !selectedLocationId) {
      setSelectedLocationId(String(stocks[0].locationId));
    }
  }, [stocks, selectedLocationId]);

  const activeLocationIdx = stocks.findIndex(loc => String(loc.locationId) === selectedLocationId);
  const activeLocation = activeLocationIdx !== -1 ? stocks[activeLocationIdx] : null;

  const isCurrentUnlimited = activeLocation ? activeLocation.isUnlimited : isUnlimitedProduct;
  const currentQty = activeLocation ? activeLocation.quantity : (watch('quantity') ?? 0);

  // تعديل الكمية للمخزن النشط أو للمنتج مباشرة
  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? 0 : Number(e.target.value);

    if (activeLocation && activeLocationIdx !== -1) {
      const updatedStocks = [...stocks];
      updatedStocks[activeLocationIdx] = { ...updatedStocks[activeLocationIdx], quantity: val };
      setValue('stocks', updatedStocks, { shouldDirty: true });
    } else {
      setValue('quantity', val, { shouldDirty: true });
    }
  };

  // تفعيل وإلغاء الكمية غير المحدودة مع تصفير الكميات عند الإلغاء
  const handleUnlimitedToggle = (checked: boolean) => {
    if (activeLocation && activeLocationIdx !== -1) {
      const updatedStocks = [...stocks];
      updatedStocks[activeLocationIdx] = {
        ...updatedStocks[activeLocationIdx],
        isUnlimited: checked,
        quantity: checked ? updatedStocks[activeLocationIdx].quantity : 0 // عند الإلغاء يُصفَّر
      };
      setValue('stocks', updatedStocks, { shouldDirty: true });
    } else {
      setValue('isUnlimited', checked, { shouldDirty: true });
      if (checked) {
        setValue('quantity', 0, { shouldDirty: true });
      } else {
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
    unifiedProduct
  };
}
