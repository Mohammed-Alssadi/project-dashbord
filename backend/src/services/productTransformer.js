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
      status: rawProduct.status || '', 
      type: rawProduct.type || '',
      category: categoryName,
      productUrl: rawProduct.urls?.customer || '',
      platform: 'salla'
    };
  }

  if (platform === 'zid') {
    const categoryName = rawProduct.category?.name || '';
    return {
      id: rawProduct.id,
      name: typeof rawProduct.name === 'object' ? rawProduct.name.ar || rawProduct.name.en : rawProduct.name,
      price: rawProduct.price || 0,
      currency: 'SAR',
      salePrice: rawProduct.sale_price || 0,
      costPrice: rawProduct.cost_price || 0,
      sku: rawProduct.sku || '',
      imageUrl: rawProduct.main_image || '',
      quantity: rawProduct.quantity ?? 0,
      status: rawProduct.status || '',
      type: rawProduct.type || '',
      category: categoryName,
      productUrl: rawProduct.html_url || '',
      platform: 'zid'
    };
  }

  return rawProduct;
};
