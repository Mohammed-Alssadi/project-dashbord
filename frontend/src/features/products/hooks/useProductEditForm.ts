import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ZidProductDetails } from '../types/product';
import { getDirtyValues } from '../utils/productDiff';
import { productService } from '../services/productService';
import { toast } from 'sonner';

function cleanHtmlDescription(html: string): string {
  if (!html) return '';
  return html
    .replace(/\s*data-[a-zA-Z0-9-]+="[^"]*"/g, '')
    .replace(/\s*data-[a-zA-Z0-9-]+='[^']*'/g, '')
    .replace(/\s*data-[a-zA-Z0-9-]+/g, '');
}

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================
const localizedStringSchema = z.object({
  ar: z.string().optional().default(''),
  en: z.string().optional().default(''),
});

export const productSchema = z.object({
  name: localizedStringSchema,
  slug: z.string().min(1, 'الرابط الدائم (Slug) مطلوب'),
  short_description: localizedStringSchema.optional(),
  description: localizedStringSchema.optional(),
  
  price: z.coerce.number().min(0, 'السعر الأساسي يجب أن يكون 0 أو أكثر'),
  sale_price: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
  cost: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
  is_taxable: z.boolean().default(true),
  
  sku: z.string().optional().default(''),
  barcode: z.string().optional().default(''),
  is_infinite: z.boolean().default(false),
  quantity: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
  requires_shipping: z.boolean().default(true),
  
  weight: z.object({
    value: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
    unit: z.string().default('kg'),
  }).optional(),
  
  is_published: z.boolean().default(true),
  keywords: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) return val;
    return val.split(',').map((k) => k.trim()).filter(Boolean);
  }),
  videos: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) return val;
    return val.split(',').map((v) => v.trim()).filter(Boolean);
  }),
  categories: z.array(z.string()).default([]),
  
  images: z.array(z.object({
    id: z.string(),
    url: z.string()
  })).default([]),
  
  has_options: z.boolean().default(false),
  options: z.array(z.object({
    id: z.string().optional(),
    name: localizedStringSchema,
    choices: z.array(z.object({
      id: z.string().optional(),
      name: localizedStringSchema
    })).default([])
  })).default([]),
  
  variants: z.array(z.object({
    id: z.string().optional(),
    sku: z.string().optional().default(''),
    price: z.coerce.number().min(0),
    sale_price: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
    quantity: z.coerce.number().min(0),
    name: localizedStringSchema.optional(),
    attributes: z.array(z.object({
      name: localizedStringSchema,
      value: localizedStringSchema
    })).optional()
  })).optional(),

  purchase_restrictions: z.object({
    min_quantity_per_cart: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
    max_quantity_per_cart: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
    availability_period_start: z.string().nullable().optional(),
    availability_period_end: z.string().nullable().optional(),
    sale_price_period_start: z.string().nullable().optional(),
    sale_price_period_end: z.string().nullable().optional(),
  }).optional(),

  metafields: z.array(z.object({
    id: z.string(),
    name: localizedStringSchema,
    slug: z.string(),
    data_type: z.string(),
    display_order: z.number().optional(),
    value: z.any().nullable().optional()
  })).default([]),

  custom_user_input_fields: z.array(z.object({
    id: z.string().optional(),
    type: z.string().default('text'),
    label: localizedStringSchema,
    hint: localizedStringSchema.optional(),
    price: z.coerce.number().default(0),
    is_required: z.boolean().default(false),
    display_order: z.coerce.number().optional(),
    choices: z.array(z.object({
      id: z.string().optional(),
      name: localizedStringSchema,
      price: z.coerce.number().default(0)
    })).default([])
  })).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export function useProductEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    selectedProduct, 
    loadingDetail, 
    errorDetail, 
    fetchProductById, 
    updateProduct,
    clearSelectedProduct 
  } = useProductStore();
  
  const { 
    categories: allCategories, 
    fetchCategories 
  } = useCategoryStore();

  const { user } = useAuthStore();
  const platform = (user?.platform as 'salla' | 'zid') || 'zid';
  const [saving, setSaving] = useState(false);
  
  // الاحتفاظ بالقيم الأصلية لتتبع الفروقات والمزامنة الحية
  const [initialCategories, setInitialCategories] = useState<string[]>([]);
  const [initialImages, setInitialImages] = useState<{ id: string; url: string }[]>([]);
  const [initialCustomFields, setInitialCustomFields] = useState<any[]>([]);

  // تهيئة نموذج React Hook Form
  const { 
    register, 
    handleSubmit, 
    control, 
    watch, 
    setValue, 
    reset, 
    formState: { isDirty, dirtyFields } 
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: { ar: '', en: '' },
      slug: '',
      short_description: { ar: '', en: '' },
      description: { ar: '', en: '' },
      price: 0,
      sale_price: null,
      cost: null,
      is_taxable: true,
      sku: '',
      barcode: '',
      is_infinite: false,
      quantity: 0,
      requires_shipping: true,
      weight: { value: null, unit: 'kg' },
      is_published: true,
      keywords: [],
      videos: [],
      categories: [],
      images: [],
      has_options: false,
      options: [],
      variants: [],
      purchase_restrictions: {
        min_quantity_per_cart: null,
        max_quantity_per_cart: null,
        availability_period_start: '',
        availability_period_end: '',
        sale_price_period_start: '',
        sale_price_period_end: '',
      },
      metafields: [],
      custom_user_input_fields: []
    }
  });

  // مراقبة الحقول لضبط العرض الشرطي في الواجهة
  const watchIsInfinite = watch('is_infinite');
  const watchRequiresShipping = watch('requires_shipping');
  const watchVariants = watch('variants') || [];
  const watchCategories = watch('categories') || [];
  const watchIsPublished = watch('is_published');
  const watchImages = watch('images') || [];
  const watchHasOptions = watch('has_options');
  const watchOptions = watch('options') || [];
  
  const watchPurchaseRestrictions = watch('purchase_restrictions');
  const watchMetafields = watch('metafields') || [];
  const watchCustomUserInputFields = watch('custom_user_input_fields') || [];

  // جلب البيانات عند التحميل
  useEffect(() => {
    if (id) {
      fetchProductById(platform, id);
      fetchCategories(platform, 1);
    }
    return () => {
      clearSelectedProduct();
    };
  }, [id, platform, fetchProductById, fetchCategories, clearSelectedProduct]);

  // ملء الحقول بالقيم الحالية فور تحميل المنتج بنجاح
  useEffect(() => {
    if (selectedProduct && platform === 'zid') {
      const zid = selectedProduct as ZidProductDetails;
      
      const loadedCategories = (zid.categories || []).map((c: any) => {
        const catId = c.id || c.category_id || (typeof c === 'object' ? null : c);
        return catId ? String(catId) : '';
      }).filter(Boolean);

      setInitialCategories(loadedCategories);
      
      const formInitValues: any = {
        name: typeof zid.name === 'object'
          ? { ar: zid.name?.ar || '', en: zid.name?.en || '' }
          : { ar: zid.name || '', en: '' },
        slug: zid.slug || '',
        short_description: typeof zid.short_description === 'object'
          ? { ar: cleanHtmlDescription(zid.short_description?.ar || ''), en: cleanHtmlDescription(zid.short_description?.en || '') }
          : { ar: cleanHtmlDescription(zid.short_description || ''), en: '' },
        description: typeof zid.description === 'object'
          ? { ar: cleanHtmlDescription(zid.description?.ar || ''), en: cleanHtmlDescription(zid.description?.en || '') }
          : { ar: cleanHtmlDescription(zid.description || ''), en: '' },
        price: zid.price || 0,
        sale_price: zid.sale_price !== null ? zid.sale_price : '',
        cost: zid.cost !== null ? zid.cost : '',
        is_taxable: zid.is_taxable !== false,
        sku: zid.sku || '',
        barcode: zid.barcode || '',
        is_infinite: !!zid.is_infinite,
        quantity: zid.quantity !== null && zid.quantity !== undefined ? zid.quantity : '',
        requires_shipping: !!zid.requires_shipping,
        weight: {
          value: zid.weight?.value !== null ? zid.weight?.value : '',
          unit: zid.weight?.unit || 'kg'
        },
        is_published: !!zid.is_published,
        keywords: (zid.keywords || []).join(', '),
        videos: (zid.videos || []).join(', '),
        
        categories: loadedCategories,
        
        images: (zid.images || []).map((img: any) => {
          const url = img.url || (typeof img.image === 'object' ? (img.image?.medium || img.image?.large || img.image?.thumbnail) : img.image) || img.image || '';
          return {
            id: String(img.id || Math.random()),
            url: url
          };
        }).filter((img: any) => !!img.url),
        
        has_options: !!zid.has_options,
        options: (zid.options || []).map((opt: any) => ({
          id: opt.id,
          name: typeof opt.name === 'object' 
            ? { ar: opt.name?.ar || '', en: opt.name?.en || '' } 
            : { ar: opt.name || '', en: '' },
          choices: (opt.choices || []).map((ch: any) => ({
            id: ch.id,
            name: typeof ch.name === 'object' 
              ? { ar: ch.name?.ar || '', en: ch.name?.en || '' } 
              : { ar: ch.name || '', en: '' }
          }))
        })),
        
        variants: (zid.variants || []).map((v: any) => {
          const nameAr = (v.attributes || []).map((a: any) => typeof a.value === 'object' ? (a.value.ar || a.value.en) : (a.value || '')).filter(Boolean).join(' / ');
          const nameEn = (v.attributes || []).map((a: any) => typeof a.value === 'object' ? (a.value.en || a.value.ar) : (a.value || '')).filter(Boolean).join(' / ');
          return {
            id: v.id,
            sku: v.sku || '',
            price: v.price || 0,
            sale_price: v.sale_price !== null && v.sale_price !== undefined ? v.sale_price : '',
            quantity: v.quantity !== null && v.quantity !== undefined ? v.quantity : 0,
            name: { ar: nameAr || v.sku || 'متغير', en: nameEn || v.sku || 'Variant' },
            attributes: (v.attributes || []).map((attr: any) => ({
              name: typeof attr.name === 'object' ? attr.name : { ar: attr.name || '', en: '' },
              value: typeof attr.value === 'object' ? attr.value : { ar: attr.value || '', en: '' }
            }))
          };
        }),

        purchase_restrictions: {
          min_quantity_per_cart: zid.purchase_restrictions?.min_quantity_per_cart !== null ? zid.purchase_restrictions?.min_quantity_per_cart : '',
          max_quantity_per_cart: zid.purchase_restrictions?.max_quantity_per_cart !== null ? zid.purchase_restrictions?.max_quantity_per_cart : '',
          availability_period_start: zid.purchase_restrictions?.availability_period_start ? zid.purchase_restrictions.availability_period_start.substring(0, 16) : '',
          availability_period_end: zid.purchase_restrictions?.availability_period_end ? zid.purchase_restrictions.availability_period_end.substring(0, 16) : '',
          sale_price_period_start: zid.purchase_restrictions?.sale_price_period_start ? zid.purchase_restrictions.sale_price_period_start.substring(0, 16) : '',
          sale_price_period_end: zid.purchase_restrictions?.sale_price_period_end ? zid.purchase_restrictions.sale_price_period_end.substring(0, 16) : '',
        },

        metafields: (zid.metafields || []).map((m: any) => ({
          id: m.id,
          name: typeof m.name === 'object' ? { ar: m.name?.ar || '', en: m.name?.en || '' } : { ar: m.name || '', en: '' },
          slug: m.slug || '',
          data_type: m.data_type || 'text',
          display_order: m.display_order || 0,
          value: m.value !== null ? m.value : ''
        })),

        custom_user_input_fields: (zid.custom_user_input_fields || []).map((f: any) => ({
          id: f.id,
          type: f.type || 'text',
          label: typeof f.label === 'object' ? { ar: f.label?.ar || '', en: f.label?.en || '' } : { ar: f.label || '', en: '' },
          hint: typeof f.hint === 'object' ? { ar: f.hint?.ar || '', en: f.hint?.en || '' } : { ar: f.hint || '', en: '' },
          price: f.price || 0,
          is_required: !!f.is_required,
          display_order: f.display_order || 0,
          choices: (f.choices || []).map((ch: any) => ({
            id: ch.id,
            name: typeof ch.name === 'object' ? { ar: ch.name?.ar || '', en: ch.name?.en || '' } : { ar: ch.name || '', en: '' },
            price: ch.price || 0
          }))
        }))
      };
      
      setInitialImages(formInitValues.images);
      setInitialCustomFields(formInitValues.custom_user_input_fields || []);
      reset(formInitValues);
    }
  }, [selectedProduct, platform, reset]);

  // تبديل اختيار تصنيف
  const handleCategoryToggle = (catId: string) => {
    const currentSelected = [...watchCategories];
    const stringCatId = String(catId);
    if (currentSelected.map(String).includes(stringCatId)) {
      setValue('categories', currentSelected.filter(c => String(c) !== stringCatId), { shouldDirty: true });
    } else {
      setValue('categories', [...currentSelected, stringCatId], { shouldDirty: true });
    }
  };

  // حذف صورة
  const handleRemoveImage = (imgId: string) => {
    const currentImages = [...watchImages];
    setValue('images', currentImages.filter(img => img.id !== imgId), { shouldDirty: true });
  };

  // إضافة صورة بالرابط
  const handleAddImageUrl = (url: string) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return;
    const currentImages = [...watchImages];
    setValue('images', [...currentImages, { id: 'new-' + Date.now(), url: trimmed }], { shouldDirty: true });
  };

  // إدارة الخيارات لمتغيرات المنتج
  const handleAddOption = (nameAr: string, nameEn?: string) => {
    const name_ar = nameAr.trim();
    if (!name_ar) return;
    const currentOptions = [...watchOptions];
    setValue('options', [
      ...currentOptions,
      {
        id: 'opt-' + Date.now(),
        name: { ar: name_ar, en: (nameEn || '').trim() },
        choices: []
      }
    ], { shouldDirty: true });
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = [...watchOptions];
    setValue('options', currentOptions.filter((_, idx) => idx !== index), { shouldDirty: true });
  };

  const handleAddChoice = (optionIndex: number, choiceAr: string, choiceEn?: string) => {
    const chAr = choiceAr.trim();
    if (!chAr) return;
    const currentOptions = [...watchOptions];
    const option = currentOptions[optionIndex];
    if (!option) return;
    
    option.choices = [
      ...(option.choices || []),
      {
        id: 'choice-' + Date.now(),
        name: { ar: chAr, en: (choiceEn || '').trim() }
      }
    ];
    setValue('options', currentOptions, { shouldDirty: true });
  };

  const handleRemoveChoice = (optionIndex: number, choiceIndex: number) => {
    const currentOptions = [...watchOptions];
    const option = currentOptions[optionIndex];
    if (!option) return;
    
    option.choices = (option.choices || []).filter((_, idx) => idx !== choiceIndex);
    setValue('options', currentOptions, { shouldDirty: true });
  };

  // توليد المتغيرات تلقائياً
  const handleGenerateVariants = () => {
    const options = watchOptions.filter(o => o.choices && o.choices.length > 0);
    if (options.length === 0) {
      toast.error('يرجى إضافة خيارات وخيارات فرعية أولاً لتوليد المتغيرات');
      return;
    }

    const cartesian = (arrays: any[][]): any[][] => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(d => curr.map(e => [...d, e]));
      }, [[]]);
    };

    const choicesArrays = options.map(o => (o.choices || []).map(ch => ({
      optionName: o.name,
      choiceName: ch.name
    })));

    const combinations = cartesian(choicesArrays);
    const basePrice = watch('price') || 0;

    const generated = combinations.map((combo, idx) => {
      const nameAr = combo.map(c => c.choiceName.ar).join(' / ');
      const nameEn = combo.map(c => c.choiceName.en || c.choiceName.ar).join(' / ');
      const attr = combo.map(c => ({
        name: c.optionName,
        value: c.choiceName
      }));

      return {
        id: 'new-var-' + idx + '-' + Date.now(),
        sku: `${watch('sku') || 'VAR'}-${idx + 1}`,
        price: basePrice,
        sale_price: null,
        quantity: 10,
        attributes: attr,
        name: { ar: nameAr, en: nameEn }
      };
    });

    setValue('variants', generated, { shouldDirty: true });
    toast.success(`تم توليد ${generated.length} متغير تلقائياً!`);
  };

  // إدارة حقول إدخال وخيارات العميل المخصصة (الموحدة)
  const handleAddUserInputField = () => {
    const current = watch('custom_user_input_fields') || [];
    setValue('custom_user_input_fields', [
      ...current,
      {
        id: 'new-input-' + Date.now(),
        type: 'text',
        label: { ar: 'حقل إدخال جديد', en: 'New input field' },
        hint: { ar: '', en: '' },
        price: 0,
        is_required: false,
        display_order: current.length + 1,
        choices: []
      }
    ], { shouldDirty: true });
  };

  const handleRemoveUserInputField = (index: number) => {
    const current = watch('custom_user_input_fields') || [];
    setValue('custom_user_input_fields', current.filter((_, idx) => idx !== index), { shouldDirty: true });
  };

  const handleAddCustomOptionChoice = (fieldIndex: number, nameAr: string, nameEn?: string, price?: number) => {
    const current = watch('custom_user_input_fields') || [];
    const field = current[fieldIndex];
    if (!field) return;

    field.choices = [
      ...(field.choices || []),
      {
        id: 'new-choice-' + Date.now(),
        name: { ar: nameAr.trim(), en: (nameEn || '').trim() },
        price: price || 0
      }
    ];
    setValue('custom_user_input_fields', current, { shouldDirty: true });
  };

  const handleRemoveCustomOptionChoice = (fieldIndex: number, choiceIndex: number) => {
    const current = watch('custom_user_input_fields') || [];
    const field = current[fieldIndex];
    if (!field) return;

    field.choices = (field.choices || []).filter((_, idx) => idx !== choiceIndex);
    setValue('custom_user_input_fields', current, { shouldDirty: true });
  };

  // تقديم النموذج (On Submit)
  const onSubmit = async (data: ProductFormValues) => {
    if (!id || !selectedProduct) return;

    try {
      setSaving(true);

      // 1. التحقق وتصحيح البيانات بواسطة Zod
      const parsedData = productSchema.parse(data);

      // 2. استخراج الحقول المعدلة
      const dirtyPayload = getDirtyValues(dirtyFields, parsedData);

      // 3. معالجة وتمرير الخيارات والمتغيرات
      if (parsedData.has_options) {
        dirtyPayload.has_options = true;
        dirtyPayload.options = parsedData.options.map(opt => ({
          name: opt.name,
          choices: opt.choices.map(ch => ({ name: ch.name }))
        }));
        
        if (parsedData.variants) {
          dirtyPayload.variants = parsedData.variants.map(v => ({
            sku: v.sku,
            price: v.price,
            sale_price: v.sale_price,
            quantity: v.quantity,
            attributes: v.attributes
          }));
        }
      } else {
        if (dirtyFields.has_options) {
          dirtyPayload.has_options = false;
        }
      }

      // 4. مقارنة ومزامنة الصور مع زد عبر نقاط النهاية المخصصة
      const addedImages = parsedData.images.filter(img => img.id.startsWith('new-'));
      const deletedImages = initialImages.filter(origImg => !parsedData.images.some(curImg => curImg.id === origImg.id));
      const hasImagesChanged = addedImages.length > 0 || deletedImages.length > 0;

      if (hasImagesChanged) {
        console.log('Syncing images to Zid directly:', { added: addedImages, deleted: deletedImages });

        for (const img of deletedImages) {
          if (!img.id.startsWith('new-')) {
            try {
              await productService.deleteProductImage(id, img.id);
            } catch (e) {
              console.error(`Error deleting image ${img.id}:`, e);
            }
          }
        }

        for (const img of addedImages) {
          try {
            await productService.uploadImageByUrl(id, img.url);
          } catch (e) {
            console.error(`Error uploading image from URL ${img.url}:`, e);
          }
        }
      }

      // إزالة الصور من بايلود الـ PATCH الرئيسي لأن زد لا يدعم تعديلها هناك
      delete dirtyPayload.images;

      // 5. معالجة قيود الشراء والفترات
      if (dirtyFields.purchase_restrictions && parsedData.purchase_restrictions) {
        const pr = parsedData.purchase_restrictions;
        dirtyPayload.purchase_restrictions = {
          min_quantity_per_cart: pr.min_quantity_per_cart,
          max_quantity_per_cart: pr.max_quantity_per_cart,
          availability_period_start: pr.availability_period_start ? new Date(pr.availability_period_start).toISOString() : null,
          availability_period_end: pr.availability_period_end ? new Date(pr.availability_period_end).toISOString() : null,
          sale_price_period_start: pr.sale_price_period_start ? new Date(pr.sale_price_period_start).toISOString() : null,
          sale_price_period_end: pr.sale_price_period_end ? new Date(pr.sale_price_period_end).toISOString() : null,
        };
      }

      // 6. معالجة الميتا فيلدز (الحقول المخصصة)
      if (dirtyFields.metafields && parsedData.metafields) {
        dirtyPayload.metafields = parsedData.metafields.map(m => ({
          id: m.id,
          value: m.value === '' ? null : m.value
        }));
      }

      // 9. مقارنة ومزامنة حقول وخيارات المستخدم المخصصة مع زد عبر نقاط النهاية المخصصة
      const addedFields = parsedData.custom_user_input_fields.filter(f => !f.id || f.id.startsWith('new-input-'));
      const deletedFields = initialCustomFields.filter(orig => !parsedData.custom_user_input_fields.some(cur => cur.id === orig.id));
      const updatedFields = parsedData.custom_user_input_fields.filter(cur => cur.id && !cur.id.startsWith('new-input-'));

      const hasCustomFieldsChanged = addedFields.length > 0 || deletedFields.length > 0 || updatedFields.length > 0;

      if (hasCustomFieldsChanged) {
        console.log('Syncing custom fields directly:', { added: addedFields, deleted: deletedFields, updated: updatedFields });

        for (const f of deletedFields) {
          if (f.id && !f.id.startsWith('new-input-')) {
            try {
              await productService.deleteCustomField(id, f.id);
            } catch (e) {
              console.error(`Error deleting custom field ${f.id}:`, e);
            }
          }
        }

        for (const f of updatedFields) {
          try {
            const { id: fieldId, ...payload } = f;
            // إزالة حقل الخيارات إذا كان الحقل ليس من نوع اختيار (text/textarea/file) لتنظيف البايلود
            if (payload.type === 'text' || payload.type === 'textarea' || payload.type === 'file') {
              payload.choices = [];
            }
            await productService.updateCustomField(id, fieldId!, payload);
          } catch (e) {
            console.error(`Error updating custom field ${f.id}:`, e);
          }
        }

        for (const f of addedFields) {
          try {
            const { id: _, ...payload } = f;
            if (payload.type === 'text' || payload.type === 'textarea' || payload.type === 'file') {
              payload.choices = [];
            }
            await productService.createCustomField(id, payload);
          } catch (e) {
            console.error(`Error creating custom field:`, e);
          }
        }
      }

      // إزالة الحقل بالكامل من بايلود الـ PATCH الرئيسي للمنتج لتجنب خطأ 400
      delete dirtyPayload.custom_user_input_fields;

      // 8. مقارنة ومزامنة التصنيفات مع زد عبر نقاط النهاية المخصصة
      const addedCategories = parsedData.categories.filter(c => !initialCategories.map(String).includes(String(c)));
      const removedCategories = initialCategories.map(String).filter(c => !parsedData.categories.map(String).includes(String(c)));
      const hasCategoriesChanged = addedCategories.length > 0 || removedCategories.length > 0;

      if (hasCategoriesChanged) {
        console.log('Syncing categories to Zid directly:', { added: addedCategories, removed: removedCategories });

        for (const catId of addedCategories) {
          try {
            await productService.addProductToCategory(id, catId);
          } catch (e) {
            console.error(`Error adding to category ${catId}:`, e);
          }
        }
        for (const catId of removedCategories) {
          try {
            await productService.removeProductFromCategory(id, catId);
          } catch (e) {
            console.error(`Error removing from category ${catId}:`, e);
          }
        }
        
        // تحديث المرجعية المحلية للتصنيفات
        setInitialCategories(parsedData.categories);
      }

      // إزالة الحقل دائماً من بايلود الـ PATCH للمنتج لأن زد لا يدعمها هناك
      delete dirtyPayload.categories;

      if (Object.keys(dirtyPayload).length === 0 && !hasCategoriesChanged && !hasImagesChanged && !hasCustomFieldsChanged) {
        toast.info('لم تقم بتعديل أي حقول لحفظها');
        setSaving(false);
        return;
      }

      // إرسال طلب التعديل الرئيسي للحقول الباقية
      if (Object.keys(dirtyPayload).length > 0) {
        console.log('Sending Zid optimized PATCH payload:', dirtyPayload);
        await updateProduct(platform, id, dirtyPayload);
      }
      
      toast.success('تم حفظ التغييرات بنجاح في زد');
      setInitialImages(parsedData.images);
      setInitialCustomFields(parsedData.custom_user_input_fields);
      reset(data); // إعادة ضبط النموذج بقيم الحفظ الجديدة
      navigate(`/products/${id}`);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0]?.message || 'خطأ في التحقق من صحة المدخلات');
      } else {
        toast.error(err.message || 'حدث خطأ أثناء تعديل المنتج');
      }
    } finally {
      setSaving(false);
    }
  };

  // إلغاء التعديل
  const handleCancel = () => {
    if (isDirty) {
      if (confirm('هل أنت متأكد من إلغاء التعديلات؟ ستفقد كل التغييرات غير المحفوظة.')) {
        navigate(`/products/${id}`);
      }
    } else {
      navigate(`/products/${id}`);
    }
  };

  return {
    id,
    platform,
    selectedProduct,
    loadingDetail,
    errorDetail,
    allCategories,
    saving,
    register,
    handleSubmit,
    control,
    isDirty,
    dirtyFields,
    watchIsInfinite,
    watchRequiresShipping,
    watchVariants,
    watchCategories,
    watchIsPublished,
    watchImages,
    watchHasOptions,
    watchOptions,
    watchPurchaseRestrictions,
    watchMetafields,
    watchCustomUserInputFields,
    handleCategoryToggle,
    handleRemoveImage,
    handleAddImageUrl,
    handleAddOption,
    handleRemoveOption,
    handleAddChoice,
    handleRemoveChoice,
    handleGenerateVariants,
    handleAddUserInputField,
    handleRemoveUserInputField,
    handleAddCustomOptionChoice,
    handleRemoveCustomOptionChoice,
    onSubmit,
    handleCancel
  };
}
