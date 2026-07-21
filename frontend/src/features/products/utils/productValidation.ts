import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Schema الكامل لنموذج تعديل المنتج (يدعم سلة وزد)
// ─────────────────────────────────────────────────────────────────────────────

export const baseProductSchema = z.object({
    // ── المعلومات الأساسية ───────────────────────────────────────────────────
    nameAr: z.string().min(3, 'اسم المنتج باللغة العربية مطلوب ويجب أن يكون 3 أحرف على الأقل'),
    nameEn: z.string().optional().nullable(),
    descriptionAr: z.string().optional().nullable().default(''),
    descriptionEn: z.string().optional().nullable(),
    shortDescriptionAr: z.string().optional().nullable(),
    shortDescriptionEn: z.string().optional().nullable(),

    // ── المعرفات ────────────────────────────────────────────────────────────
    sku: z.string().min(2, 'رمز المنتج SKU مطلوب ولا يقل عن حرفين'),
    barcode: z.string().optional().nullable(),
    mpn: z.string().optional().nullable(),
    gtin: z.string().optional().nullable(),

    // ── التسعير ─────────────────────────────────────────────────────────────
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

    // ── المخزون على مستوى المنتج ─────────────────────────────────────────────
    quantity: z.preprocess(
        (val) => (val === '' || val === undefined || val === null ? 0 : Number(val)),
        z.number({ message: 'الكمية يجب أن تكون رقماً' }).min(0, 'الكمية لا يمكن أن تكون سالبة')
    ).default(0),
    isUnlimited: z.boolean().default(false),

    // ── الخصائص الفيزيائية ───────────────────────────────────────────────────
    weight: z.preprocess(
        (val) => (val === '' || val === undefined || val === null ? 0 : Number(val)),
        z.number({ message: 'الوزن يجب أن يكون رقماً' }).min(0, 'الوزن لا يمكن أن يكون سالباً')
    ).default(0),
    weightType: z.string().optional().nullable(),

    // ── حالة النشر والشحن ────────────────────────────────────────────────────
    isPublished: z.boolean().default(true),
    requiresShipping: z.boolean().default(true),
    isTaxable: z.boolean().default(false),

    // ── التصنيفات ────────────────────────────────────────────────────────────
    categories: z.array(
        z.object({
            id: z.string(),
            name: z.string()
        })
    ).min(1, 'يجب اختيار تصنيف واحد على الأقل للمنتج'),

    // ── قيود الطلب ───────────────────────────────────────────────────────────
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

    // ── SEO ──────────────────────────────────────────────────────────────────
    seoTitleAr: z.string().optional().nullable(),
    seoTitleEn: z.string().optional().nullable(),
    seoDescriptionAr: z.string().optional().nullable(),
    seoDescriptionEn: z.string().optional().nullable(),
    seoSlug: z.string().regex(
        /^[a-z0-9\u0600-\u06FF_-]*$/,
        'رابط السيو غير صالح — لا يجوز استخدام مسافات أو رموز خاصة'
    ).optional().nullable(),
    keywords: z.array(z.string()).default([]),

    // ── الصور ────────────────────────────────────────────────────────────────
    images: z.array(
        z.object({
            id: z.string(),
            url: z.string(),
            isMain: z.boolean()
        })
    ).default([]),

    // ── المتغيرات (Variants/SKUs) ─────────────────────────────────────────────
    variants: z.array(
        z.object({
            id: z.string(),
            sku: z.string().optional().nullable().default(''),
            barcode: z.string().optional().nullable(),
            mpn: z.string().optional().nullable(),
            gtin: z.string().optional().nullable(),
            price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
            salePrice: z.number().nullable().optional(),
            costPrice: z.number().nullable().optional(),
            quantity: z.number().min(0, 'الكمية يجب ألا تكون سالبة').default(0),
            isUnlimited: z.boolean().default(false),
            weight: z.number().nullable().optional(),
            displayName: z.string(),
            // سبب التعديل (سلة) — اختياري
            reasonId: z.union([z.number(), z.string()]).nullable().optional(),
            attributes: z.array(
                z.object({
                    id: z.string().optional(),
                    valueId: z.string().optional(),
                    name: z.string().optional(),
                    value: z.string().optional()
                })
            ).optional().default([]),
            stocks: z.array(
                z.object({
                    locationId: z.string(),
                    locationName: z.string(),
                    quantity: z.number().min(0).default(0),
                    isUnlimited: z.boolean().default(false)
                })
            ).default([])
        })
        // التحقق من: salePrice < price على مستوى كل متغير
        .refine(
            (v) => {
                if (v.salePrice != null && v.salePrice !== undefined && v.salePrice > 0) {
                    return v.salePrice < v.price;
                }
                return true;
            },
            {
                message: 'سعر خصم المتغير يجب أن يكون أقل من سعره الأساسي',
                path: ['salePrice']
            }
        )
    ).default([]),

    // ── مخزون المنتج البسيط (فروع سلة / مستودعات زد) ─────────────────────────
    stocks: z.array(
        z.object({
            locationId: z.string(),
            locationName: z.string(),
            quantity: z.number().min(0).default(0),
            isUnlimited: z.boolean().default(false)
        })
    ).optional().default([]),

    // ── خيارات التخصيص (زد فقط) ──────────────────────────────────────────────
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

});

