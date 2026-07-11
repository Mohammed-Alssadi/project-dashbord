import { create } from 'zustand';
import type { UnifiedOrder, UnifiedOrderDetails } from '../adapters/orderAdapter';
import { adaptSallaOrder, adaptZidOrder, adaptSallaOrderDetails, adaptZidOrderDetails } from '../adapters/orderAdapter';
import { orderService } from '../services/orderService';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

interface OrderState {
  orders: UnifiedOrder[];
  currentOrderDetails: UnifiedOrderDetails | null;
  loadingList: boolean;
  loadingDetails: boolean;
  error: string | null;
  pagination: PaginationMeta;

  fetchOrders: (page?: number, platform?: 'salla' | 'zid') => Promise<void>;
  fetchOrderDetails: (orderId: string | number, platform?: 'salla' | 'zid') => Promise<void>;
  goToPage: (page: number, platform?: 'salla' | 'zid') => void;
  refresh: (platform?: 'salla' | 'zid') => void;
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

  fetchOrders: async (page = 1, platform = 'salla') => {
    set({ loadingList: true, error: null });
    try {
      const responseData = await orderService.getOrders({ page });
      
      let unifiedOrders: UnifiedOrder[] = [];
      const ordersList = responseData.data || responseData.orders || responseData.results || [];

      if (platform === 'salla') {
        unifiedOrders = (Array.isArray(ordersList) ? ordersList : []).map(adaptSallaOrder);
      } else {
        unifiedOrders = (Array.isArray(ordersList) ? ordersList : []).map(adaptZidOrder);
      }

      set({
        orders: unifiedOrders,
        pagination: {
          currentPage: responseData.pagination?.currentPage || page,
          totalPages: responseData.pagination?.totalPages || 1,
          totalCount: responseData.pagination?.total || unifiedOrders.length,
          perPage: responseData.pagination?.perPage || 15,
        },
        loadingList: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب الطلبات', loadingList: false });
    }
  },

  fetchOrderDetails: async (orderId, platform = 'salla') => {
    set({ loadingDetails: true, error: null, currentOrderDetails: null });
    try {
      const responseData = await orderService.getOrderDetails(orderId);
      const listOrder = get().orders.find((o) => String(o.id) === String(orderId));

      let unifiedDetails: UnifiedOrderDetails;
      if (platform === 'salla') {
        // Fallback: If details API unexpectedly omits items, use the ones we saw in the list
        if ((!responseData.data.items || responseData.data.items.length === 0) && listOrder?.rawItems?.length) {
          responseData.data.items = listOrder.rawItems;
        }
        unifiedDetails = adaptSallaOrderDetails(responseData.data);
      } else {
        if ((!responseData.data.products || responseData.data.products.length === 0) && listOrder?.rawItems?.length) {
          responseData.data.products = listOrder.rawItems;
        }
        unifiedDetails = adaptZidOrderDetails(responseData.data);
      }

      set({ currentOrderDetails: unifiedDetails, loadingDetails: false });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب تفاصيل الطلب', loadingDetails: false });
    }
  },

  clearCurrentOrder: () => {
    set({ currentOrderDetails: null });
  },

  goToPage: (page, platform) => {
    get().fetchOrders(page, platform);
  },

  refresh: (platform) => {
    get().fetchOrders(get().pagination.currentPage, platform);
  }
}));
