import { useState, useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useProductEditStore } from '../store/productEditStore';
import { productEditService } from '../services/productEditService';
import { toast } from 'sonner';
import {
  mapStoreAttributesToVariantTypes,
  type VariantType
} from '../utils/functions/mapStoreAttributesToVariantTypes';
import {
  mapVariantsToRows,
  type VariantRow
} from '../utils/functions/mapVariantsToRows';

/**
 * خطاف مخصص (Custom Hook) لعزل المنطق البرمجي الضخم لقسم متغيرات المنتج (Variants).
 * يدير هذا الخطاف:
 * 1. مزامنة أسطر خصائص المتغيرات (Variant rows)
 * 2. إضافة/حذف صفوف الخصائص واختيار قيمها المتعددة
 * 3. فتح حوارات تعديل كميات فروع المتغيرات ومزامنتها
 * 4. إنشاء خيارات جديدة (Options) وقيم خيارات جديدة (Option values)
 * 5. توليد كافة توليفات المتغيرات المحتملة (Combinations) تلقائياً وضخها بالنموذج
 *
 * @returns الحالات والدوال اللازمة لإدارة المتغيرات في واجهة الرسوميات
 */
export function useProductVariants() {
  const { attributes: storeAttributes, isLoading, unifiedProduct, product } = useProductEditStore();
  const { register, control, setValue, watch } = useFormContext();
  const { fields: variantFields, append: appendVariant, remove: removeVariant, replace: replaceVariants } = useFieldArray({
    control,
    name: 'variants'
  });

  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [variantsRows, setVariantsRows] = useState<VariantRow[]>([]);
  const [activeStockIdx, setActiveStockIdx] = useState<number | null>(null);
  const [tempStocks, setTempStocks] = useState<any[]>([]);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  const hasInitializedRef = useRef(false);

  const platform = unifiedProduct?.platform ?? null;

  useEffect(() => {
    hasInitializedRef.current = false;
  }, [unifiedProduct?.id]);

  // مزامنة أسطر الواجهة الخاصة بالخيارات
  useEffect(() => {
    if (!isLoading && Array.isArray(storeAttributes) && storeAttributes.length > 0 && !hasInitializedRef.current && unifiedProduct) {
      const types = mapStoreAttributesToVariantTypes(storeAttributes);
      setVariantTypes(types);

      const currentProductOptions = platform === 'salla'
        ? (product?.options || [])
        : storeAttributes;

      const rows = mapVariantsToRows(
        watch('variants') || [],
        currentProductOptions,
        types,
        platform
      );
      setVariantsRows(rows);
      hasInitializedRef.current = true;
      setShowConfirmButton(false);
    }
  }, [isLoading, storeAttributes, unifiedProduct, product, platform, watch]);

  // ── Dialog: إنشاء خيار جديد ──────────────────────────────────────────────
  const [isNewOptionModalOpen, setIsNewOptionModalOpen] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionType, setNewOptionType] = useState<string>('color');
  const [newOptionValues, setNewOptionValues] = useState<{ id: string; label: string; color?: string }[]>([
    { id: `val-${Date.now()}`, label: '', color: '#000000' },
  ]);
  const [collapsedValueIds, setCollapsedValueIds] = useState<string[]>([]);

  const toggleCollapseValue = (id: string) => {
    setCollapsedValueIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // ── Dialog: إنشاء قيمة جديدة ──────────────────────────────────────────────
  const [isNewValueModalOpen, setIsNewValueModalOpen] = useState(false);
  const [newValueName, setNewValueName] = useState('');
  const [activeTypeIdForNewValue, setActiveTypeIdForNewValue] = useState<string | null>(null);

  // ── Handlers لصفوف الخصائص ────────────────────────────────────────────────
  const handleAddRow = () => {
    setVariantsRows(prev => [...prev, { id: `row-${Date.now()}`, typeId: '', selectedValues: [] }]);
    setShowConfirmButton(true);
  };

  const handleRemoveRow = async (id: string) => {
    const isRealOptionId = id && !String(id).startsWith('row-');
    
    if (isRealOptionId && platform === 'salla' && unifiedProduct?.id) {
      const confirmDelete = window.confirm('هل أنت متأكد من رغبتك في حذف هذا الخيار وكل قيمه ومتغيراته نهائياً من المتجر؟');
      if (!confirmDelete) return;

      try {
        toast.loading('جاري حذف الخيار من المنصة...', { id: 'delete-option' });
        await productEditService.deleteProductOption(id, platform);
        toast.success('تم حذف الخيار بنجاح من المنصة', { id: 'delete-option' });
      } catch (e: any) {
        console.error(e);
        toast.error('فشل حذف الخيار من المنصة: ' + (e.message || ''), { id: 'delete-option' });
        return;
      }
    }

    setVariantsRows(prev => prev.filter(v => v.id !== id));
    setShowConfirmButton(true);
  };

  const handleRemoveVariant = async (idx: number) => {
    const variantsValues = watch('variants') || [];
    const variantToRemove = variantsValues[idx];
    const variantId = variantToRemove?.id;
    const hasRealId = variantId && !String(variantId).startsWith('temp-') && !String(variantId).startsWith('new-');

    if (hasRealId && unifiedProduct?.id) {
      const confirmDelete = window.confirm('هل أنت متأكد من رغبتك في حذف هذا المتغير نهائياً من المتجر؟');
      if (!confirmDelete) return;

      try {
        toast.loading('جاري حذف المتغير من المنصة...', { id: 'delete-variant' });
        await productEditService.deleteProductVariant(unifiedProduct.id, variantId, platform || 'salla');
        toast.success('تم حذف المتغير نهائياً بنجاح', { id: 'delete-variant' });
      } catch (e: any) {
        console.error(e);
        toast.error('فشل حذف المتغير من المنصة: ' + (e.message || ''), { id: 'delete-variant' });
        return;
      }
    }

    removeVariant(idx);
  };

  const handleChangeType = (rowId: string, newTypeId: string) => {
    if (newTypeId === 'create-new') {
      setIsNewOptionModalOpen(true);
      return;
    }
    setVariantsRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, typeId: newTypeId, selectedValues: [] } : row
    ));
    setShowConfirmButton(true);
  };



  const handleToggleValue = (rowId: string, valueId: string) => {
    setVariantsRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
        const isSelected = row.selectedValues.includes(valueId);
        const selectedValues = isSelected
          ? row.selectedValues.filter((id: string) => id !== valueId)
          : [...row.selectedValues, valueId];
        return { ...row, selectedValues };
    }));
    setShowConfirmButton(true);
  };

  // ── إدارة كميات فروع المتغيرات (Stock Modal) ───────────────────────────────
  const openStockModal = (idx: number) => {
    setActiveStockIdx(idx);
    const currentStocks = watch(`variants.${idx}.stocks`) || [];
    setTempStocks(JSON.parse(JSON.stringify(currentStocks)));
  };

  const saveStockModal = () => {
    if (activeStockIdx !== null) {
      setValue(`variants.${activeStockIdx}.stocks`, tempStocks, { shouldDirty: true });
      
      const totalQty = tempStocks.reduce((sum: number, st: any) => sum + (st.isUnlimited ? 0 : (st.quantity || 0)), 0);
      const isAnyUnlimited = tempStocks.some((st: any) => st.isUnlimited);
      
      setValue(`variants.${activeStockIdx}.quantity`, totalQty, { shouldDirty: true });
      setValue(`variants.${activeStockIdx}.isUnlimited`, isAnyUnlimited, { shouldDirty: true });
      
      toast.success('تمت مزامنة كميات المستودعات بنجاح');
      closeStockModal();
    }
  };

  const closeStockModal = () => {
    setActiveStockIdx(null);
    setTempStocks([]);
  };

  // ── إدارة خيارات الموديول (Option Modal) ──────────────────────────────────
  const handleAddOptionValue = () => {
    setNewOptionValues(prev => [...prev, { id: `val-${Date.now()}`, label: '', color: '#000000' }]);
  };

  const handleRemoveOptionValue = (id: string) => {
    setNewOptionValues(prev => prev.filter(x => x.id !== id));
  };

  const handleOptionValueLabelChange = (id: string, label: string) => {
    setNewOptionValues(prev => prev.map(x => x.id === id ? { ...x, label } : x));
  };

  const handleOptionValueColorChange = (id: string, color: string) => {
    setNewOptionValues(prev => prev.map(x => x.id === id ? { ...x, color } : x));
  };

  // ── إضافة صفة وخيارات جديدة (New Option Modal) ─────────────────────────
  const handleCreateNewOption = async () => {
    if (!newOptionName.trim()) {
      toast.error('يرجى إدخال اسم الخيار');
      return;
    }
    const emptyVals = newOptionValues.filter(x => !x.label.trim());
    if (emptyVals.length > 0) {
      toast.error('يرجى ملء جميع قيم الخيارات');
      return;
    }

    try {
      if (platform === 'zid') {
        // الخطوة 1 حسب توثيق زد الرسمي: إنشاء صفة المتجر POST /v1/attributes/
        const slug = newOptionName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `attr-${Date.now()}`;
        const attrPayload = {
          name: newOptionName,
          slug,
          is_extra: false,
          is_enabled: true
        };

        const attrRes = await productEditService.createStoreAttribute(attrPayload);
        const createdAttr = attrRes?.data || attrRes;
        const attributeId = createdAttr?.id;

        if (!attributeId) {
          throw new Error('فشل إنشاء صفة المتجر في زد');
        }

        // الخطوة 2 حسب توثيق زد الرسمي: تعيين خيارات/قيم الصفة (Presets) عبر POST /v1/attributes/{id}/presets/
        const createdPresets: Array<{ id: string; label: string }> = [];
        for (const valObj of newOptionValues) {
          if (!valObj.label.trim()) continue;
          const presetPayload = {
            value: {
              ar: valObj.label,
              en: valObj.label
            }
          };

          try {
            const presetRes = await productEditService.createAttributePreset(attributeId, presetPayload);
            const createdPreset = presetRes?.data || presetRes;
            if (createdPreset && createdPreset.id) {
              createdPresets.push({
                id: String(createdPreset.id),
                label: valObj.label
              });
            }
          } catch (e) {
            console.warn(`تعذر إنشاء خيار Preset للقيمة ${valObj.label}:`, e);
          }
        }

        // تحديث مصفوفات العرض المحلية
        const newMappedType: VariantType = {
          id: String(attributeId),
          label: newOptionName,
          values: createdPresets.length > 0
            ? createdPresets
            : newOptionValues.map((v, i) => ({ id: `preset-${Date.now()}-${i}`, label: v.label }))
        };

        setVariantTypes(prev => [...prev, newMappedType]);
        useProductEditStore.setState(state => ({
          attributes: [...state.attributes, {
            id: attributeId,
            name: { ar: newOptionName, en: newOptionName },
            slug,
            values: createdPresets.map(p => ({ id: p.id, value: { ar: p.label, en: p.label } }))
          }]
        }));

        toast.success('تم إنشاء صفة المتجر وخياراتها بنجاح وفق توثيق زد');
      } else {
        const payload = {
          name: newOptionName,
          type: 'radio',
          display_type: newOptionType === 'color' ? 'color' : 'text',
          values: newOptionValues.map(v => ({
            name: v.label,
            display_value: newOptionType === 'color' ? (v.color || '#000000') : v.label
          }))
        };

        const res = await productEditService.createProductOption(unifiedProduct!.id, payload, platform || 'salla');
        toast.success('تم إنشاء الخيار بنجاح');

        const rawRes = res?.data || res;
        const newAttr = Array.isArray(rawRes) ? rawRes[0] : rawRes;

        if (newAttr && newAttr.id) {
          const newMappedType = {
            id: String(newAttr.id),
            label: newOptionName,
            values: (newAttr.values || []).map((v: any, i: number) => ({
              id: String(v.id),
              label: typeof v.name === 'object'
                ? (v.name.ar || v.name.en || v.display_value || String(v.id))
                : String(v.name ?? v.display_value ?? v.value ?? newOptionValues[i]?.label ?? '')
            }))
          };

          setVariantTypes(prev => [...prev, newMappedType]);
          useProductEditStore.setState(state => ({
            attributes: [...state.attributes, newAttr]
          }));
        }
      }

      setIsNewOptionModalOpen(false);
      setNewOptionName('');
      setNewOptionValues([{ id: `val-${Date.now()}`, label: '', color: '#000000' }]);
    } catch (e: any) {
      console.error(e);
      toast.error('حدث خطأ أثناء إضافة الخيار: ' + (e.message || ''));
    }
  };

  // ── إضافة قيمة جديدة لصفة قائمة (New Value Modal) ─────────────────────────
  const handleCreateNewValue = async (name: string, color?: string) => {
    const valName = name || newValueName;
    if (!valName.trim() || !activeTypeIdForNewValue) return;

    try {
      if (platform === 'zid') {
        // في زد: إضافة Preset لصفة المتجر القائمة عبر POST /v1/attributes/{id}/presets/
        const presetPayload = {
          value: {
            ar: valName,
            en: valName
          }
        };

        const presetRes = await productEditService.createAttributePreset(activeTypeIdForNewValue, presetPayload);
        const createdPreset = presetRes?.data || presetRes;
        const presetId = String(createdPreset?.id || `preset-${Date.now()}`);

        const newValObj = { id: presetId, value: { ar: valName, en: valName } };
        const newValMapped = {
          id: presetId,
          label: valName
        };

        setVariantTypes(prev => prev.map(t => 
          t.id === activeTypeIdForNewValue 
            ? { ...t, values: [...t.values, newValMapped] }
            : t
        ));

        useProductEditStore.setState(state => ({
          attributes: state.attributes.map(attr => 
            String(attr.id) === activeTypeIdForNewValue
              ? { ...attr, values: [...(attr.values || []), newValObj] }
              : attr
          )
        }));
        toast.success('تم إضافة خيار الصفة بنجاح وفق توثيق زد');
      } else {
        // في سلة: إضافة قيمة لصفة قائمة عبر POST /products/options/values/{id}
        const payload = {
          name: valName,
          display_value: color || valName
        };

        const res = await productEditService.createProductOptionValue(activeTypeIdForNewValue, payload);
        const createdValue = res?.data || res;
        const valId = String(createdValue?.id || `val-${Date.now()}`);

        const newValMapped = {
          id: valId,
          label: valName
        };

        setVariantTypes(prev => prev.map(t => 
          t.id === activeTypeIdForNewValue 
            ? { ...t, values: [...t.values, newValMapped] }
            : t
        ));

        useProductEditStore.setState(state => ({
          attributes: state.attributes.map(attr => 
            String(attr.id) === activeTypeIdForNewValue
              ? { ...attr, values: [...(attr.values || []), createdValue] }
              : attr
          )
        }));
        toast.success('تم إضافة القيمة بنجاح في سلة');
      }

      setIsNewValueModalOpen(false);
      setNewValueName('');
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء إضافة القيمة');
    }
  };

  // ── توليد التوليفات للمتغيرات (Generate Combinations) ────────────────────────
  const handleGenerateVariants = () => {
    const activeRows = variantsRows.filter(r => r.typeId && r.selectedValues.length > 0);
    if (activeRows.length === 0) {
      toast.error('يرجى اختيار خيار واحد وقيمة واحدة على الأقل للتوليد');
      return;
    }

    const groupsOfValues = activeRows.map(row => {
      const type = variantTypes.find(t => t.id === row.typeId);
      return row.selectedValues.map((valId: string) => {
        const valObj = type?.values.find(v => v.id === valId);
        return {
          attributeId: row.typeId,
          attributeName: type?.label || '',
          valueId: valId,
          valueLabel: valObj?.label || valId
        };
      });
    });

    const cartesian = (args: any[]): any[] => {
      const r: any[] = [];
      const max = args.length - 1;
      function helper(arr: any[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = arr.concat([args[i][j]]);
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const combinations = cartesian(groupsOfValues);
    const originalVariants = watch('variants') || [];
    const basePrice = Number(watch('price') || 0);
    const salePrice = watch('salePrice') !== null && watch('salePrice') !== undefined ? Number(watch('salePrice')) : null;
    const costPrice = watch('costPrice') !== null && watch('costPrice') !== undefined ? Number(watch('costPrice')) : null;
    const weight = watch('weight') !== null && watch('weight') !== undefined ? Number(watch('weight')) : 0;
    const productSku = watch('sku') || '';

    const newVariants = combinations.map((comb, index) => {
      const displayName = comb.map((c: any) => c.valueLabel).join(' / ');
      const sku = `${productSku}-${index + 1}`;

      const matchedOriginal = originalVariants.find((ov: any) => 
        Array.isArray(ov.attributes) &&
        ov.attributes.length === comb.length &&
        comb.every((c: any) => 
          ov.attributes.some((oa: any) => 
            String(oa.id || oa.attribute_id) === String(c.attributeId) && 
            String(oa.valueId || oa.value) === String(c.valueId)
          )
        )
      );

      if (matchedOriginal) return matchedOriginal;

      const defaultStocks = (unifiedProduct?.stocks || []).map((st: any) => ({
        locationId: st.locationId,
        locationName: st.locationName,
        quantity: 0,
        isUnlimited: false
      }));

      return {
        id: `row-${Date.now()}-${index}`,
        sku,
        barcode: '',
        price: basePrice,
        salePrice,
        costPrice,
        quantity: 0,
        isUnlimited: false,
        weight,
        displayName,
        attributes: comb.map((c: any) => ({
          id: c.attributeId,
          attribute_id: c.attributeId,
          valueId: c.valueId,
          name: c.attributeName,
          value: c.valueLabel
        })),
        stocks: defaultStocks
      };
    });

    setValue('variants', newVariants, { shouldDirty: true });
    toast.success(`تم توليد عدد ${newVariants.length} متغير بنجاح`);
    setShowConfirmButton(false);
  };

  return {
    variantFields,
    variantTypes,
    variantsRows,
    activeStockIdx,
    tempStocks,
    isNewOptionModalOpen,
    newOptionName,
    newOptionType,
    newOptionValues,
    collapsedValueIds,
    isNewValueModalOpen,
    newValueName,
    activeTypeIdForNewValue,
    platform,
    register,
    appendVariant,
    removeVariant: handleRemoveVariant,
    replaceVariants,
    handleAddRow,
    handleRemoveRow,
    handleChangeType,
    handleToggleValue,
    openStockModal,
    saveStockModal,
    closeStockModal,
    setTempStocks,
    setIsNewOptionModalOpen,
    setNewOptionName,
    setNewOptionType,
    setNewOptionValues,
    toggleCollapseValue,
    setIsNewValueModalOpen,
    setNewValueName,
    setActiveTypeIdForNewValue,
    handleAddOptionValue,
    handleRemoveOptionValue,
    handleOptionValueLabelChange,
    handleOptionValueColorChange,
    handleCreateNewOption,
    handleCreateNewValue,
    handleGenerateVariants,
    watch,
    setValue,
    showConfirmButton
  };
}
