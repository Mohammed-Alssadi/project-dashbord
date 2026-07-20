import { z } from 'zod';

export const productValidationSchema = z.object({
  nameAr: z.string().min(3, 'اسم المنتج باللغة العربية مطلوب ويجب أن يكون 3 أحرف على الأقل'),
  nameEn: z.string().optional().nullable(),
  descriptionAr: z.string().min(1, 'وصف المنتج باللغة العربية مطلوب'),
  descriptionEn: z.string().optional().nullable(),
  shortDescriptionAr: z.string().optional().nullable(),
  shortDescriptionEn: z.string().optional().nullable(),
  sku: z.string().min(2, 'رمز المنتج SKU مطلوب ولا يقل عن حرفين'),
  barcode: z.string().optional().nullable(),
  mpn: z.string().optional().nullable(),
  gtin: z.string().optional().nullable(),
  price: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: 'سعر البيع يجب أن يكون رقماً' }).min(0, 'سعر البيع يجب أن يكون قيمة موجبة أو صفر')
  ),
  costPrice: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
    z.number({ message: 'سعر التكلفة يجب أن يكون رقماً' }).min(0, 'سعر التكلفة لا يمكن أن يكون سالباً').nullable()
  ).optional(),
  salePrice: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
    z.number({ message: 'سعر الخصم يجب أن يكون رقماً' }).min(0, 'سعر الخصم لا يمكن أن يكون سالباً').nullable()
  ).optional(),
  isDiscountActive: z.boolean().default(false),
  discountStart: z.string().nullable().optional(),
  discountEnd: z.string().nullable().optional(),
  weight: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? 0 : Number(val)),
    z.number({ message: 'الوزن يجب أن يكون رقماً' }).min(0, 'الوزن لا يمكن أن يكون سالباً')
  ).default(0),
  isPublished: z.boolean().default(true),
  requiresShipping: z.boolean().default(true),
  isTaxable: z.boolean().default(false),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string()
    })
  ).min(1, 'يجب اختيار تصنيف واحد على الأقل للمنتج'),
  minOrderQuantity: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
    z.number().min(1, 'الحد الأدنى يجب أن يكون 1 على الأقل').nullable()
  ).optional(),
  maxOrderQuantity: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
    z.number().min(1, 'الحد الأقصى يجب أن يكون 1 على الأقل').nullable()
  ).optional(),
  maxItemsPerUser: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
    z.number().min(1, 'الحد الأقصى يجب أن يكون 1 على الأقل').nullable()
  ).optional(),
  seoTitleAr: z.string().optional().nullable(),
  seoTitleEn: z.string().optional().nullable(),
  seoDescriptionAr: z.string().optional().nullable(),
  seoDescriptionEn: z.string().optional().nullable(),
  seoSlug: z.string().regex(/^[a-z0-9\u0600-\u06FF\s_-]*$/, 'رابط السيو غير صالح ويجب ألا يحتوي على رموز خاصة').optional().nullable(),
  keywords: z.array(z.string()).default([]),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      isMain: z.boolean()
    })
  ).default([]),
  variants: z.array(
    z.object({
      id: z.string(),
      sku: z.string().min(1, 'SKU المتغير مطلوب'),
      barcode: z.string().optional().nullable(),
      mpn: z.string().optional().nullable(),
      gtin: z.string().optional().nullable(),
      price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
      salePrice: z.number().nullable().optional(),
      costPrice: z.number().nullable().optional(),
      quantity: z.number().min(0, 'الكمية يجب ألا تكون سالبة'),
      isUnlimited: z.boolean().default(false),
      weight: z.number().nullable().optional(),
      displayName: z.string(),
      stocks: z.array(
        z.object({
          locationId: z.string(),
          locationName: z.string(),
          quantity: z.number(),
          isUnlimited: z.boolean()
        })
      )
    })
  ).default([]),
  // مخزون المنتج البسيط (زد فقط) — مصفوفة مستودعات مع الكمية
  stocks: z.array(
    z.object({
      locationId: z.string(),
      locationName: z.string(),
      quantity: z.number(),
      isUnlimited: z.boolean()
    })
  ).optional().default([]),
  customOptions: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      isRequired: z.boolean(),
      choices: z.array(
        z.object({
          id: z.string(),
          label: z.string()
        })
      )
    })
  ).optional()
}).refine(
  (data) => {
    if (data.isDiscountActive && data.salePrice !== null && data.salePrice !== undefined) {
      return data.salePrice < data.price;
    }
    return true;
  },
  {
    message: 'سعر الخصم يجب أن يكون أقل من السعر الأساسي للبيع',
    path: ['salePrice']
  }
).refine(
  (data) => {
    if (data.isDiscountActive && data.discountStart && data.discountEnd) {
      return new Date(data.discountStart) <= new Date(data.discountEnd);
    }
    return true;
  },
  {
    message: 'تاريخ بدء الخصم يجب أن يكون قبل أو مساوياً لتاريخ الانتهاء',
    path: ['discountStart']
  }
);

export type ProductFormData = z.infer<typeof productValidationSchema>;
