import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useProductEditStore } from '../store/productEditStore';
import { productEditService } from '../services/productEditService';
import { toast } from 'sonner';

/**
 * خطاك مخصص (Custom Hook) لعزل المنطق البرمجي لقسم المعلومات الأساسية.
 * يدير هذا الخطاف:
 * 1. رفع الصور لزد وسلة مع ترويسة alt_text ديناميكية للسيو (SEO)
 * 2. حذف الصور وتحديث تعيين الصورة الرئيسية
 * 3. تصفية واختيار التصنيفات والأقسام المتعددة للمنتج
 *
 * @returns كائن يحتوي على الحالات والدوال اللازمة لواجهة العرض
 */
export function useProductBasicInfo() {
  const { categories: availableCategories, unifiedProduct, platform } = useProductEditStore();
  const { setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!unifiedProduct) {
    return {
      safeImages: [],
      selectedCategories: [],
      selectedCategoryIds: [],
      categoriesList: [],
      isUploading: false,
      fileInputRef,
      handleImageUpload: async () => {},
      handleDeleteImage: async () => {},
      handleSetMainImage: () => {},
      handleCategoryToggle: () => {},
      platform: null,
    };
  }

  // تحويل الأقسام المتاحة بالمتجر لهيكل مقروء بالواجهة
  const categoriesList = availableCategories.map((c: any) => ({
    id: String(c.id),
    label: typeof c.name === 'object'
      ? (c.name?.ar || c.name?.en || String(c.id))
      : String(c.name ?? c.id),
  }));

  const selectedCategories: Array<{ id: string; name: string }> = watch('categories') || [];
  const safeImages: Array<{ id: string; url: string; isMain: boolean }> = watch('images') || [];
  const selectedCategoryIds = selectedCategories.map(c => String(c.id));

  // اختيار وإلغاء اختيار التصنيف
  const handleCategoryToggle = (id: string) => {
    const isSelected = selectedCategoryIds.includes(id);
    const updatedIds = isSelected
      ? selectedCategoryIds.filter(cId => cId !== id)
      : [...selectedCategoryIds, id];

    const newCategories = updatedIds.map(selectedId => {
      const match = availableCategories.find((c: any) => String(c.id) === selectedId);
      const name = match
        ? (typeof match.name === 'object' ? (match.name.ar || match.name.en || '') : String(match.name))
        : `تصنيف ${selectedId}`;
      return { id: selectedId, name };
    });

    setValue('categories', newCategories, { shouldValidate: true, shouldDirty: true });
  };

  // رفع الصورة مع النص البديل (alt_text) الذكي المعتمد على اسم المنتج
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const productName = watch('nameAr') || unifiedProduct.nameAr || 'منتج';
    const altText = `صورة منتج ${productName}`;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt_text', altText);

    setIsUploading(true);
    try {
      const res = await productEditService.uploadProductImage(unifiedProduct.id, formData, platform ?? 'salla');
      
      const innerData = res.data || res;
      let imageUrl = '';

      if (innerData) {
        if (typeof innerData.url === 'string') {
          imageUrl = innerData.url;
        } else if (innerData.image) {
          if (typeof innerData.image === 'string') {
            imageUrl = innerData.image;
          } else if (typeof innerData.image === 'object') {
            imageUrl = innerData.image.medium || innerData.image.large || innerData.image.thumbnail || '';
          }
        } else if (typeof innerData.image_url === 'string') {
          imageUrl = innerData.image_url;
        } else if (typeof innerData.url === 'object' && innerData.url?.medium) {
          imageUrl = innerData.url.medium;
        }
      }

      if (!imageUrl && typeof res.url === 'string') {
        imageUrl = res.url;
      }
      
      if (imageUrl) {
        const newImage = {
          id: res.data?.id ? String(res.data.id) : `img-${Date.now()}`,
          url: imageUrl,
          isMain: safeImages.length === 0
        };
        setValue('images', [...safeImages, newImage], { shouldDirty: true });
        toast.success('تم رفع الصورة بنجاح');
      } else {
        toast.error('فشل الحصول على رابط الصورة المرتجع');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('حدث خطأ أثناء رفع الصورة للمنصة');
    } finally {
      setIsUploading(false);
    }
  };

  // حذف صورة من المنصة ومحلياً
  const handleDeleteImage = async (imageId: string) => {
    try {
      await productEditService.deleteProductImage(unifiedProduct.id, imageId, unifiedProduct.platform);
    } catch (e) {
      console.warn('Failed to delete image from platform CDN, removing locally.', e);
    }

    const updatedImages = safeImages.filter(img => img.id !== imageId);
    if (safeImages.find(img => img.id === imageId)?.isMain && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }
    setValue('images', updatedImages, { shouldDirty: true });
    toast.success('تم حذف الصورة');
  };

  // تعيين صورة رئيسية
  const handleSetMainImage = (imageId: string) => {
    const updatedImages = safeImages.map(img => ({
      ...img,
      isMain: img.id === imageId
    }));
    setValue('images', updatedImages, { shouldDirty: true });
    toast.success('تم تحديد الصورة الرئيسية للمنتج');
  };

  return {
    safeImages,
    selectedCategories,
    selectedCategoryIds,
    categoriesList,
    isUploading,
    fileInputRef,
    handleImageUpload,
    handleDeleteImage,
    handleSetMainImage,
    handleCategoryToggle,
    platform,
  };
}
