import { apiClient } from '../../../services/apiClient';

export const productEditService = {
  /** جلب بيانات المنتج الأساسية */
  fetchProductBasicInfo: async (productId: string | number) => {
    const response = await apiClient.get(`/api/proxy/products/${productId}`);
    return response.data;
  },

  /** جلب صور المنتج — زد فقط (سلة مدمجة في المنتج) */
  fetchProductImages: async (productId: string | number) => {
    const response = await apiClient.get(`/api/proxy/products/${productId}/images/`);
    return response.data;
  },

  /** جلب المتغيرات (Variants) للمنتج — غير مستخدمة حالياً (مدمجة في المنتج) */
  fetchProductVariants: async (productId: string | number) => {
    const response = await apiClient.get(`/api/proxy/products/${productId}/variants/`);
    return response.data;
  },

  /** جلب حقول التخصيص — زد فقط */
  fetchProductCustomOptions: async (productId: string | number) => {
    const response = await apiClient.get(`/api/proxy/products/${productId}/custom_options_fields/`);
    return response.data;
  },

  /** جلب حقول إدخال المستخدم المخصصة — زد فقط */
  fetchProductCustomUserInputFields: async (productId: string | number) => {
    const response = await apiClient.get(`/api/proxy/products/${productId}/custom_user_input_fields/`);
    return response.data;
  },

  /** جلب صفات المتجر (اللون، المقاس…) — زد فقط */
  fetchAttributes: async () => {
    const response = await apiClient.get('/api/proxy/attributes/');
    return response.data;
  },

  /** إنشاء صفة متجر جديدة (زد) */
  createStoreAttribute: async (payload: any) => {
    const response = await apiClient.post('/api/proxy/attributes/', payload);
    return response.data;
  },

  /** إضافة قيمة خيار مسبقة لصفة المتجر (Preset) - زد */
  createAttributePreset: async (attributeId: string | number, payload: any) => {
    const response = await apiClient.post(`/api/proxy/attributes/${attributeId}/presets/`, payload);
    return response.data;
  },

  /** جلب شارات المتجر — زد فقط */
  fetchBadges: async () => {
    const response = await apiClient.get('/api/proxy/badges/');
    return response.data;
  },

  /** جلب تصنيفات المتجر — سلة وزد */
  fetchCategories: async () => {
    const response = await apiClient.get('/api/proxy/categories');
    return response.data;
  },

  /** تحديث بيانات المنتج الأساسية */
  updateProductBasicInfo: async (productId: string | number, payload: any, platform: 'salla' | 'zid') => {
    if (platform === 'zid') {
      const response = await apiClient.patch(`/api/proxy/products/${productId}`, payload);
      return response.data;
    } else {
      const response = await apiClient.put(`/api/proxy/products/${productId}`, payload);
      return response.data;
    }
  },

  /** تحديث متغير فرعي فردي (زد أو سلة) */
  updateProductVariant: async (productId: string | number, variantId: string | number, payload: any, platform: 'salla' | 'zid') => {
    if (platform === 'zid') {
      const response = await apiClient.patch(`/api/proxy/products/${productId}/variants/${variantId}`, payload);
      return response.data;
    } else {
      const response = await apiClient.put(`/api/proxy/products/variants/${variantId}`, payload);
      return response.data;
    }
  },

  /** إنشاء متغير فرعي جديد */
  createProductVariant: async (productId: string | number, payload: any) => {
    const finalPayload = Array.isArray(payload) ? payload : [payload];
    const response = await apiClient.post(`/api/proxy/products/${productId}/variants`, finalPayload);
    return response.data;
  },

  deleteProductVariant: async (productId: string | number, variantId: string | number, _platform: 'salla' | 'zid') => {
    const response = await apiClient.delete(`/api/proxy/products/${productId}/variants/${variantId}`);
    return response.data;
  },

  /** تحديث كميات الفروع لمتغير فرعي (سلة فقط) */
  // إصلاح #2: سلة تتوقع مصفوفة مباشرة وليس { quantities: [...] }
  updateSallaVariantQuantities: async (variantId: string | number, payload: any[]) => {
    const response = await apiClient.put(
      `/api/proxy/products/variants/${variantId}/quantities`,
      payload
    );
    return response.data;
  },

  /** إنشاء خيار/خاصية جديدة للمنتج */
  createProductOption: async (productId: string | number, payload: any, platform: 'salla' | 'zid' = 'salla') => {
    if (platform === 'zid') {
      const finalPayload = Array.isArray(payload) ? payload : [payload];
      const response = await apiClient.post(`/api/proxy/products/${productId}/options`, finalPayload);
      return response.data;
    } else {
      // سلة تتوقع كائناً واحداً للطلب ولا تدعم التغليف بمصفوفة
      const finalPayload = Array.isArray(payload) ? payload[0] : payload;
      const response = await apiClient.post(`/api/proxy/products/${productId}/options`, finalPayload);
      return response.data;
    }
  },

  /** إضافة قيمة لخيار قائم (سلة فقط) */
  createProductOptionValue: async (
    _productId: string | number,
    optionId: string | number,
    payload: any,
    _existingValues: any[] = []
  ) => {
    const response = await apiClient.post(
      `/api/proxy/products/options/${optionId}`,
      {
        name: payload.name,
        color: payload.color || undefined,
        display_value: payload.display_value || payload.color || payload.name || undefined
      }
    );
    return response.data;
  },

  /** حذف خيار منتج (سلة فقط) */
  // إصلاح #6: سلة تتوقع product_id في المسار: /products/{product_id}/options/{option_id}
  deleteProductOption: async (
    _productId: string | number,
    optionId: string | number,
    platform: 'salla' | 'zid'
  ) => {
    if (platform === 'zid') {
      return { success: true };
    } else {
      // سلة تتوقع حذف الخيار مباشرة عبر المسار: /products/options/{option_id}
      const response = await apiClient.delete(
        `/api/proxy/products/options/${optionId}`
      );
      return response.data;
    }
  },

  /** رفع صورة للمنتج مباشرة إلى خوادم المنصة */
  uploadProductImage: async (productId: string | number, formData: FormData, platform: 'zid' | 'salla' = 'salla') => {
    if (platform === 'zid') {
      // زد: نستخدم endpoint مخصص يتجاوز قيود الـ JSON proxy ويرسل multipart/form-data مباشرة
      const response = await apiClient.post(`/api/upload/zid/products/${productId}/images`, formData);
      return response.data;
    } else {
      // سلة: نستخدم أيضاً الـ endpoint المخصص المضاف حديثاً لتجاوز مشاكل الـ Proxy ورفع photo
      const response = await apiClient.post(`/api/upload/salla/products/${productId}/images`, formData);
      return response.data;
    }
  },

  /** حذف صورة منتج */
  deleteProductImage: async (productId: string | number, imageId: string | number, platform: 'salla' | 'zid') => {
    if (platform === 'zid') {
      const response = await apiClient.delete(`/api/proxy/products/${productId}/images/${imageId}`);
      return response.data;
    } else {
      // إصلاح #58: سلة تتوقع product_id في مسار حذف الصورة
      const response = await apiClient.delete(
        `/api/proxy/products/${productId}/images/${imageId}`
      );
      return response.data;
    }
  },

  /** ربط منتج بقسم (تصنيف) - زد فقط — يتوقع زد الحقل باسم { id } */
  addProductCategory: async (productId: string | number, categoryId: number) => {
    const response = await apiClient.post(`/api/proxy/products/${productId}/categories`, { id: categoryId });
    return response.data;
  },

  /** فصل منتج عن قسم (تصنيف) - زد فقط */
  removeProductCategory: async (productId: string | number, categoryId: number) => {
    const response = await apiClient.delete(`/api/proxy/products/${productId}/categories/${categoryId}`);
    return response.data;
  },

  /** جلب قائمة أسباب تعديل الكميات (سلة فقط) */
  getSallaQuantityChangeReasons: async () => {
    const response = await apiClient.get('/api/proxy/products/quantities/quantity-change-reason');
    return response.data;
  }
};
