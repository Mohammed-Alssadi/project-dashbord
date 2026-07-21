export interface UnifiedLocationStock {
  locationId: string;
  locationName: string;
  quantity: number;
  isUnlimited: boolean;
}

export interface UnifiedVariant {
  id: string;
  sku: string;
  barcode: string;
  mpn?: string;
  gtin?: string;
  price: number;
  salePrice: number | null;
  costPrice: number | null;
  quantity: number;
  isUnlimited: boolean;
  weight: number | null;
  displayName: string;
  attributes: Array<{
    id?: string;      // معرف نوع الخيار (attribute_id) من زد
    valueId?: string; // معرف القيمة المحددة (id) من زد
    name: string;
    value: string;
  }>;
  stocks: UnifiedLocationStock[]; // المخازن الموزعة لهذا المتغير الفرعي
}

export interface UnifiedCustomOption {
  id: string;
  type: string;
  label: string;
  isRequired: boolean;
  choices: Array<{
    id: string;
    label: string;
  }>;
}

export interface UnifiedProduct {
  id: string;
  nameAr: string;
  nameEn?: string; // اختياري (زد فقط)
  descriptionAr: string;
  descriptionEn?: string; // اختياري (زد فقط)
  shortDescriptionAr?: string; // اختياري (زد فقط)
  shortDescriptionEn?: string; // اختياري (زد فقط)
  sku: string;
  barcode: string;
  mpn?: string;
  gtin?: string;
  price: number;
  costPrice: number | null;
  salePrice: number | null;
  isDiscountActive: boolean;
  discountStart: string | null;
  discountEnd: string | null;
  isUnlimited: boolean;
  quantity: number;
  weight: number;
  isPublished: boolean;
  requiresShipping: boolean;
  isTaxable: boolean;
  categories: Array<{ id: string; name: string }>;
  images: Array<{ id: string; url: string; isMain: boolean }>;
  stocks: UnifiedLocationStock[];
  variants: UnifiedVariant[];
  customOptions?: UnifiedCustomOption[]; // اختياري (زد فقط)

  // حقول طلبات الشراء
  minOrderQuantity: number | null;
  maxOrderQuantity: number | null;
  maxItemsPerUser?: number | null; // اختياري (سلة فقط)

  // حقول السيو (SEO)
  seoTitleAr: string;
  seoTitleEn?: string; // اختياري (زد فقط)
  seoDescriptionAr: string;
  seoDescriptionEn?: string; // اختياري (زد فقط)
  seoSlug: string;
  keywords: string[];

  platform: 'salla' | 'zid';
  htmlUrl: string;
  weightType?: string; // إصلاح #15 (#32): وحدة الوزن من سلة (kg | g | lb)
}
