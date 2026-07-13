import { create } from 'zustand';
import { orderService } from '../services/orderService';
import type { PlatformOrder, SallaOrder, ZidOrder } from '../types/order';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface OrderState {
  orders: PlatformOrder[];
  currentOrderDetails: PlatformOrder | null;
  loadingList: boolean;
  loadingDetails: boolean;
  error: string | null;
  pagination: PaginationMeta;

  fetchOrders: (platform: 'salla' | 'zid', page?: number) => Promise<void>;
  fetchOrderDetails: (platform: 'salla' | 'zid', orderId: string | number) => Promise<void>;
  goToPage: (platform: 'salla' | 'zid', page: number) => void;
  refresh: (platform: 'salla' | 'zid') => void;
  clearCurrentOrder: () => void;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 15,
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrderDetails: null,
  loadingList: true,
  loadingDetails: false,
  error: null,
  pagination: DEFAULT_PAGINATION,

  fetchOrders: async (platform, page = 1) => {
    set({ loadingList: true, error: null });
    try {
      const queryParams: Record<string, any> = { page };
      if (platform === 'salla') {
        queryParams.per_page = 15;
      } else {
        queryParams.page_size = 15;
      }

      const responseData = await orderService.getOrders(queryParams);
      
      const ordersList = responseData?.data || responseData?.orders || responseData?.results || [];
      const parsedOrders = platform === 'salla'
        ? (ordersList as SallaOrder[])
        : (ordersList as ZidOrder[]);

      // Extract Pagination Metadata
      let meta: PaginationMeta = {
        currentPage: page,
        totalPages: 1,
        totalCount: parsedOrders.length,
        perPage: 15,
      };

      if (platform === 'salla' && responseData?.pagination) {
        const p = responseData.pagination;
        meta = {
          currentPage: p.currentPage || page,
          totalPages: p.totalPages || 1,
          totalCount: p.total || parsedOrders.length,
          perPage: p.perPage || 15,
          hasNext: p.currentPage < p.totalPages,
          hasPrev: p.currentPage > 1,
        };
      } else if (platform === 'zid') {
        const totalCount = responseData?.count || responseData?.total_order_count || parsedOrders.length;
        const totalPages = Math.ceil(totalCount / 15);
        meta = {
          currentPage: page,
          totalPages: totalPages || 1,
          totalCount: totalCount,
          perPage: 15,
          hasNext: !!responseData?.next,
          hasPrev: !!responseData?.previous,
        };
      }

      set({
        orders: parsedOrders,
        pagination: meta,
        loadingList: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب الطلبات', loadingList: false });
    }
  },

  fetchOrderDetails: async (platform, orderId) => {
    set({ loadingDetails: true, error: null, currentOrderDetails: null });
    try {
      const responseData = await orderService.getOrderDetails(orderId);
      const listOrder = get().orders.find((o) => String(o.id) === String(orderId));
      
      if (platform === 'salla') {
        const sallaDetails = (responseData?.data || responseData) as SallaOrder;
        
        // Fallback for Salla items if details endpoint has none
        if ((!sallaDetails.items || sallaDetails.items.length === 0) && listOrder) {
          const sallaListOrder = listOrder as SallaOrder;
          if (sallaListOrder.items?.length) {
            sallaDetails.items = sallaListOrder.items;
          }
        }
        
        set({ currentOrderDetails: sallaDetails, loadingDetails: false });
      } else {
        const zidDetails = (responseData?.order || responseData?.data || responseData) as ZidOrder;
        
        // Fallback for Zid products if details endpoint has none
        if ((!zidDetails.products || zidDetails.products.length === 0) && listOrder) {
          const zidListOrder = listOrder as ZidOrder;
          if (zidListOrder.products?.length) {
            zidDetails.products = zidListOrder.products;
          }
        }
        
        set({ currentOrderDetails: zidDetails, loadingDetails: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب تفاصيل الطلب', loadingDetails: false });
    }
  },

  clearCurrentOrder: () => {
    set({ currentOrderDetails: null });
  },

  goToPage: (platform, page) => {
    get().fetchOrders(platform, page);
  },

  refresh: (platform) => {
    get().fetchOrders(platform, get().pagination.currentPage);
  }
}));
