import { create } from 'zustand';
import { customerService } from '../services/customerService';
import type { PlatformCustomer, SallaCustomerItem, ZidCustomerItem } from '../types/customer';
import { 
  buildCustomerParams, 
  extractPagination, 
  type PaginationMeta 
} from '../adapters/customerQueryAdapter';

interface CustomerState {
  customers: PlatformCustomer[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  
  selectedCustomer: PlatformCustomer | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  fetchCustomers: (platform: 'salla' | 'zid', page?: number) => Promise<void>;
  goToPage: (platform: 'salla' | 'zid', page: number) => void;
  fetchCustomerById: (platform: 'salla' | 'zid', customerId: string | number) => Promise<void>;
  clearSelectedCustomer: () => void;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 15,
  hasNext: false,
  hasPrev: false,
};

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  
  selectedCustomer: null,
  loadingDetail: false,
  errorDetail: null,

  fetchCustomers: async (platform, page = 1) => {
    try {
      set({ loading: true, error: null });

      const params = buildCustomerParams({ page, pageSize: 15 });
      const rawResponse = await customerService.getCustomers(params);

      const parsedCustomers: PlatformCustomer[] = platform === 'salla'
        ? (Array.isArray(rawResponse?.data) ? rawResponse.data : []) as SallaCustomerItem[]
        : (Array.isArray(rawResponse?.customers) ? rawResponse.customers : Array.isArray(rawResponse?.results) ? rawResponse.results : []) as ZidCustomerItem[];

      const pagination = extractPagination(rawResponse, { page, pageSize: 15 });

      set({ 
        customers: parsedCustomers, 
        pagination, 
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب بيانات العملاء', loading: false });
    }
  },

  goToPage: (platform, page) => {
    get().fetchCustomers(platform, page);
  },

  fetchCustomerById: async (platform, customerId) => {
    try {
      set({ loadingDetail: true, errorDetail: null, selectedCustomer: null });
      
      const isZid = platform === 'zid';
      const rawResponse = await customerService.getCustomerById(customerId, isZid);
      
      const parsedDetails: PlatformCustomer = platform === 'salla'
        ? (rawResponse?.data || rawResponse) as SallaCustomerItem
        : (rawResponse?.customer || rawResponse) as ZidCustomerItem;

      set({ selectedCustomer: parsedDetails, loadingDetail: false });
    } catch (err: any) {
      set({ errorDetail: err.message || 'فشل جلب تفاصيل العميل', loadingDetail: false });
    }
  },

  clearSelectedCustomer: () => {
    set({ selectedCustomer: null, errorDetail: null });
  }
}));
