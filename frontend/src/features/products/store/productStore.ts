import { create } from 'zustand';
import { productService } from '../services/productService';
import { parseSallaProductList, parseZidProductList, parseSallaDetails, parseZidDetails } from '../adapters/productAdapter';
import type { PlatformProduct } from '../types/product';
import {
  buildProductParams,
  extractPagination,
  type PaginationMeta,
} from '../adapters/productQueryAdapter';

interface ProductState {
  // List State
  products: PlatformProduct[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;

  // Detail State
  selectedProduct: PlatformProduct | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  // Actions
  fetchProducts: (platform: 'salla' | 'zid', page?: number) => Promise<void>;
  goToPage: (platform: 'salla' | 'zid', page: number) => void;
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

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  
  selectedProduct: null,
  loadingDetail: false,
  errorDetail: null,

  fetchProducts: async (platform, page = 1) => {
    try {
      set({ loading: true, error: null });

      const params = buildProductParams({ page, pageSize: 15 });
      const rawResponse = await productService.getProducts(params);

      let parsedProducts: PlatformProduct[] = [];
      if (platform === 'salla') {
        parsedProducts = parseSallaProductList(rawResponse);
      } else {
        parsedProducts = parseZidProductList(rawResponse);
      }

      const pagination = extractPagination(rawResponse, { page, pageSize: 15 });

      set({ products: parsedProducts, pagination, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب المنتجات', loading: false });
    }
  },

  goToPage: (platform, page) => {
    get().fetchProducts(platform, page);
  },

  fetchProductById: async (platform, productId) => {
    try {
      // تفريغ الحالة القديمة لتجنب (Stale Data) وبدء التحميل
      set({ loadingDetail: true, errorDetail: null, selectedProduct: null });
      
      const rawResponse = await productService.getProductById(productId);
      
      let parsedDetails: PlatformProduct;
      if (platform === 'salla') {
        const cleanRaw = rawResponse?.data ? rawResponse.data : rawResponse;
        parsedDetails = parseSallaDetails(cleanRaw);
      } else {
        parsedDetails = parseZidDetails(rawResponse);
      }

      set({ selectedProduct: parsedDetails, loadingDetail: false });
    } catch (err: any) {
      set({ errorDetail: err.message || 'فشل جلب تفاصيل المنتج', loadingDetail: false });
    }
  },

  clearSelectedProduct: () => {
    // تفريغ الذاكرة عند الخروج من صفحة التفاصيل
    set({ selectedProduct: null, errorDetail: null });
  }
}));
