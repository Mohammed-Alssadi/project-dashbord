import { create } from 'zustand';
import { productService } from '../services/productService';
import type { PlatformProduct, SallaProductItem, ZidProductItem } from '../types/product';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductFilters {
  search: string;
  category_id: string;
  status?: string;
  product_class?: string;
  is_published?: string;
  in_stock?: string;
}

interface ProductState {
  // List State
  products: PlatformProduct[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;

  // Detail State
  selectedProduct: PlatformProduct | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  // Actions
  fetchProducts: (platform: 'salla' | 'zid', page?: number, urlFilters?: Partial<ProductFilters>) => Promise<void>;
  goToPage: (platform: 'salla' | 'zid', page: number) => void;
  setFilter: (key: keyof ProductFilters, value: any) => void;
  resetFilters: () => void;
  fetchProductById: (platform: 'salla' | 'zid', productId: string | number) => Promise<void>;
  clearSelectedProduct: () => void;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 15,
  hasNext: false,
  hasPrev: false,
};

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  category_id: '',
  status: '',
  product_class: '',
  is_published: '',
  in_stock: '',
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  filters: DEFAULT_FILTERS,

  selectedProduct: null,
  loadingDetail: false,
  errorDetail: null,

  fetchProducts: async (_platform, page = 1, urlFilters) => {
    try {
      set({ loading: true, error: null });

      // تجميع وتصفية الفلاتر النشطة (عدم إرسال قيم فارغة)
      const cleanParams: Record<string, any> = { page, limit: 15 };

      // استخدام urlFilters إذا تم تمريرها (الطريقة الجديدة)، وإلا قراءة الفلاتر من الستور (الطريقة القديمة)
      const activeFilters = urlFilters || get().filters;

      Object.entries(activeFilters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          cleanParams[key] = val;
        }
      });

      const response = await productService.getProducts(cleanParams);

      const parsedProducts = response?.data as PlatformProduct[] || [];
      const pagination = response?.pagination || DEFAULT_PAGINATION;

      set({ products: parsedProducts, pagination, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب المنتجات', loading: false });
    }
  },

  goToPage: (platform, page) => {
    get().fetchProducts(platform, page);
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  fetchProductById: async (platform, productId) => {
    try {
      set({ loadingDetail: true, errorDetail: null, selectedProduct: null });

      const rawResponse = await productService.getProductById(productId);

      let parsedDetails: PlatformProduct;
      if (platform === 'salla') {
        parsedDetails = (rawResponse?.data ? rawResponse.data : rawResponse) as SallaProductItem;
      } else {
        parsedDetails = rawResponse as ZidProductItem;
      }

      set({ selectedProduct: parsedDetails, loadingDetail: false });
    } catch (err: any) {
      set({ errorDetail: err.message || 'فشل جلب تفاصيل المنتج', loadingDetail: false });
    }
  },



  clearSelectedProduct: () => {
    set({ selectedProduct: null, errorDetail: null });
  }
}));
