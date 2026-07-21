import type { UnifiedVariant } from '../../types/unifiedProduct';
import type { VariantType } from './mapStoreAttributesToVariantTypes';

export interface VariantRow {
    id: string;
    typeId: string;
    selectedValues: string[];
}

/**
 * مطابقة خيارات المنتج الموحدة وبناء صفوف المزامنة بالواجهة الرسومية.
 *
 * الإصلاح الرئيسي:
 * - Fallback لسلة يُعيد صفوف بـ selectedValues فارغة (لا تحديد تلقائي للكل)
 *   لأن التحديد التلقائي كان يُسبب توليد متغيرات غير مقصودة.
 * - مطابقة القيم تعتمد على `val.id === attr.valueId` أولاً ثم نص بعد تطبيع
 */
export function mapVariantsToRows(
    unifiedVariants: UnifiedVariant[],
    storeAttributes: any[],
    variantTypes: VariantType[],
    platform: 'salla' | 'zid' | null
): VariantRow[] {
    const normalizeArabic = (str: string): string =>
        str
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, '')
            .trim();

    const activeOptionsMap: Record<string, Set<string>> = {};

    if (Array.isArray(unifiedVariants) && unifiedVariants.length > 0) {
        unifiedVariants.forEach((v) => {
            if (!Array.isArray(v.attributes)) return;

            v.attributes.forEach((attr: any) => {
                // ID الخيار (option/type)
                const typeId = String(attr.id || attr.attribute_id || attr.name || '');
                if (!typeId) return;

                if (!activeOptionsMap[typeId]) {
                    activeOptionsMap[typeId] = new Set<string>();
                }

                const valStr = String(attr.value || '');
                const matchedType = variantTypes.find(t => t.id === typeId);
                let selectedValueId: string = '';

                if (matchedType) {
                    const matchedVal = matchedType.values.find(val =>
                        // مطابقة بالـ ID أولاً — الأكثر موثوقية
                        val.id === String(attr.valueId || '') ||
                        // مطابقة نصية بعد التطبيع
                        (valStr && normalizeArabic(val.label) === normalizeArabic(valStr))
                    );
                    selectedValueId = matchedVal?.id || String(attr.valueId || '') || (valStr ? `raw-${valStr}` : '');
                } else {
                    selectedValueId = String(attr.valueId || '') || (valStr ? `raw-${valStr}` : '');
                }

                if (selectedValueId) {
                    activeOptionsMap[typeId].add(selectedValueId);
                }
            });
        });
    }

    // Fallback لسلة: عند عدم وجود أي خيارات مستخرجة
    // نُعيد الصفوف بـ selectedValues فارغة — المستخدم يختار بنفسه
    // (لا نُحدِّد جميع القيم تلقائياً لأن ذلك يُسبِّب توليد متغيرات غير مقصودة)
    if (Object.keys(activeOptionsMap).length === 0 && platform === 'salla' && Array.isArray(storeAttributes)) {
        return storeAttributes.map((opt: any) => ({
            id: String(opt.id),
            typeId: String(opt.id),
            selectedValues: [] // فارغة — لا تحديد تلقائي
        }));
    }

    return Object.entries(activeOptionsMap).map(([typeId, valSet]) => ({
        id: platform === 'salla' ? typeId : `row-${typeId}`,
        typeId,
        selectedValues: Array.from(valSet),
    }));
}
