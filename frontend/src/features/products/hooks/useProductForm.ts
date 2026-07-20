import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productValidationSchema } from '../utils/productValidation';
import type { ProductFormData } from '../utils/productValidation';
import { useProductEditStore } from '../store/productEditStore';
import { toast } from 'sonner';

import { ZodError } from 'zod';

// غطاء أمان للتحقق من أخطاء ZodError وتخطي مشكلة الـ instanceof في تعارض التبعيات
const safeZodResolver = (schema: any) => {
  const baseResolver = zodResolver(schema);
  return async (values: any, context: any, options: any) => {
    try {
      return await baseResolver(values, context, options);
    } catch (error: any) {
      if (error && (error instanceof ZodError || error.name === 'ZodError' || error.constructor?.name === 'ZodError')) {
        const formattedErrors: Record<string, any> = {};
        if (Array.isArray(error.issues)) {
          error.issues.forEach((issue: any) => {
            const path = issue.path.join('.');
            formattedErrors[path] = {
              type: issue.code,
              message: issue.message
            };
          });
        }
        return { values: {}, errors: formattedErrors };
      }
      throw error;
    }
  };
};

export function useProductForm() {
  const { unifiedProduct, saveProductData } = useProductEditStore();

  const methods = useForm<ProductFormData>({
    resolver: safeZodResolver(productValidationSchema),
    mode: 'all',
    defaultValues: {
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      shortDescriptionAr: '',
      shortDescriptionEn: '',
      sku: '',
      barcode: '',
      mpn: '',
      gtin: '',
      price: 0,
      costPrice: null,
      salePrice: null,
      isDiscountActive: false,
      discountStart: null,
      discountEnd: null,
      weight: 0,
      isPublished: true,
      requiresShipping: true,
      isTaxable: false,
      categories: [],
      minOrderQuantity: null,
      maxOrderQuantity: null,
      maxItemsPerUser: null,
      seoTitleAr: '',
      seoTitleEn: '',
      seoDescriptionAr: '',
      seoDescriptionEn: '',
      seoSlug: '',
      keywords: [],
      images: [],
      variants: [],
      customOptions: [],
      stocks: []         // مصفوفة المخزون للمنتجات البسيطة (زد)
    }
  });

  useEffect(() => {
    if (unifiedProduct) {
      methods.reset({
        nameAr: unifiedProduct.nameAr || '',
        nameEn: unifiedProduct.nameEn || '',
        descriptionAr: unifiedProduct.descriptionAr || '',
        descriptionEn: unifiedProduct.descriptionEn || '',
        shortDescriptionAr: unifiedProduct.shortDescriptionAr || '',
        shortDescriptionEn: unifiedProduct.shortDescriptionEn || '',
        sku: unifiedProduct.sku || '',
        barcode: unifiedProduct.barcode || '',
        mpn: (unifiedProduct as any).mpn || '',
        gtin: (unifiedProduct as any).gtin || '',
        price: unifiedProduct.price ?? 0,
        costPrice: unifiedProduct.costPrice ?? null,
        salePrice: unifiedProduct.salePrice ?? null,
        isDiscountActive: unifiedProduct.isDiscountActive ?? false,
        discountStart: unifiedProduct.discountStart ?? null,
        discountEnd: unifiedProduct.discountEnd ?? null,
        weight: unifiedProduct.weight ?? 0,
        isPublished: unifiedProduct.isPublished ?? true,
        requiresShipping: unifiedProduct.requiresShipping ?? true,
        isTaxable: unifiedProduct.isTaxable ?? false,
        categories: unifiedProduct.categories || [],
        minOrderQuantity: unifiedProduct.minOrderQuantity ?? null,
        maxOrderQuantity: unifiedProduct.maxOrderQuantity ?? null,
        maxItemsPerUser: (unifiedProduct as any).maxItemsPerUser ?? null,
        seoTitleAr: unifiedProduct.seoTitleAr || '',
        seoTitleEn: unifiedProduct.seoTitleEn || '',
        seoDescriptionAr: unifiedProduct.seoDescriptionAr || '',
        seoDescriptionEn: unifiedProduct.seoDescriptionEn || '',
        seoSlug: unifiedProduct.seoSlug || '',
        keywords: unifiedProduct.keywords || [],
        images: unifiedProduct.images || [],
        variants: unifiedProduct.variants || [],
        customOptions: unifiedProduct.customOptions || [],
        stocks: unifiedProduct.stocks || []   // مخزون المنتج البسيط (زد)
      });
    }
  }, [unifiedProduct, methods]);

  const onFormSubmit = async (data: ProductFormData) => {
    try {
      await saveProductData(data);
    } catch (error: any) {
      // تفكيك أسطر الخطأ لعرضها بشكل منسق في التوست
      const lines = (error.message || '').split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) toast.error(line);
      });
      throw error; // إعادة إلقاء الخطأ حتى تعرف صفحة التعديل أن الحفظ لم يتم بنجاح
    }
  };

  const handleFormSubmit = (onSuccess: (data: ProductFormData) => void) => {
    return methods.handleSubmit(
      onSuccess,
      () => {
        // حذف console.warn الضار وعرض تنبيه منسق للمستخدم
        toast.error(
          'تنبيه: يرجى تصحيح الحقول المحددة باللون الأحمر قبل حفظ التعديلات.',
          { duration: 5000 }
        );
      }
    );
  };

  return { methods, onFormSubmit, handleFormSubmit };
}
