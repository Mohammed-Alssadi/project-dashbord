import type { UnifiedProduct, UnifiedVariant, UnifiedLocationStock, UnifiedCustomOption } from '../types/unifiedProduct';
import { toDateInput } from './functions/toDateInput';

export const safeNumber = (val: any, fallback: number | null = null): number | null => {
  if (val === undefined || val === null || val === '') return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

export class ProductAdapter {

    // ── تحويل خيارات التخصيص لزد إلى النموذج الموحد ────────────────────
    static mapZidCustomOptions(rawOptions: any[]): UnifiedCustomOption[] {
        if (!Array.isArray(rawOptions)) return [];
        return rawOptions.map((opt: any) => {
            const choices = Array.isArray(opt.choices)
                ? opt.choices
                : Array.isArray(opt.options)
                    ? opt.options
                    : [];

            return {
                id: String(opt.id),
                type: opt.type ?? '',
                label: typeof opt.label === 'object'
                    ? (opt.label?.ar || opt.label?.en || '')
                    : (opt.label ?? opt.name ?? ''),
                isRequired: opt.is_required ?? false,
                choices: choices.map((c: any) => ({
                    id: String(c.id),
                    label: typeof c.label === 'object'
                        ? (c.label?.ar || c.label?.en || '')
                        : typeof c.value === 'object'
                            ? (c.value?.ar || c.value?.en || '')
                            : String(c.label ?? c.value ?? c.name ?? '')
                }))
            };
        });
    }

    private static getLocalizedString(val: any): string {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'object') {
            if (typeof val.ar === 'string' && val.ar) return val.ar;
            if (typeof val.en === 'string' && val.en) return val.en;
            if (val.name !== undefined && val.name !== null) {
                return ProductAdapter.getLocalizedString(val.name);
            }
            if (val.display_value !== undefined && val.display_value !== null) {
                return ProductAdapter.getLocalizedString(val.display_value);
            }
            if (val.value !== undefined && val.value !== null) {
                return ProductAdapter.getLocalizedString(val.value);
            }
            const keys = Object.keys(val);
            if (keys.length > 0) {
                return ProductAdapter.getLocalizedString(val[keys[0]]);
            }
        }
        return '';
    }

    // ── تحويل بيانات سلة إلى النموذج الموحد ──────────────────────────────
    static fromSalla(rawProduct: any): UnifiedProduct {

        const categories = Array.isArray(rawProduct.categories)
            ? rawProduct.categories.map((c: any) => ({
                id: String(c.id),
                name: typeof c.name === 'object'
                    ? (c.name?.ar || c.name?.en || String(c.id))
                    : String(c.name ?? c.id)
            }))
            : [];

        const images = Array.isArray(rawProduct.images)
            ? rawProduct.images.map((img: any, idx: number) => ({
                id: String(img.id ?? idx),
                url: img.url ?? img.image_url ?? '',
                isMain: img.is_main || idx === 0
            }))
            : [];

        const stocks: UnifiedLocationStock[] = Array.isArray(rawProduct.branches_quantities)
            ? rawProduct.branches_quantities.map((bq: any) => ({
                locationId: String(bq.id || bq.branch?.id || ''),
                locationName: bq.name ?? bq.branch?.name ?? `فرع ${bq.id}`,
                quantity: bq.quantity ?? 0,
                isUnlimited: rawProduct.unlimited_quantity ?? false
            }))
            : [];

        const variants: UnifiedVariant[] = Array.isArray(rawProduct.skus)
            ? rawProduct.skus.map((sku: any): UnifiedVariant => {
                let finalOptions: any[] = [];

                if (Array.isArray(sku.related_option_values) && sku.related_option_values.length > 0 && Array.isArray(rawProduct.options)) {
                    const mappedOpts: any[] = [];
                    sku.related_option_values.forEach((valId: any) => {
                        const valIdStr = String(valId);
                        rawProduct.options.forEach((opt: any) => {
                            const matchedVal = Array.isArray(opt.values)
                                ? opt.values.find((v: any) => String(v.id) === valIdStr)
                                : null;
                            if (matchedVal) {
                                mappedOpts.push({
                                    id: String(opt.id),
                                    valueId: String(matchedVal.id),
                                    name: opt.name ?? '',
                                    value: matchedVal
                                });
                            }
                        });
                    });
                    finalOptions = mappedOpts;
                }

                if (finalOptions.length === 0 && Array.isArray(sku.options) && sku.options.length > 0) {
                    finalOptions = sku.options;
                }

                const attributes = finalOptions.map((o: any) => {
                    const optionId = String(o.id || o.option_id || '');
                    const valId = String(o.valueId || o.value?.id || o.value_id || '');
                    const valText = ProductAdapter.getLocalizedString(o.value);
                    const nameText = ProductAdapter.getLocalizedString(o.name);
                    return {
                        id: optionId,
                        valueId: valId,
                        name: nameText,
                        value: valText
                    };
                });

                const variantStocks: UnifiedLocationStock[] = Array.isArray(sku.branches_quantities || sku.quantities)
                    ? (sku.branches_quantities || sku.quantities).map((bq: any) => ({
                        locationId: String(bq.id || bq.branch || bq.branch_id || ''),
                        locationName: bq.name ?? `فرع ${bq.id || bq.branch}`,
                        quantity: bq.quantity ?? 0,
                        isUnlimited: sku.unlimited_quantity ?? false
                    }))
                    : stocks.map((st, idx) => ({
                        locationId: st.locationId,
                        locationName: st.locationName,
                        quantity: idx === 0 ? (sku.stock_quantity ?? 0) : 0,
                        isUnlimited: sku.unlimited_quantity ?? false
                    }));

                return {
                    id: String(sku.id),
                    sku: sku.sku ?? '',
                    barcode: sku.barcode ?? '',
                    mpn: sku.mpn ?? '',
                    gtin: sku.gtin ?? '',
                    price: safeNumber(sku.regular_price?.amount ?? sku.regular_price ?? sku.price?.amount ?? sku.price, 0)!,
                    salePrice: safeNumber(sku.sale_price?.amount ?? sku.sale_price, null),
                    costPrice: safeNumber(sku.cost_price?.amount ?? sku.cost_price, null),
                    quantity: sku.stock_quantity ?? 0,
                    isUnlimited: sku.unlimited_quantity ?? false,
                    weight: safeNumber(sku.weight, null),
                    displayName: finalOptions.length > 0
                        ? finalOptions.map((o: any) => o.value || o.name).join(' / ')
                        : sku.sku || `متغير ${sku.id}`,
                    attributes,
                    stocks: variantStocks
                };
            })
            : [];

        const salePriceAmount = safeNumber(rawProduct.sale_price?.amount ?? rawProduct.sale_price, null);
        const basePriceAmount = safeNumber(rawProduct.regular_price?.amount ?? rawProduct.regular_price ?? rawProduct.price?.amount ?? rawProduct.price, 0)!;

        const minOrderVal = rawProduct.minimum_quantity_per_order !== undefined && rawProduct.minimum_quantity_per_order !== null && rawProduct.minimum_quantity_per_order !== ""
            ? Number(rawProduct.minimum_quantity_per_order)
            : null;

        const maxOrderVal = rawProduct.maximum_quantity_per_order !== undefined && rawProduct.maximum_quantity_per_order !== null && rawProduct.maximum_quantity_per_order !== ""
            ? Number(rawProduct.maximum_quantity_per_order)
            : null;

        const maxItemsPerUserVal = rawProduct.max_items_per_user !== undefined && rawProduct.max_items_per_user !== null && rawProduct.max_items_per_user !== ""
            ? Number(rawProduct.max_items_per_user)
            : null;

        const tagsArray = Array.isArray(rawProduct.tags)
            ? rawProduct.tags.map((t: any) => typeof t === 'string' ? t : t.name).filter(Boolean)
            : Array.isArray(rawProduct.keywords)
                ? rawProduct.keywords.filter(Boolean)
                : [];

        return {
            id: String(rawProduct.id),
            nameAr: typeof rawProduct.name === 'object' ? (rawProduct.name?.ar ?? '') : (rawProduct.name ?? ''),
            descriptionAr: rawProduct.description ?? '',
            sku: rawProduct.sku ?? '',
            barcode: rawProduct.barcode ?? '',
            mpn: rawProduct.mpn ?? '',
            gtin: rawProduct.gtin ?? '',
            price: basePriceAmount,
            costPrice: safeNumber(rawProduct.cost_price?.amount ?? rawProduct.cost_price, null),
            salePrice: salePriceAmount,
            isDiscountActive: salePriceAmount !== null && salePriceAmount > 0,
            discountStart: toDateInput(rawProduct.discount_start ?? rawProduct.sale_start),
            discountEnd: toDateInput(rawProduct.discount_end ?? rawProduct.sale_end),
            isUnlimited: rawProduct.unlimited_quantity ?? false,
            quantity: rawProduct.quantity ?? 0,
            weight: safeNumber(rawProduct.weight, 0)!,
            isPublished: rawProduct.status === 'sale',
            requiresShipping: rawProduct.require_shipping ?? true,
            isTaxable: rawProduct.with_tax ?? false,
            categories,
            images,
            stocks,
            variants,
            minOrderQuantity: minOrderVal,
            maxOrderQuantity: maxOrderVal,
            maxItemsPerUser: maxItemsPerUserVal,
            seoTitleAr: rawProduct.metadata?.title ?? '',
            seoDescriptionAr: rawProduct.metadata?.description ?? '',
            seoSlug: rawProduct.short_link_code ?? '',
            keywords: tagsArray,
            platform: 'salla',
            htmlUrl: rawProduct.urls?.customer ?? rawProduct.url ?? ''
        };
    }

    // ── تحويل بيانات زد إلى النموذج الموحد ───────────────────────────────
    static fromZid(rawProduct: any, rawImages: any[] = [], rawCustomOptions: any[] = []): UnifiedProduct {
        const categories = Array.isArray(rawProduct.categories)
            ? rawProduct.categories.map((c: any) => ({
                id: String(c.id),
                name: typeof c.name === 'object' ? (c.name.ar || c.name.en || String(c.id)) : String(c.name)
            }))
            : [];

        const finalRawImages = Array.isArray(rawImages) && rawImages.length > 0
            ? rawImages
            : (Array.isArray(rawProduct.images) ? rawProduct.images : []);

        const unifiedImages = finalRawImages.map((img: any, idx: number) => ({
            id: String(img.id ?? idx),
            url: img.image?.medium ?? img.image_url ?? img.url ?? '',
            isMain: img.is_main || idx === 0
        }));

        const stocks: UnifiedLocationStock[] = Array.isArray(rawProduct.stocks)
            ? rawProduct.stocks.map((st: any) => ({
                locationId: String(st.location?.id || st.location || ''),
                locationName: st.location?.name?.ar ?? st.location?.name?.en ?? `مستودع ${st.location}`,
                quantity: st.available_quantity ?? 0,
                isUnlimited: st.is_infinite ?? false
            }))
            : [];

        const variants: UnifiedVariant[] = Array.isArray(rawProduct.variants)
            ? rawProduct.variants.map((v: any): UnifiedVariant => {
                const attributes = Array.isArray(v.attributes)
                    ? v.attributes.map((a: any) => ({
                        id: a.attribute_id || a.id || '',
                        valueId: a.id || '',
                        name: a.slug ?? a.name ?? '',
                        value: typeof a.value === 'object' ? (a.value.ar || a.value.en || '') : String(a.value ?? '')
                    }))
                    : [];

                const variantStocks: UnifiedLocationStock[] = Array.isArray(v.stocks) && v.stocks.length > 0
                    ? v.stocks.map((st: any) => ({
                        locationId: String(st.location?.id || st.location || ''),
                        locationName: st.location?.name?.ar ?? st.location?.name?.en ?? `مستودع ${st.location}`,
                        quantity: st.available_quantity ?? 0,
                        isUnlimited: st.is_infinite ?? false
                    }))
                    : stocks.map(st => ({
                        locationId: st.locationId,
                        locationName: st.locationName,
                        quantity: 0,
                        isUnlimited: false
                    }));

                return {
                    id: String(v.id),
                    sku: v.sku ?? '',
                    barcode: v.barcode ?? '',
                    price: safeNumber(v.price, 0)!,
                    salePrice: safeNumber(v.sale_price, null),
                    costPrice: safeNumber(v.cost, null),
                    quantity: v.quantity ?? 0,
                    isUnlimited: v.is_infinite ?? false,
                    weight: safeNumber(v.weight?.value ?? v.weight, null),
                    displayName: Array.isArray(v.attributes)
                        ? v.attributes.map((a: any) => typeof a.value === 'object' ? (a.value.ar || a.value.en || '') : String(a.value)).join(' / ')
                        : v.sku || `متغير ${v.id}`,
                    attributes,
                    stocks: variantStocks
                };
            })
            : [];

        const salePrice = safeNumber(rawProduct.sale_price, null);

        const minOrderVal = rawProduct.purchase_restrictions?.min_quantity_per_cart !== undefined && rawProduct.purchase_restrictions?.min_quantity_per_cart !== null && rawProduct.purchase_restrictions?.min_quantity_per_cart !== ""
            ? Number(rawProduct.purchase_restrictions.min_quantity_per_cart)
            : null;

        const maxOrderVal = rawProduct.purchase_restrictions?.max_quantity_per_cart !== undefined && rawProduct.purchase_restrictions?.max_quantity_per_cart !== null && rawProduct.purchase_restrictions?.max_quantity_per_cart !== ""
            ? Number(rawProduct.purchase_restrictions.max_quantity_per_cart)
            : null;

        const keywordsArray = Array.isArray(rawProduct.keywords)
            ? rawProduct.keywords.filter(Boolean)
            : [];

        return {
            id: String(rawProduct.id),
            nameAr: typeof rawProduct.name === 'object' ? (rawProduct.name?.ar ?? '') : (rawProduct.name ?? ''),
            nameEn: typeof rawProduct.name === 'object' ? (rawProduct.name?.en ?? '') : '',
            descriptionAr: typeof rawProduct.description === 'object' ? (rawProduct.description?.ar ?? '') : (rawProduct.description ?? ''),
            descriptionEn: typeof rawProduct.description === 'object' ? (rawProduct.description?.en ?? '') : '',
            shortDescriptionAr: typeof rawProduct.short_description === 'object' ? (rawProduct.short_description?.ar ?? '') : (rawProduct.short_description ?? ''),
            shortDescriptionEn: typeof rawProduct.short_description === 'object' ? (rawProduct.short_description?.en ?? '') : '',
            sku: rawProduct.sku ?? '',
            barcode: rawProduct.barcode ?? '',
            price: safeNumber(rawProduct.price, 0)!,
            costPrice: safeNumber(rawProduct.cost, null),
            salePrice,
            isDiscountActive: salePrice !== null && salePrice > 0,
            discountStart: toDateInput(rawProduct.purchase_restrictions?.sale_price_period_start),
            discountEnd: toDateInput(rawProduct.purchase_restrictions?.sale_price_period_end),
            isUnlimited: rawProduct.is_infinite ?? false,
            quantity: rawProduct.quantity ?? 0,
            weight: safeNumber(rawProduct.weight?.value ?? rawProduct.weight, 0)!,
            isPublished: rawProduct.is_published ?? true,
            requiresShipping: rawProduct.requires_shipping ?? true,
            isTaxable: rawProduct.is_taxable ?? false,
            categories,
            images: unifiedImages,
            stocks,
            variants,
            customOptions: ProductAdapter.mapZidCustomOptions(rawCustomOptions),
            minOrderQuantity: minOrderVal,
            maxOrderQuantity: maxOrderVal,
            seoTitleAr: rawProduct.seo?.title?.ar ?? '',
            seoTitleEn: rawProduct.seo?.title?.en ?? '',
            seoDescriptionAr: rawProduct.seo?.description?.ar ?? '',
            seoDescriptionEn: rawProduct.seo?.description?.en ?? '',
            seoSlug: rawProduct.slug ?? '',
            keywords: keywordsArray,
            platform: 'zid',
            htmlUrl: rawProduct.html_url ?? ''
        };
    }

    // ── تحويل النموذج الموحد إلى صيغة سلة للطلب الإرسال ────────────────────
    static toSallaPayload(unified: UnifiedProduct): any {
        return {
            name: unified.nameAr,
            description: unified.descriptionAr,
            price: unified.price,
            cost_price: unified.costPrice,
            sale_price: unified.isDiscountActive ? unified.salePrice : null,
            sale_start: unified.isDiscountActive ? unified.discountStart : null,
            sale_end: unified.isDiscountActive ? unified.discountEnd : null,
            sku: unified.sku,
            barcode: unified.barcode,
            status: unified.isPublished ? 'sale' : 'draft',
            require_shipping: unified.requiresShipping,
            with_tax: unified.isTaxable,
            weight: unified.weight,
            categories: unified.categories.map(c => String(c.id)),
            branches_quantities: unified.stocks.map(st => ({
                id: st.locationId,
                quantity: st.quantity
            })),
            minimum_quantity_per_order: unified.minOrderQuantity,
            maximum_quantity_per_order: unified.maxOrderQuantity,
            metadata: {
                title: unified.seoTitleAr,
                description: unified.seoDescriptionAr
            },
            short_link_code: unified.seoSlug,
            tags: unified.keywords,
            skus: unified.variants.map(v => ({
                id: v.id,
                sku: v.sku,
                barcode: v.barcode,
                price: v.price,
                sale_price: v.salePrice,
                cost_price: v.costPrice,
                stock_quantity: v.quantity,
                unlimited_quantity: v.isUnlimited,
                weight: v.weight,
                quantities: v.stocks.map(st => ({
                    branch: Number(st.locationId),
                    quantity: st.quantity,
                    reason_id: 303342349
                }))
            }))
        };
    }

    // ── تحويل النموذج الموحد إلى صيغة زد للطلب الإرسال ─────────────────────
    static toZidPayload(unified: UnifiedProduct): { basic: any; variants: any } {
        const basic = {
            name: {
                ar: unified.nameAr,
                en: unified.nameEn ?? ''
            },
            description: {
                ar: unified.descriptionAr,
                en: unified.descriptionEn ?? ''
            },
            short_description: {
                ar: unified.shortDescriptionAr ?? '',
                en: unified.shortDescriptionEn ?? ''
            },
            price: unified.price,
            sale_price: unified.isDiscountActive ? unified.salePrice : null,
            cost: unified.costPrice,
            barcode: unified.barcode,
            sku: unified.sku,
            is_published: unified.isPublished,
            requires_shipping: unified.requiresShipping,
            is_taxable: unified.isTaxable,
            weight: {
                unit: 'kg',
                value: unified.weight
            },
            categories: unified.categories.map(c => Number(c.id)),
            stocks: unified.stocks.map(st => ({
                location: st.locationId,
                available_quantity: st.quantity,
                is_infinite: st.isUnlimited
            })),
            purchase_restrictions: {
                min_quantity_per_cart: unified.minOrderQuantity,
                max_quantity_per_cart: unified.maxOrderQuantity,
                sale_price_period_start: unified.discountStart,
                sale_price_period_end: unified.discountEnd
            },
            seo: {
                title: {
                    ar: unified.seoTitleAr,
                    en: unified.seoTitleEn ?? ''
                },
                description: {
                    ar: unified.seoDescriptionAr,
                    en: unified.seoDescriptionEn ?? ''
                }
            },
            slug: unified.seoSlug,
            keywords: unified.keywords
        };

        const variants = {
            variants: unified.variants.map(v => ({
                id: v.id,
                sku: v.sku,
                price: v.price,
                sale_price: v.salePrice,
                cost: v.costPrice,
                barcode: v.barcode,
                stocks: v.stocks.map(st => ({
                    location: st.locationId,
                    available_quantity: st.quantity,
                    is_infinite: st.isUnlimited
                })),
                weight: {
                    unit: 'kg',
                    value: v.weight
                }
            }))
        };

        return { basic, variants };
    }

    // ── تحويل بيانات النموذج إلى صيغة زد الأساسية ────────────────────────
    static toZidBasicPayload(formData: any): any {
        return {
            name: {
                ar: formData.nameAr,
                en: formData.nameEn ?? ''
            },
            description: {
                ar: formData.descriptionAr,
                en: formData.descriptionEn ?? ''
            },
            short_description: {
                ar: formData.shortDescriptionAr ?? '',
                en: formData.shortDescriptionEn ?? ''
            },
            price: formData.price,
            sale_price: formData.isDiscountActive ? formData.salePrice : null,
            cost: formData.costPrice,
            barcode: formData.barcode,
            sku: formData.sku,
            is_published: formData.isPublished,
            requires_shipping: formData.requiresShipping,
            is_taxable: formData.isTaxable,
            weight: {
                unit: 'kg',
                value: formData.weight
            },
            stocks: (formData.variants.length === 0 && formData.stocks && formData.stocks.length > 0)
                ? formData.stocks.map((st: any) => ({
                    location: st.locationId,
                    available_quantity: st.quantity,
                    is_infinite: st.isUnlimited
                }))
                : [],
            purchase_restrictions: {
                min_quantity_per_cart: formData.minOrderQuantity,
                max_quantity_per_cart: formData.maxOrderQuantity,
                sale_price_period_start: formData.discountStart,
                sale_price_period_end: formData.discountEnd
            },
            seo: {
                title: {
                    ar: formData.seoTitleAr ?? '',
                    en: formData.seoTitleEn ?? ''
                },
                description: {
                    ar: formData.seoDescriptionAr ?? '',
                    en: formData.seoDescriptionEn ?? ''
                }
            },
            slug: formData.seoSlug,
            keywords: formData.keywords
        };
    }

    // ── تحويل المتغير الفردي لصيغة زد ───────────────────────────────────────
    static toZidVariantPayload(variant: any): any {
        return {
            sku: variant.sku,
            price: variant.price,
            sale_price: variant.salePrice,
            cost: variant.costPrice,
            barcode: variant.barcode,
            weight: variant.weight ? { unit: 'kg', value: variant.weight } : null,
            stocks: variant.stocks.map((st: any) => ({
                location: st.locationId,
                available_quantity: st.quantity,
                is_infinite: st.isUnlimited
            }))
        };
    }

    // ── تحويل بيانات النموذج إلى صيغة سلة الأساسية ───────────────────────
    static toSallaBasicPayload(formData: any): any {
        return {
            name: formData.nameAr,
            description: formData.descriptionAr,
            price: formData.price,
            cost_price: formData.costPrice,
            sale_price: formData.isDiscountActive ? formData.salePrice : null,
            sale_start: formData.isDiscountActive ? formData.discountStart : null,
            sale_end: formData.isDiscountActive ? formData.discountEnd : null,
            sku: formData.sku,
            barcode: formData.barcode,
            mpn: formData.mpn,
            gtin: formData.gtin,
            status: formData.isPublished ? 'sale' : 'draft',
            require_shipping: formData.requiresShipping,
            with_tax: formData.isTaxable,
            weight: formData.weight,
            categories: formData.categories.map((c: any) => String(c.id)),
            minimum_quantity_per_order: formData.minOrderQuantity,
            maximum_quantity_per_order: formData.maxOrderQuantity,
            max_items_per_user: formData.maxItemsPerUser,
            metadata: {
                title: formData.seoTitleAr ?? '',
                description: formData.seoDescriptionAr ?? ''
            },
            short_link_code: formData.seoSlug,
            tags: formData.keywords,
            ...(formData.variants.length === 0 && formData.stocks ? {
                branches_quantities: formData.stocks.map((st: any) => ({
                    id: st.locationId,
                    quantity: st.quantity
                }))
            } : {})
        };
    }

    // ── تحويل المتغير الفردي لصيغة سلة ──────────────────────────────────────
    static toSallaVariantPayload(variant: any): any {
        return {
            sku: variant.sku,
            barcode: variant.barcode,
            mpn: variant.mpn,
            gtin: variant.gtin,
            price: variant.price,
            cost_price: variant.costPrice,
            sale_price: variant.salePrice,
            weight: variant.weight
        };
    }
}
