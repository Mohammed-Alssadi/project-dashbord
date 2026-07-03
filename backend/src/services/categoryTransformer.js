/**
 * محول وتوحيد هيكل بيانات الأقسام بين سلة وزد
 * 
 * @param {string} platform - اسم المنصة (salla | zid)
 * @param {object} rawCategory - كائن القسم الخام القادم من المنصة
 * @returns {object} - القسم بالصيغة الموحدة
 */
export const transformCategory = (platform, rawCategory) => {
  if (platform === 'salla') {
    return {
      id: rawCategory.id,
      name: rawCategory.name,
      imageUrl: rawCategory.image || '',
      customerUrl: rawCategory.urls?.customer || '',
      parentId: rawCategory.parent_id || 0,
      sortOrder: rawCategory.sort_order || 0,
      status: rawCategory.status || 'active',
      hasHiddenProducts: rawCategory.has_hidden_products || false,
      updatedAt: rawCategory.update_at || rawCategory.updated_at || '',
      metadata: rawCategory.metadata || null,
      showIn: rawCategory.show_in || null,
      subCategories: Array.isArray(rawCategory.sub_categories) 
        ? rawCategory.sub_categories.map(sub => transformCategory(platform, sub))
        : [],
      platform: 'salla'
    };
  }

  if (platform === 'zid') {
    return {
      id: rawCategory.id,
      name: typeof rawCategory.name === 'object' ? rawCategory.name.ar || rawCategory.name.en : rawCategory.name,
      imageUrl: rawCategory.image || '',
      customerUrl: rawCategory.html_url || '',
      parentId: rawCategory.parent_id || 0,
      sortOrder: rawCategory.sort_order || 0,
      status: rawCategory.status || 'active',
      hasHiddenProducts: false,
      updatedAt: rawCategory.updated_at || '',
      subCategories: [],
      platform: 'zid'
    };
  }

  return rawCategory;
};
