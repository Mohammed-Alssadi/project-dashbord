import { apiClient } from '../../../services/apiClient';

export const productService = {
  /**
   * جلب قائمة المنتجات مع دعم الفلترة والباجينيشن
   * params يأتي جاهزاً من buildProductParams حسب المنصة
   */
  getProducts: async (params?: Record<string, any>): Promise<any> => {
    try {
      const response = await apiClient.get('/api/proxy/products', { params });
      console.log('products', response.data);
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message;
      const message = typeof errMsg === 'object'
        ? (errMsg?.description || errMsg?.name || 'حدث خطأ في الاتصال بالمنصة')
        : (typeof errMsg === 'string' ? errMsg : 'فشل جلب المنتجات من المنصة');
      throw new Error(message);
    }
  },

  /**
   * جلب تفاصيل منتج واحد بالـ ID
   */
  getProductById: async (productId: string | number): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/proxy/products/${productId}`);
      console.log('product', response.data);
      return response.data;
    } catch (error: any) {
      throw new Error('فشل جلب تفاصيل المنتج');
    }
  },

  /**
   * تحديث حقول منتج معين باستخدام PATCH لزد أو سلة
   */
  updateProduct: async (productId: string | number, data: any): Promise<any> => {
    try {
      const response = await apiClient.patch(`/api/proxy/products/${productId}`, data);
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message;
      const message = typeof errMsg === 'object'
        ? (errMsg?.description || errMsg?.name || 'حدث خطأ في الاتصال بالمنصة')
        : (typeof errMsg === 'string' ? errMsg : 'فشل تعديل المنتج في المنصة');
      throw new Error(message);
    }
  },

  addProductToCategory: async (productId: string | number, categoryId: string | number): Promise<any> => {
    try {
      const response = await apiClient.post(`/api/proxy/products/${productId}/categories/`, { id: Number(categoryId) });
      return response.data;
    } catch (error: any) {
      throw new Error('فشل إضافة المنتج إلى القسم');
    }
  },

  removeProductFromCategory: async (productId: string | number, categoryId: string | number): Promise<any> => {
    try {
      const response = await apiClient.delete(`/api/proxy/products/${productId}/categories/${categoryId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error('فشل إزالة المنتج من القسم');
    }
  },

  uploadImageByUrl: async (productId: string | number, imageUrl: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/api/proxy/products/${productId}/images-by-url`, { imageUrl });
      return response.data;
    } catch (error: any) {
      throw new Error('فشل رفع الصورة للمنصة');
    }
  },

  deleteProductImage: async (productId: string | number, imageId: string | number): Promise<any> => {
    try {
      const response = await apiClient.delete(`/api/proxy/products/${productId}/images/${imageId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error('فشل حذف الصورة من المنصة');
    }
  },

  createCustomField: async (productId: string | number, data: any): Promise<any> => {
    try {
      const response = await apiClient.post(`/api/proxy/products/${productId}/custom_user_input_fields/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error('فشل إضافة الحقل المخصص');
    }
  },

  updateCustomField: async (productId: string | number, fieldId: string | number, data: any): Promise<any> => {
    try {
      const response = await apiClient.put(`/api/proxy/products/${productId}/custom_user_input_fields/${fieldId}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error('فشل تحديث الحقل المخصص');
    }
  },

  deleteCustomField: async (productId: string | number, fieldId: string | number): Promise<any> => {
    try {
      const response = await apiClient.delete(`/api/proxy/products/${productId}/custom_user_input_fields/${fieldId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error('فشل حذف الحقل المخصص');
    }
  },
};