const applyProductRefines = (schema: any) => {
    return schema.refine(
        (data: any) => {
            // salePrice على مستوى المنتج يجب أن يكون > 0 وأقل من price
            if (data.isDiscountActive && data.salePrice != null && data.salePrice !== undefined) {
                return data.salePrice > 0 && data.salePrice < data.price;
            }
            return true;
        },
        {
            message: 'سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي',
            path: ['salePrice']
        }
    ).refine(
        (data: any) => {
            if (data.isDiscountActive && data.discountStart && data.discountEnd) {
                return new Date(data.discountStart) <= new Date(data.discountEnd);
            }
            return true;
        },
        {
            message: 'تاريخ بدء الخصم يجب أن يكون قبل أو مساوياً لتاريخ الانتهاء',
            path: ['discountStart']
        }
    ).refine(
        (data: any) => {
            if (data.minOrderQuantity != null && data.maxOrderQuantity != null) {
                return data.maxOrderQuantity >= data.minOrderQuantity;
            }
            return true;
        },
        {
            message: 'الحد الأقصى للطلب يجب أن يكون أكبر من أو يساوي الحد الأدنى',
            path: ['maxOrderQuantity']
        }
    );
};

export const productValidationSchema = applyProductRefines(baseProductSchema);

export const sallaProductSchema = applyProductRefines(
    baseProductSchema.extend({
        variants: z.array(
            z.object({
                id: z.string(),
                sku: z.string().min(1, 'رمز المنتج SKU مطلوب للمتغير'),
                barcode: z.string().min(1, 'الباركود مطلوب للمتغير'),
                price: z.preprocess(
                    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
                    z.number({ message: 'السعر يجب أن يكون رقماً' }).min(0, 'السعر يجب أن يكون موجباً')
                ),
                salePrice: z.preprocess(
                    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
                    z.number({ message: 'السعر المخفض يجب أن يكون رقماً' }).min(0, 'السعر المخفض لا يمكن أن يكون سالباً')
                ),
                costPrice: z.preprocess(
                    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
                    z.number({ message: 'سعر التكلفة يجب أن يكون رقماً' }).min(0, 'سعر التكلفة لا يمكن أن يكون سالباً')
                ),
                quantity: z.preprocess(
                    (val) => (val === '' || val === undefined || val === null ? 0 : Number(val)),
                    z.number().min(0, 'الكمية يجب ألا تكون سالبة')
                ),
                isUnlimited: z.boolean().default(false),
                weight: z.preprocess(
                    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
                    z.number({ message: 'الوزن يجب أن يكون رقماً' }).min(0, 'الوزن لا يمكن أن يكون سالباً')
                ),
                mpn: z.preprocess(
                    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
                    z.number({ message: 'رقم MPN يجب أن يكون رقماً' }).int('يجب أن يكون رقم MPN صحيحاً')
                ),
                gtin: z.preprocess(
                    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
                    z.number({ message: 'رقم GTIN يجب أن يكون رقماً' }).int('يجب أن يكون رقم GTIN صحيحاً')
                ),
                displayName: z.string(),
                attributes: z.array(
                    z.object({
                        id: z.string().optional(),
                        valueId: z.string().optional(),
                        name: z.string().optional(),
                        value: z.string().optional()
                    })
                ).optional().default([]),
                stocks: z.array(
                    z.object({
                        locationId: z.string(),
                        locationName: z.string(),
                        quantity: z.number().min(0).default(0),
                        isUnlimited: z.boolean().default(false)
                    })
                ).default([])
            })
            .refine(
                (v) => {
                    if (v.salePrice != null && v.salePrice !== undefined && v.salePrice > 0) {
                        return v.salePrice < v.price;
                    }
                    return true;
                },
                {
                    message: 'سعر خصم المتغير يجب أن يكون أقل من سعره الأساسي',
                    path: ['salePrice']
                }
            )
        ).default([])
    })
);

export type ProductFormData = z.infer<typeof productValidationSchema>;
