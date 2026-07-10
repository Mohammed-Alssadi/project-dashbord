import { create } from 'zustand';
import { productService } from '../services/productService';
import { adaptProductsList, type UnifiedProduct } from '../services/productAdapter';
import {
  buildProductParams,
  extractPagination,
  type PaginationMeta,
} from '../services/productQueryAdapter';

interface ProductState {
  products: UnifiedProduct[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;

  fetchProducts: (page?: number) => Promise<void>;
  goToPage: (page: number) => void;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 15,
  hasNext: false,
  hasPrev: false,
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,

  fetchProducts: async (page = 1) => {
    try {
      set({ loading: true, error: null });

      const params = buildProductParams({ page, pageSize: 15 });
      const rawResponse = await productService.getProducts(params);

      const unifiedProducts = adaptProductsList(rawResponse);
      const pagination = extractPagination(rawResponse, { page, pageSize: 15 });

  

      set({ products: unifiedProducts, pagination, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب المنتجات', loading: false });
    }
  },

  goToPage: (page) => {
    get().fetchProducts(page);
  },
}));
