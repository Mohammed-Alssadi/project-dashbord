import { create } from 'zustand';
import { categoryService } from '../services/categoryService';
import { adaptCategoriesList, type UnifiedCategory } from '../services/categoryAdapter';
import { buildProductParams, extractPagination, type PaginationMeta } from '@/features/products/services/productQueryAdapter';

interface CategoryState {
  categories: UnifiedCategory[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  fetchCategories: (page?: number) => Promise<void>;
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

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,

  fetchCategories: async (page = 1) => {
    try {
      set({ loading: true, error: null });
      
      const params = buildProductParams({ page, pageSize: 15 });
      const rawResponse = await categoryService.getCategories(params);
      
      const unifiedCategories = adaptCategoriesList(rawResponse);
      const pagination = extractPagination(rawResponse, { page, pageSize: 15 });
      
      set({ categories: unifiedCategories, pagination, loading: false });
    } catch (err: any) {
      console.error('Failed to fetch categories in store:', err);
      set({ error: err.message || 'فشل جلب التصنيفات', loading: false });
    }
  },

  goToPage: (page) => {
    get().fetchCategories(page);
  }
}));

