import { apiClient } from '@/services/apiClient';


export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
}

export const dashboardService = {
  async fetchStats(platform: 'zid' | 'salla'): Promise<DashboardStats> {
    try {
      const params = platform === 'salla' ? { per_page: 1, limit: 1 } : { page_size: 1, limit: 1 };

      // 1. Fetch total counts using Promise.allSettled to avoid swallowing errors silently
      const results = await Promise.allSettled([
        apiClient.get('/api/proxy/customers', { params }),
        apiClient.get('/api/proxy/products', { params }),
        apiClient.get('/api/proxy/categories', { params }),
        apiClient.get('/api/proxy/orders', { params }),
      ]);

      // If absolutely all of them failed, throw an error to show the error state in the UI
      if (results.every(r => r.status === 'rejected')) {
        throw new Error('فشل جلب كافة إحصائيات لوحة التحكم، تأكد من اتصالك بالإنترنت');
      }

      const customersData = results[0].status === 'fulfilled' ? results[0].value.data : null;
      const productsData = results[1].status === 'fulfilled' ? results[1].value.data : null;
      const categoriesData = results[2].status === 'fulfilled' ? results[2].value.data : null;
      const ordersData = results[3].status === 'fulfilled' ? results[3].value.data : null;

      const totalCustomers = customersData?.pagination?.totalCount || 0;
      const totalProducts = productsData?.pagination?.totalCount || 0;
      const totalCategories = categoriesData?.pagination?.totalCount || 0;
      
      let totalOrders = 0;
      if (ordersData) {
         if (platform === 'salla' && ordersData.pagination) {
            totalOrders = ordersData.pagination.total || ordersData.pagination.count || 0;
         } else if (platform === 'zid') {
            totalOrders = ordersData.total_orders_count || ordersData.count || ordersData.total || 0;
         }
      }

      return {
        totalCustomers,
        totalProducts,
        totalCategories,
        totalOrders
      };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};
