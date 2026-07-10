export interface UnifiedProduct {
  id: string | number;
  name: string;
  price: number;
  salePrice: number | null;
  currency: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  status: string;            // Raw status value (sale, active, draft, published, ...)
  type: string;              // Raw class/type (product, voucher, dynamic_bundle, ...)
  category: string;
  productUrl: string | null;
  productDetails: any;       // Full raw details from platform
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
 * Adapt a single raw product response to the UnifiedProduct interface.
 */
export const adaptProduct = (rawProduct: any): UnifiedProduct => {
  if (!rawProduct) return {} as UnifiedProduct;

  // Extract name (Zid uses localization object, Salla uses string)
  const name = extractName(rawProduct.name);

  // Extract category
  const rawCategory = rawProduct.categories?.[0];
  const category = rawCategory ? extractName(rawCategory.name) : '';

  // Extract image (Salla uses thumbnail/main_image, Zid uses images array)
  const firstImageObj = rawProduct.images?.[0]?.image;
  const imageUrl = rawProduct.thumbnail || rawProduct.main_image || firstImageObj?.medium || firstImageObj?.thumbnail || firstImageObj?.large || '';

  // Extract prices (Salla uses object { amount }, Zid uses number)
  const price = typeof rawProduct.price === 'object' ? (rawProduct.price?.amount ?? 0) : (rawProduct.price ?? 0);
  const salePrice = typeof rawProduct.sale_price === 'object' ? (rawProduct.sale_price?.amount ?? null) : (rawProduct.sale_price ?? null);
  const currency = typeof rawProduct.price === 'object' ? (rawProduct.price?.currency || 'SAR') : (rawProduct.currency || 'SAR');

  // Extract URL
  const productUrl = rawProduct.url || rawProduct.urls?.customer || rawProduct.html_url || null;

  // Determine status (Zid uses is_draft, Salla uses status)
  let status = rawProduct.status || '';
  if (rawProduct.is_draft !== undefined) {
    status = rawProduct.is_draft ? 'draft' : 'published';
  }

  // Type (Salla uses type, Zid uses product_class)
  const type = rawProduct.type || rawProduct.product_class || '';

  return {
    id: rawProduct.id,
    name,
    price,
    salePrice,
    currency,
    sku: rawProduct.sku || '',
    imageUrl,
    quantity: rawProduct.quantity ?? 0,
    status,
    type,
    category,
    productUrl,
    productDetails: rawProduct,
  };
};

/**
 * Helper to adapt a list of products from api response.
 */
export const adaptProductsList = (response: any): UnifiedProduct[] => {
  const list = response?.results || response?.data || response || [];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(adaptProduct);
};
