import { apiClient } from '../../../services/apiClient';

export const customerService = {
  /**
   * Fetches customer list from proxy server.
   */
  getCustomers: async (params?: Record<string, any>): Promise<any> => {
    try {
      const response = await apiClient.get('/api/proxy/customers', { params });
      console.log ('customers',response.data)
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب بيانات العملاء من المنصة');
    }
  },

  /**
   * Fetches customer details by ID.
   */
  getCustomerById: async (customerId: string | number, isZid: boolean): Promise<any> => {
    try {
      const url = isZid
        ? `/api/proxy/customers/${customerId}/profile`
        : `/api/proxy/customers/${customerId}`;
      const response = await apiClient.get(url);
      console.log ('customer',response.data)
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل جلب تفاصيل العميل من المنصة');
    }
  }
};
