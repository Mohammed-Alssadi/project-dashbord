import type { UnifiedProduct, UnifiedVariant, UnifiedLocationStock, UnifiedCustomOption } from '../types/unifiedProduct';
import { toDateInput } from './functions/toDateInput';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers مشتركة
// ─────────────────────────────────────────────────────────────────────────────

export const safeNumber = (val: any, fallback: number | null = null): number | null => {
    if (val === undefined || val === null || val === '') return fallback;
    const num = Number(val);
    return isNaN(num) ? fallback : num;
};

/**
 * استخراج السعر من سلة — يدعم الرقم المباشر أو { amount, currency }
 */
const extractSallaPrice = (raw: any): number | null => {
    if (raw == null) return null;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'object' && raw.amount != null) {
        const n = Number(raw.amount);
        return isNaN(n) ? null : n;
    }
    const n = Number(raw);
    return isNaN(n) ? null : n;
};

// ─────────────────────────────────────────────────────────────────────────────

export class ProductAdapter {

    // ── تحويل خيارات التخصيص لزد إلى النموذج الموحد ────────────────────────
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

    // ── تحويل بيانات سلة إلى النموذج الموحد ──────────────────────────────────
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
                isMain: img.is_main === true
            }))
            : [];

        // إذا لم تُحدَّد أي صورة رئيسية، نجعل الأولى رئيسية
        const hasMainImage = images.some((img: any) => img.isMain);
        if (images.length > 0 && !hasMainImage) {
            images[0] = { ...images[0], isMain: true };
        }

        const isProductUnlimited = Boolean(rawProduct.unlimited_quantity ?? false);
        const stocks: UnifiedLocationStock[] = Array.isArray(rawProduct.branches_quantities)
            ? rawProduct.branches_quantities.map((bq: any) => ({
                locationId: String(bq.branch_id || bq.branch?.id || bq.id || ''),
                locationName: bq.name ?? bq.branch?.name ?? `فرع ${bq.branch_id || bq.id}`,
                quantity: Number(bq.quantity ?? 0),
                isUnlimited: isProductUnlimited
            }))
            : [];

        const variants: UnifiedVariant[] = Array.isArray(rawProduct.skus)
            ? rawProduct.skus.map((sku: any): UnifiedVariant => {
                let finalOptions: any[] = [];

                // 1. محاولة قراءة الخيارات من related_option_values
                const relOptVals = sku.related_option_values || sku.related_options || sku.option_values;
                if (Array.isArray(relOptVals) && relOptVals.length > 0 && Array.isArray(rawProduct.options)) {
                    const mappedOpts: any[] = [];
                    relOptVals.forEach((valItem: any) => {
                        const valId = typeof valItem === 'object' && valItem !== null
                            ? (valItem.id ?? valItem.value_id ?? valItem.option_value_id ?? valItem.value)
                            : valItem;
                        const valIdStr = String(valId ?? '');

                        let matchedOpt: any = null;
                        let matchedVal: any = null;

                        if (valIdStr && valIdStr !== '[object Object]') {
                            for (const opt of rawProduct.options) {
                                if (Array.isArray(opt.values)) {
                                    const found = opt.values.find((v: any) => String(v.id ?? v.value_id ?? '') === valIdStr);
                                    if (found) {
                                        matchedOpt = opt;
                                        matchedVal = found;
                                        break;
                                    }
                                }
                            }
                        }

                        if (matchedOpt && matchedVal) {
                            mappedOpts.push({
                                id: String(matchedOpt.id),
                                valueId: String(matchedVal.id),
                                name: ProductAdapter.getLocalizedString(matchedOpt.name ?? matchedOpt.title),
                                value: ProductAdapter.getLocalizedString(matchedVal.name ?? matchedVal.display_value ?? matchedVal.value ?? matchedVal)
                            });
                        } else if (typeof valItem === 'object' && valItem !== null) {
                            const optName = ProductAdapter.getLocalizedString(valItem.option_name ?? valItem.option?.name ?? valItem.title ?? '');
                            const valName = ProductAdapter.getLocalizedString(valItem.name ?? valItem.display_value ?? valItem.value ?? valItem.label ?? '');
                            if (valName) {
                                mappedOpts.push({
                                    id: String(valItem.option_id ?? valItem.option?.id ?? `opt-${valIdStr}`),
                                    valueId: String(valItem.id ?? valItem.value_id ?? valIdStr),
                                    name: optName,
                                    value: valName
                                });
                            }
                        }
                    });
                    if (mappedOpts.length > 0) {
                        finalOptions = mappedOpts;
                    }
                }

                // 2. بحث في sku.options أو sku.values أو sku.attributes
                const skuOptionsList = Array.isArray(sku.options) && sku.options.length > 0
                    ? sku.options
                    : Array.isArray(sku.values) && sku.values.length > 0
                        ? sku.values
                        : Array.isArray(sku.attributes) && sku.attributes.length > 0
                            ? sku.attributes
                            : [];

                if (finalOptions.length === 0 && skuOptionsList.length > 0) {
                    const mappedFromSkuOpts: any[] = [];
                    skuOptionsList.forEach((o: any) => {
                        let optionId = String(o.option_id || o.option?.id || '');
                        let valueId = String(o.value_id || o.value?.id || o.id || '');
                        let valueText = ProductAdapter.getLocalizedString(o.value_name || o.value?.name || o.value || o.display_value || o.name || '');
                        let nameText = ProductAdapter.getLocalizedString(o.option_name || o.option?.name || o.name || '');

                        if (Array.isArray(rawProduct.options)) {
                            for (const opt of rawProduct.options) {
                                if (Array.isArray(opt.values)) {
                                    const foundVal = opt.values.find((v: any) =>
                                        String(v.id) === valueId ||
                                        (valueText && ProductAdapter.getLocalizedString(v).trim().toLowerCase() === valueText.trim().toLowerCase())
                                    );
                                    if (foundVal) {
                                        optionId = String(opt.id);
                                        valueId = String(foundVal.id);
                                        if (!nameText) nameText = ProductAdapter.getLocalizedString(opt.name);
                                        if (!valueText) valueText = ProductAdapter.getLocalizedString(foundVal);
                                        break;
                                    }
                                }
                            }
                        }

                        if (valueText || valueId) {
                            mappedFromSkuOpts.push({
                                id: optionId || valueId,
                                valueId: valueId,
                                name: nameText,
                                value: valueText
                            });
                        }
                    });
                    if (mappedFromSkuOpts.length > 0) {
                        finalOptions = mappedFromSkuOpts;
                    }
                }

                // 3. Fallback من displayName فقط — دون مطابقة بالترتيب الأعمى
                const skuDisplayName = ProductAdapter.getLocalizedString(sku.display_name || sku.name || sku.title || '');
                if (finalOptions.length === 0 && skuDisplayName && !skuDisplayName.startsWith('متغير') && Array.isArray(rawProduct.options)) {
                    const parts = skuDisplayName.split(' / ').map((p: string) => p.trim()).filter(Boolean);
                    // نحاول مطابقة كل جزء بخياره الصحيح — وليس بالترتيب الأعمى
                    parts.forEach((partText: string) => {
                        let matchedOptForPart: any = null;
                        let matchedValForPart: any = null;

                        for (const opt of rawProduct.options) {
                            if (Array.isArray(opt.values)) {
                                const v = opt.values.find((val: any) =>
                                    ProductAdapter.getLocalizedString(val).trim().toLowerCase() === partText.toLowerCase()
                                );
                                if (v) {
                                    matchedOptForPart = opt;
                                    matchedValForPart = v;
                                    break;
                                }
                            }
                        }

                        if (matchedOptForPart && matchedValForPart) {
                            finalOptions.push({
                                id: String(matchedOptForPart.id),
                                valueId: String(matchedValForPart.id),
                                name: ProductAdapter.getLocalizedString(matchedOptForPart.name),
                                value: partText
                            });
                        }
                        // نتجاهل الأجزاء التي لا تُطابَق — أفضل من مطابقة خاطئة
                    });
                }

                const attributes = finalOptions.map((o: any) => ({
                    id: String(o.id || o.option_id || ''),
                    valueId: String(o.valueId || o.value?.id || o.value_id || ''),
                    name: ProductAdapter.getLocalizedString(o.name),
                    value: ProductAdapter.getLocalizedString(o.value)
                }));

                // بناء مخزون الفروع للمتغير
                const skuIsUnlimited = Boolean(sku.unlimited_quantity ?? false);
                const variantStocks: UnifiedLocationStock[] = Array.isArray(sku.branches_quantities || sku.quantities)
                    ? (sku.branches_quantities || sku.quantities).map((bq: any) => ({
                        locationId: String(bq.branch_id || bq.branch?.id || bq.branch || bq.id || ''),
                        locationName: bq.name ?? `فرع ${bq.branch_id || bq.id || bq.branch}`,
                        quantity: Number(bq.quantity ?? 0),
                        isUnlimited: skuIsUnlimited
                    }))
                    // Fallback: توزيع متوازن بين الفروع — لا نضع كل الكمية في الفرع الأول
                    : stocks.length > 0
                        ? stocks.map((st) => ({
                            locationId: st.locationId,
                            locationName: st.locationName,
                            quantity: 0,
                            isUnlimited: skuIsUnlimited
                        }))
                        : [];

                return {
                    id: String(sku.id),
                    sku: sku.sku ?? '',
                    barcode: sku.barcode ?? '',
                    mpn: sku.mpn ?? '',
                    gtin: sku.gtin ?? '',
                    price: extractSallaPrice(sku.regular_price ?? sku.price) ?? 0,
                    salePrice: extractSallaPrice(sku.sale_price) || null,
                    costPrice: extractSallaPrice(sku.cost_price) || null,
                    quantity: Number(sku.stock_quantity ?? 0),
                    isUnlimited: skuIsUnlimited,
                    weight: safeNumber(sku.weight, null),
                    displayName: finalOptions.length > 0
                        ? finalOptions.map((o: any) => {
                            const rawVal = o.value;
                            if (typeof rawVal === 'string' && rawVal) return rawVal;
                            if (rawVal && typeof rawVal === 'object') {
                                return rawVal.ar || rawVal.en || rawVal.name || rawVal.display_value || '';
                            }
                            return String(o.valueId || o.id || '');
                        }).filter(Boolean).join(' / ') || sku.sku || `متغير ${sku.id}`
                        : sku.sku || `متغير ${sku.id}`,
                    attributes,
                    stocks: variantStocks
                };
            })
            : [];

        // التحقق من تاريخ انتهاء الخصم لتحديد isDiscountActive بدقة
        const salePriceAmount = extractSallaPrice(rawProduct.sale_price) || null;
        const basePriceAmount = extractSallaPrice(rawProduct.regular_price ?? rawProduct.price) ?? 0;

        const now = new Date();
        const saleEndRaw = rawProduct.sale_end ?? rawProduct.discount_end;
        const saleEndDate = saleEndRaw ? new Date(saleEndRaw) : null;
        // الخصم نشط إذا: السعر المخفض موجود ويزيد عن صفر، ولم ينته تاريخه
        const isDiscountActive = (salePriceAmount !== null && salePriceAmount > 0)
            && (!saleEndDate || saleEndDate > now);

        const minOrderVal = rawProduct.minimum_quantity_per_order !== undefined && rawProduct.minimum_quantity_per_order !== null && rawProduct.minimum_quantity_per_order !== ''
            ? Number(rawProduct.minimum_quantity_per_order)
            : null;

        const maxOrderVal = rawProduct.maximum_quantity_per_order !== undefined && rawProduct.maximum_quantity_per_order !== null && rawProduct.maximum_quantity_per_order !== ''
            ? Number(rawProduct.maximum_quantity_per_order)
            : null;

        const maxItemsPerUserVal = rawProduct.max_items_per_user !== undefined && rawProduct.max_items_per_user !== null && rawProduct.max_items_per_user !== ''
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
            nameEn: typeof rawProduct.name === 'object' ? (rawProduct.name?.en ?? '') : '',
            descriptionAr: rawProduct.description ?? '',
            sku: rawProduct.sku ?? '',
            barcode: rawProduct.barcode ?? '',
            mpn: rawProduct.mpn ?? '',
            gtin: rawProduct.gtin ?? '',
            price: basePriceAmount,
            costPrice: extractSallaPrice(rawProduct.cost_price) || null,
            salePrice: salePriceAmount,
            isDiscountActive,
            discountStart: toDateInput(rawProduct.discount_start ?? rawProduct.sale_start),
            discountEnd: toDateInput(rawProduct.discount_end ?? rawProduct.sale_end),
            isUnlimited: Boolean(rawProduct.unlimited_quantity ?? false),
            quantity: Number(rawProduct.quantity ?? 0),
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
            htmlUrl: rawProduct.urls?.customer ?? rawProduct.url ?? '',
            weightType: rawProduct.weight_type ?? 'kg'
        };
    }

    // ── تحويل بيانات زد إلى النموذج الموحد ───────────────────────────────────
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
                quantity: Number(st.available_quantity ?? 0),
                isUnlimited: Boolean(st.is_infinite ?? false)
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
                        quantity: Number(st.available_quantity ?? 0),
                        isUnlimited: Boolean(st.is_infinite ?? false)
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
                    quantity: Number(v.quantity ?? 0),
                    isUnlimited: Boolean(v.is_infinite ?? false),
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

        const minOrderVal = rawProduct.purchase_restrictions?.min_quantity_per_cart !== undefined && rawProduct.purchase_restrictions?.min_quantity_per_cart !== null && rawProduct.purchase_restrictions?.min_quantity_per_cart !== ''
            ? Number(rawProduct.purchase_restrictions.min_quantity_per_cart)
            : null;

        const maxOrderVal = rawProduct.purchase_restrictions?.max_quantity_per_cart !== undefined && rawProduct.purchase_restrictions?.max_quantity_per_cart !== null && rawProduct.purchase_restrictions?.max_quantity_per_cart !== ''
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
            isUnlimited: Boolean(rawProduct.is_infinite ?? false),
            quantity: Number(rawProduct.quantity ?? 0),
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

    // ── تحويل النموذج الموحد إلى صيغة زد الأساسية ────────────────────────────
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

    // ── تحويل المتغير الفردي لصيغة زد ────────────────────────────────────────
    static toZidVariantPayload(variant: any): any {
        return {
            sku: variant.sku,
            price: variant.price,
            sale_price: variant.salePrice,
            cost: variant.costPrice,
            barcode: variant.barcode,
            weight: variant.weight ? { unit: 'kg', value: variant.weight } : null,
            stocks: Array.isArray(variant.stocks)
                ? variant.stocks.map((st: any) => ({
                    location: st.locationId,
                    available_quantity: st.quantity,
                    is_infinite: Boolean(st.isUnlimited)
                }))
                : []
        };
    }

    // ── تحويل النموذج الموحد إلى صيغة سلة الأساسية ───────────────────────────
    static toSallaBasicPayload(formData: any): any {
        const isSimpleProduct = !formData.variants || formData.variants.length === 0;
        const isUnlimited = Boolean(formData.isUnlimited);

        return {
            name: formData.nameAr,
            description: formData.descriptionAr,
            price: formData.price,
            cost_price: formData.costPrice ?? null,
            sale_price: formData.isDiscountActive ? (formData.salePrice ?? null) : null,
            sale_start: formData.isDiscountActive ? (formData.discountStart ?? null) : null,
            sale_end: formData.isDiscountActive ? (formData.discountEnd ?? null) : null,
            sku: formData.sku,
            barcode: formData.barcode ?? null,
            mpn: formData.mpn ?? null,
            gtin: formData.gtin ?? null,
            status: formData.isPublished ? 'sale' : 'draft',
            require_shipping: formData.requiresShipping,
            with_tax: formData.isTaxable,
            weight: formData.weight,
            weight_type: formData.weightType ?? 'kg',
            // سلة تتوقع categories كـ integers
            categories: Array.isArray(formData.categories)
                ? formData.categories.map((c: any) => Number(c.id)).filter((id: number) => !isNaN(id) && id > 0)
                : [],
            minimum_quantity_per_order: formData.minOrderQuantity ?? null,
            maximum_quantity_per_order: formData.maxOrderQuantity ?? null,
            max_items_per_user: formData.maxItemsPerUser ?? null,
            metadata: {
                title: formData.seoTitleAr ?? '',
                description: formData.seoDescriptionAr ?? ''
            },
            short_link_code: formData.seoSlug ?? null,
            // تطبيع tags — سلة تقبل array of strings فقط
            tags: Array.isArray(formData.keywords)
                ? formData.keywords
                    .map((t: any) => typeof t === 'string' ? t : (t?.name || t?.label || String(t || '')))
                    .filter(Boolean)
                : [],
            // إرسال الكمية للمنتج البسيط فقط (بدون أصناف)
            ...(isSimpleProduct && {
                unlimited_quantity: isUnlimited,
                quantity: isUnlimited ? 0 : Number(formData.quantity ?? 0),
                ...(Array.isArray(formData.stocks) && formData.stocks.length > 0 ? {
                    branches_quantities: formData.stocks.map((st: any) => ({
                        id: st.locationId,
                        quantity: isUnlimited ? 0 : Number(st.quantity ?? 0),
                        unlimited_quantity: isUnlimited
                    }))
                } : {})
            })
        };
    }

    // ── تحويل المتغير الفردي لصيغة سلة ──────────────────────────────────────
    static toSallaVariantPayload(variant: any): any {
        // استخراج IDs قيم الخيارات المرتبطة — يجب أن تكون أرقاماً صحيحة موجبة
        const related_option_values: number[] = Array.isArray(variant.attributes)
            ? variant.attributes
                .map((a: any) => {
                    const vid = a.valueId || a.value_id;
                    const parsed = Number(vid);
                    return !isNaN(parsed) && parsed > 0 ? parsed : null;
                })
                .filter((id: number | null): id is number => id !== null)
            : [];

        if (related_option_values.length === 0 && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
            console.warn('[Salla] Variant missing valid related_option_values — SKU may not link to options:', variant.displayName);
        }

        const payload: Record<string, any> = {
            sku: variant.sku || '',
            price: Number(variant.price) || 0,
            // إرسال unlimited_quantity دائماً — سواء true أو false
            unlimited_quantity: Boolean(variant.isUnlimited),
            // إرسال الكمية مباشرة مع المتغير ليتحدث في سلة
            stock_quantity: variant.isUnlimited ? 0 : (Number(variant.quantity) || 0),
            related_option_values,
        };

        // الحقول الاختيارية — تُرسَل فقط إذا كانت موجودة
        if (variant.barcode) payload.barcode = String(variant.barcode);
        if (variant.mpn) payload.mpn = String(variant.mpn);
        if (variant.gtin) payload.gtin = String(variant.gtin);

        // الوزن مع وحدته
        if (variant.weight != null && variant.weight !== '') {
            payload.weight = Number(variant.weight);
            // إرسال وحدة الوزن إذا كانت متاحة
            if (variant.weightType) {
                payload.weight_type = variant.weightType;
            }
        }

        // cost_price: null لإلغاء التكلفة، رقم موجب لتحديثها
        if (variant.costPrice != null && variant.costPrice !== '' && Number(variant.costPrice) > 0) {
            payload.cost_price = Number(variant.costPrice);
        } else if (variant.costPrice === null || variant.costPrice === 0) {
            payload.cost_price = null; // إرسال null صراحةً لإلغاء التكلفة
        }

        // sale_price: null لإلغاء الخصم، رقم موجب لتفعيله
        if (variant.salePrice != null && variant.salePrice !== '' && Number(variant.salePrice) > 0) {
            payload.sale_price = Number(variant.salePrice);
        } else {
            payload.sale_price = null; // إرسال null صراحةً لإلغاء الخصم
        }

        return payload;
    }
}
