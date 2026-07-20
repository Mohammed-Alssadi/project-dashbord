import { create } from 'zustand';
import { categoryService } from '../services/categoryService';
import type { PlatformCategory, SallaCategoryItem, ZidCategoryItem } from '../types/category';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CategoryFilters {
  search: string;
  status?: string;
  is_published?: string;
}

interface CategoryState {
  categories: PlatformCategory[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  filters: CategoryFilters;
  
  selectedCategory: PlatformCategory | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  fetchCategories: (platform: 'salla' | 'zid', page?: number, urlFilters?: Partial<CategoryFilters>) => Promise<void>;
  goToPage: (platform: 'salla' | 'zid', page: number) => void;
  setFilter: (key: keyof CategoryFilters, value: any) => void;
  resetFilters: () => void;
  fetchCategoryById: (platform: 'salla' | 'zid', categoryId: string | number) => Promise<void>;
  clearSelectedCategory: () => void;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 15,
  hasNext: false,
  hasPrev: false,
};

const DEFAULT_FILTERS: CategoryFilters = {
  search: '',
  status: '',
  is_published: '',
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  filters: DEFAULT_FILTERS,
  
  selectedCategory: null,
  loadingDetail: false,
  errorDetail: null,

  fetchCategories: async (_platform, page = 1, urlFilters) => {
    try {
      set({ loading: true, error: null });

      const cleanParams: Record<string, any> = { page, limit: 15 };
      
      const activeFilters = urlFilters || get().filters;
      
      const search = (activeFilters.search || '').trim();
      if (search) cleanParams.search = search;

      const status = activeFilters.status;
      if (status) cleanParams.status = status;

      const isPublished = activeFilters.is_published;
      if (isPublished) cleanParams.is_published = isPublished;

      const response = await categoryService.getCategories(cleanParams);
      console.log('Categories API response:', response);
      console.log('Categories pagination metadata:', response?.pagination);

      const parsedCategories = response?.data as PlatformCategory[] || [];
      const pagination = response?.pagination || DEFAULT_PAGINATION;

      set({ 
        categories: parsedCategories, 
        pagination, 
        loading: false 
      });
    } catch (err: any) {
      console.error('fetchCategories error:', err);
      set({ error: err.message || 'فشل جلب الأقسام', loading: false });
    }
  },

  goToPage: (platform, page) => {
    get().fetchCategories(platform, page);
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  fetchCategoryById: async (platform, categoryId) => {
    try {
      set({ loadingDetail: true, errorDetail: null, selectedCategory: null });
      
      const rawResponse = await categoryService.getCategoryDetail(categoryId);
      
      const parsedDetails: PlatformCategory = platform === 'salla'
        ? (rawResponse?.data || rawResponse) as SallaCategoryItem
        : (rawResponse?.categories || rawResponse?.category || rawResponse?.data || rawResponse) as ZidCategoryItem;

      set({ selectedCategory: parsedDetails, loadingDetail: false });
    } catch (err: any) {
      set({ errorDetail: err.message || 'فشل جلب تفاصيل القسم', loadingDetail: false });
    }
  },

  clearSelectedCategory: () => {
    set({ selectedCategory: null, errorDetail: null });
  }
}));
