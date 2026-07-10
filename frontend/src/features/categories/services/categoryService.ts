import { apiClient } from '../../../services/apiClient';

export const categoryService = {
  getCategories: async (params?: Record<string, any>): Promise<any> => {
  try {
      const response = await apiClient.get('/api/proxy/categories', { params });
      console.log('Fetched categories :', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error.response?.data || error.message);
      let errMsg = error.response?.data?.message;
      if (typeof errMsg === 'object' && errMsg !== null) {
         errMsg = errMsg.description || errMsg.name || 'حدث خطأ في الاتصال بالمنصة';
      }
      throw new Error(typeof errMsg === 'string' ? errMsg : 'فشل جلب التصنيفات من المنصة');
    }
  },
  getCategoryDetail: async (id: string | number): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/proxy/categories/${id}`);
      console.log('Fetched category detail:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching category detail ${id}:`, error.response?.data || error.message);
      let errMsg = error.response?.data?.message;
      if (typeof errMsg === 'object' && errMsg !== null) {
         errMsg = errMsg.description || errMsg.name || 'حدث خطأ في الاتصال بالمنصة';
      }
      throw new Error(typeof errMsg === 'string' ? errMsg : 'فشل جلب تفاصيل القسم من المنصة');
    }
  }
};
