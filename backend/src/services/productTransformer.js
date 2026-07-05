/**
 * محول وتوحيد هيكل بيانات المنتجات بين سلة وزد بدون أي ترجمات أو نصوص مخصصة
 * 
 * @param {string} platform - اسم المنصة (salla | zid)
 * @param {object} rawProduct - كائن المنتج الخام القادم من المنصة
 * @returns {object} - المنتج بالصيغة الموحدة الخام
 */
export const transformProduct = (platform, rawProduct) => {
  if (platform === 'salla') {
    // استخراج اسم القسم الأول للمنتج إن وجد
    const categoryName = Array.isArray(rawProduct.categories) && rawProduct.categories.length > 0
      ? rawProduct.categories[0].name
      : '';

    return {
      id: rawProduct.id,
      name: rawProduct.name,
      price: typeof rawProduct.price === 'object' ? rawProduct.price.amount : (rawProduct.price || 0),
      currency: typeof rawProduct.price === 'object' ? rawProduct.price.currency : 'SAR',
      salePrice: typeof rawProduct.sale_price === 'object' ? rawProduct.sale_price.amount : (rawProduct.sale_price || 0),
      costPrice: typeof rawProduct.cost_price === 'object' ? rawProduct.cost_price.amount : (rawProduct.cost_price || 0),
      sku: rawProduct.sku || '',
      imageUrl: rawProduct.main_image || rawProduct.thumbnail || '',
      quantity: rawProduct.quantity ?? 0,
      status: rawProduct.status === 'sale' ? 'active' : (rawProduct.status === 'out' ? 'out_of_stock' : (rawProduct.status || '')), 
      type: rawProduct.type || '',
      category: categoryName,
      productUrl: rawProduct.urls?.customer || '',
      platform: 'salla'
    };
  }

  if (platform === 'zid') {
    // 1. استخراج اسم القسم الأول في زد (الذي يأتي ككائن متعدد اللغات)
    let categoryName = '';
    if (Array.isArray(rawProduct.categories) && rawProduct.categories.length > 0) {
      const firstCat = rawProduct.categories[0];
      categoryName = typeof firstCat.name === 'object' 
        ? firstCat.name.ar || firstCat.name.en 
        : (firstCat.name || '');
    } else if (rawProduct.category) {
      categoryName = typeof rawProduct.category.name === 'object'
        ? rawProduct.category.name.ar || rawProduct.category.name.en
        : (rawProduct.category.name || '');
    }

    // 2. قراءة رابط المنتج (في زد قد يكون url أو html_url)
    const productUrl = rawProduct.url || rawProduct.html_url || '';

    // 3. استخراج صورة المنتج من مصفوفة images لزد
    let imageUrl = '';
    if (Array.isArray(rawProduct.images) && rawProduct.images.length > 0) {
      imageUrl = rawProduct.images[0].image || rawProduct.images[0].image_full_size || '';
    } else {
      imageUrl = rawProduct.image || rawProduct.main_image || '';
    }

    return {
      id: rawProduct.id,
      name: typeof rawProduct.name === 'object' ? rawProduct.name.ar || rawProduct.name.en : rawProduct.name,
      price: rawProduct.price || 0,
      currency: 'SAR',
      salePrice: rawProduct.sale_price || 0,
      costPrice: rawProduct.cost ?? rawProduct.cost_price ?? 0, // زد تستخدم 'cost' للتكلفة
      sku: rawProduct.sku || '',
      imageUrl,
      quantity: rawProduct.quantity ?? 0,
      status: rawProduct.is_draft ? 'draft' : (rawProduct.is_published ? 'active' : 'hidden'),
      type: rawProduct.product_class || rawProduct.type || 'standard',
      category: categoryName,
      productUrl,
      platform: 'zid'
    };
  }

  return rawProduct;
};
