import { create } from 'zustand';
import { customerService } from '../services/customerService';
import { adaptCustomer, adaptCustomersList, type UnifiedCustomer } from '../services/customerAdapter';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

interface CustomerState {
  customers: UnifiedCustomer[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  selectedCustomer: UnifiedCustomer | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  fetchCustomers: (page?: number) => Promise<void>;
  goToPage: (page: number) => void;
  fetchCustomerById: (customerId: string | number, isZid: boolean) => Promise<void>;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 15,
};

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  selectedCustomer: null,
  loadingDetail: false,
  errorDetail: null,

  fetchCustomers: async (page = 1) => {
    try {
      set({ loading: true, error: null });

      const params = {
        page,
        page_size: 15,
        per_page: 15,
      };

      const response = await customerService.getCustomers(params);

      // استخراج القوائم والباجينيشن باستخدام الموائم
      const list = response?.results || response?.data || response || [];
      const unifiedCustomers = adaptCustomersList(response);
      const totalCount = response?.count || response?.pagination?.total || (Array.isArray(list) ? list.length : 0);
      const totalPages = response?.pagination?.totalPages || Math.ceil(totalCount / 15) || 1;

      set({
        customers: unifiedCustomers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          perPage: 15,
        },
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب بيانات العملاء', loading: false });
    }
  },

  goToPage: (page) => {
    get().fetchCustomers(page);
  },

  fetchCustomerById: async (customerId, isZid) => {
    try {
      set({ loadingDetail: true, errorDetail: null, selectedCustomer: null });
      const response = await customerService.getCustomerById(customerId, isZid);
      const detail = response?.customer || response?.data || response;
      const adapted = adaptCustomer(detail);
      set({ selectedCustomer: adapted, loadingDetail: false });
    } catch (err: any) {
      set({ errorDetail: err.message || 'فشل جلب تفاصيل العميل', loadingDetail: false });
    }
  },
}));

