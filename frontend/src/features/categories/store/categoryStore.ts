import { create } from 'zustand';
import { categoryService } from '../services/categoryService';
import { 
  parseSallaCategoryList, 
  parseZidCategoryList,
  parseSallaCategoryDetails,
  parseZidCategoryDetails
} from '../adapters/categoryAdapter';
import type { PlatformCategory } from '../types/category';
import { 
  buildCategoryParams, 
  extractPagination, 
  type PaginationMeta 
} from '../adapters/categoryQueryAdapter';

interface CategoryState {
  categories: PlatformCategory[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  
  selectedCategory: PlatformCategory | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  fetchCategories: (platform: 'salla' | 'zid', page?: number) => Promise<void>;
  goToPage: (platform: 'salla' | 'zid', page: number) => void;
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

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  
  selectedCategory: null,
  loadingDetail: false,
  errorDetail: null,

  fetchCategories: async (platform, page = 1) => {
    try {
      set({ loading: true, error: null });

      const params = buildCategoryParams({ page, pageSize: 15 });
      const rawResponse = await categoryService.getCategories(params);

      let parsedCategories: PlatformCategory[] = [];
      if (platform === 'salla') {
        parsedCategories = parseSallaCategoryList(rawResponse);
      } else {
        parsedCategories = parseZidCategoryList(rawResponse);
      }

      const pagination = extractPagination(rawResponse, { page, pageSize: 15 });

      set({ 
        categories: parsedCategories, 
        pagination, 
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب الأقسام', loading: false });
    }
  },

  goToPage: (platform, page) => {
    get().fetchCategories(platform, page);
  },

  fetchCategoryById: async (platform, categoryId) => {
    try {
      set({ loadingDetail: true, errorDetail: null, selectedCategory: null });
      
      const rawResponse = await categoryService.getCategoryDetail(categoryId);
      
      let parsedDetails: PlatformCategory | null = null;
      if (platform === 'salla') {
        parsedDetails = parseSallaCategoryDetails(rawResponse);
      } else {
        parsedDetails = parseZidCategoryDetails(rawResponse);
      }

      set({ selectedCategory: parsedDetails, loadingDetail: false });
    } catch (err: any) {
      set({ errorDetail: err.message || 'فشل جلب تفاصيل القسم', loadingDetail: false });
    }
  },

  clearSelectedCategory: () => {
    set({ selectedCategory: null, errorDetail: null });
  }
}));
