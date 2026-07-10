export interface UnifiedCategory {
  id: string | number;
  name: string;
  imageUrl: string | null;
  productsCount: number | null;
  sortOrder: number;
  status: string;
  url: string | null;
  categoryDetails: any;       // Full raw details from platform
}

/**
 * Extracts localized string value from an object (checking 'ar' and 'en') or returns the string.
 */
const extractName = (name: any): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    return name.ar || name.en || '';
  }
  return String(name);
};

/**
 * Adapt a single raw category response to the UnifiedCategory interface.
 */
export const adaptCategory = (rawCategory: any): UnifiedCategory => {
  if (!rawCategory) return {} as UnifiedCategory;

  const name = extractName(rawCategory.name);
  const imageUrl = rawCategory.image_url || rawCategory.image || null;

  // Determine status (Zid uses is_active boolean, Salla uses status string)
  let status = rawCategory.status || 'active';
  if (rawCategory.is_active === false) {
    status = 'hidden';
  } else if (rawCategory.is_active === true) {
    status = 'active';
  }

  // Extract URL
  const url = rawCategory.html_url || rawCategory.urls?.customer || rawCategory.url || null;

  return {
    id: rawCategory.id,
    name,
    imageUrl,
    productsCount: rawCategory.products_count !== undefined ? Number(rawCategory.products_count) : null,
    sortOrder: rawCategory.sort_order ?? 0,
    status,
    url,
    categoryDetails: rawCategory,
  };
};

/**
 * Helper to adapt a list of categories from api response.
 */
export const adaptCategoriesList = (response: any): UnifiedCategory[] => {
  const list = response?.categories || response?.results || response?.data || response || [];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(adaptCategory);
};
