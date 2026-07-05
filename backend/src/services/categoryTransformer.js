/**
 * محول وتوحيد هيكل بيانات الأقسام بين سلة وزد
 * 
 * @param {string} platform - اسم المنصة (salla | zid)
 * @param {object} rawCategory - كائن القسم الخام القادم من المنصة
 * @returns {object} - القسم بالصيغة الموحدة
 */
export const transformCategory = (platform, rawCategory) => {
  if (platform === 'salla') {
    // ─── سلة: بنية الـ Response ───────────────────────────────────────────────
    // status: 'active' | 'hidden'
    // sub_categories: مصفوفة من نفس البنية (recursive)
    // show_in: { app, salla_pro, ... }
    return {
      id: rawCategory.id,
      name: rawCategory.name,
      imageUrl: rawCategory.image || '',
      customerUrl: rawCategory.urls?.customer || '',
      parentId: rawCategory.parent_id || null,
      sortOrder: rawCategory.sort_order || 0,
      status: rawCategory.status || 'active',           // 'active' | 'hidden'
      isPublished: rawCategory.status === 'active',
      hasHiddenProducts: rawCategory.has_hidden_products || false,
      productsCount: null,                              // سلة لا تُعيد العدد في هذا الـ endpoint
      updatedAt: rawCategory.update_at || rawCategory.updated_at || '',
      metadata: rawCategory.metadata || null,
      showIn: rawCategory.show_in || null,
      seo: {
        title: rawCategory.metadata?.title || '',
        description: rawCategory.metadata?.description || '',
        url: rawCategory.metadata?.url || ''
      },
      subCategories: Array.isArray(rawCategory.sub_categories)
        ? rawCategory.sub_categories.map(sub => transformCategory(platform, sub))
        : [],
      platform: 'salla'
    };
  }

  if (platform === 'zid') {
    // ─── زد: بنية الـ Response الحقيقية ─────────────────────────────────────
    // is_published: boolean (وليس status: string)
    // names: { ar, en } (اسم متعدد اللغات)
    // url: رابط الواجهة (وليس html_url)
    // sub_categories: مصفوفة (recursive)
    // SEO_category_title / SEO_category_description
    // products_count: عدد المنتجات

    const name = rawCategory.names?.ar
      || rawCategory.names?.en
      || (typeof rawCategory.name === 'object' ? rawCategory.name?.ar || rawCategory.name?.en : rawCategory.name)
      || '';

    return {
      id: rawCategory.id,
      uuid: rawCategory.uuid || null,
      name,
      imageUrl: rawCategory.image || rawCategory.image_full_size || '',
      imageAltText: rawCategory.img_alt_text || '',
      customerUrl: rawCategory.url || rawCategory.html_url || '',        // زد يُعيد 'url' وليس 'html_url'
      parentId: rawCategory.parent_id || null,
      sortOrder: rawCategory.sort_order || 0,
      status: rawCategory.is_published ? 'active' : 'hidden',           // تحويل boolean → string موحد
      isPublished: rawCategory.is_published ?? false,
      hasHiddenProducts: false,                                          // غير متوفر في زد
      productsCount: rawCategory.products_count ?? null,
      updatedAt: rawCategory.updated_at || '',
      metadata: rawCategory.metafields || [],
      showIn: null,                                                      // غير متوفر في زد
      seo: {
        title: rawCategory.SEO_category_title || '',
        description: rawCategory.SEO_category_description || '',
        url: rawCategory.slug || ''
      },
      subCategories: Array.isArray(rawCategory.sub_categories)
        ? rawCategory.sub_categories.map(sub => transformCategory(platform, sub))
        : [],
      platform: 'zid'
    };
  }

  return rawCategory;
};
