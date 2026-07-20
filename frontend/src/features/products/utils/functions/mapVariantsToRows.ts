import type { UnifiedVariant } from '../../types/unifiedProduct';
import type { VariantType } from './mapStoreAttributesToVariantTypes';

export interface VariantRow {
  id: string;
  typeId: string;
  selectedValues: string[];
}

/**
 * مطابقة خيارات المنتج الموحدة وبناء صفوف المزامنة بالواجهة الرسومية.
 * تقوم بقراءة خصائص المتغيرات الحالية للمنتج وربطها بالخيارات المتاحة بالمتجر.
 *
 * @param unifiedVariants - المتغيرات الحالية للمنتج بالنموذج الموحد
 * @param storeAttributes - الخصائص المتاحة بالمتجر
 * @param variantTypes - الخصائص الموحدة
 * @param platform - اسم المنصة (سلة أو زد)
 * @returns صفوف المتغيرات المعروضة في الواجهة
 */
export function mapVariantsToRows(
  unifiedVariants: UnifiedVariant[],
  storeAttributes: any[],
  variantTypes: VariantType[],
  platform: 'salla' | 'zid' | null
): VariantRow[] {
  const normalizeArabic = (str: string): string => {
    return str
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, '')
      .trim();
  };

  const activeOptionsMap: Record<string, Set<string>> = {};

  if (Array.isArray(unifiedVariants) && unifiedVariants.length > 0) {
    unifiedVariants.forEach((v) => {
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach((attr: any) => {
          const typeId = String(attr.id || attr.attribute_id || attr.name || '');
          if (!typeId) return;

          if (!activeOptionsMap[typeId]) {
            activeOptionsMap[typeId] = new Set<string>();
          }

          const valStr = attr.value;
          const matchedType = variantTypes.find(t => t.id === typeId || t.label === typeId);
          const matchedVal = matchedType?.values.find(val => 
            normalizeArabic(val.label) === normalizeArabic(valStr || '') || 
            val.id === attr.valueId
          );
          const selectedValueId = matchedVal?.id || attr.valueId || (valStr ? `raw-${valStr}` : '');
          if (selectedValueId) {
            activeOptionsMap[typeId].add(selectedValueId);
          }
        });
      }
    });
  }

  // Fallback if no active options were extracted from variants, but product has options (Salla only)
  if (Object.keys(activeOptionsMap).length === 0 && platform === 'salla' && Array.isArray(storeAttributes)) {
    storeAttributes.forEach((opt: any) => {
      const typeId = String(opt.id);
      if (!activeOptionsMap[typeId]) {
        activeOptionsMap[typeId] = new Set<string>(
          Array.isArray(opt.values) ? opt.values.map((v: any) => String(v.id)) : []
        );
      }
    });
  }

  return Object.entries(activeOptionsMap).map(([typeId, valSet]) => ({
    id: platform === 'salla' ? typeId : `row-${typeId}`,
    typeId,
    selectedValues: Array.from(valSet),
  }));
}
