import { apiClient } from '../../../services/apiClient';

export const orderService = {
  /**
   * Fetches order list from proxy server.
   */
  getOrders: async (params?: Record<string, any>): Promise<any> => {
    try {
      const response = await apiClient.get('/api/proxy/orders', { params });
      console.log('response.data', response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب بيانات الطلبات من المنصة');
    }
  },

  /**
   * Fetches specific order details.
   */
  getOrderDetails: async (orderId: string | number): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/proxy/orders/${orderId}`);
      console.log('response.data', response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب تفاصيل الطلب من المنصة');
    }
  }
};
