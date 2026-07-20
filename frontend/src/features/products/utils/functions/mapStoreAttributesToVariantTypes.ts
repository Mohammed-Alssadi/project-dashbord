export interface AttributeValue {
  id: string;
  label: string;
  hex?: string;
}

export interface VariantType {
  id: string;
  label: string;
  values: AttributeValue[];
}

/**
 * تحويل خصائص المتجر العامة لزد وسلة إلى الهيكل الموحد VariantType
 * المستخدم في بناء خيارات المتغيرات بالداشبورد.
 *
 * @param storeAttributes - مصفوفة الخصائص الخام القادمة من API المنصات
 * @returns مصفوفة الخصائص بالهيكل الموحد
 */
export function mapStoreAttributesToVariantTypes(storeAttributes: any[]): VariantType[] {
  if (!Array.isArray(storeAttributes) || storeAttributes.length === 0) {
    return [];
  }

  return storeAttributes.map((attr: any) => ({
    id: String(attr.id ?? attr.slug ?? ''),
    label: typeof attr.name === 'object'
      ? (attr.name?.ar || attr.name?.en || String(attr.id))
      : String(attr.name ?? attr.id ?? ''),
    values: Array.isArray(attr.values)
      ? attr.values.map((v: any): AttributeValue => ({
          id: String(v.id ?? ''),
          label: typeof v.name === 'object'
            ? (v.name?.ar || v.name?.en || String(v.id))
            : String(v.name ?? v.display_value ?? v.value ?? v.id ?? ''),
          hex: typeof v.display_value === 'string' && v.display_value.startsWith('#')
            ? v.display_value
            : (typeof v.value === 'string' && v.value.startsWith('#') ? v.value : undefined)
        }))
      : Array.isArray(attr.presets)
        ? attr.presets.map((v: any): AttributeValue => ({
            id: String(v.id ?? ''),
            label: typeof v.value === 'object'
              ? (v.value?.ar || v.value?.en || String(v.id))
              : String(v.value ?? v.name ?? v.id ?? ''),
          }))
        : Array.isArray(attr.options)
          ? attr.options.map((v: any): AttributeValue => ({
              id: String(v.id ?? ''),
              label: typeof v.value === 'object'
                ? (v.value?.ar || v.value?.en || String(v.id))
                : String(v.value ?? v.name?.ar ?? v.name ?? v.id ?? ''),
            }))
          : [],
  }));
}
