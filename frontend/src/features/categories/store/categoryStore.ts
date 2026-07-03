import { create } from 'zustand';
import { categoryService } from '../services/categoryService';
import type { Category, PaginationInfo } from '../services/categoryService';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  page: number;
  searchTerm: string;
  keyword: string;
  status: string;
  paginationInfo: PaginationInfo | null;

  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setKeyword: (keyword: string) => void;
  setStatus: (status: string) => void;
  fetchCategories: (force?: boolean) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: true,
  error: null,
  page: 1,
  searchTerm: "",
  keyword: "",
  status: "الكل",
  paginationInfo: null,

  setPage: (page) => set({ page }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setKeyword: (keyword) => set({ keyword, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),

  fetchCategories: async (force: boolean = false) => {
    try {
      set({ loading: true, error: null });
      const { page, keyword, status } = get();

      // تجهيز المعاملات للسيرفر
      const apiStatus = status === "الكل" ? undefined : status;
      const apiKeyword = keyword.trim() === "" ? undefined : keyword.trim();

      const result = await categoryService.getCategories({
        page,
        per_page: 10,
        keyword: apiKeyword,
        status: apiStatus,
        force
      });

      set({
        categories: result.categories || [],
        paginationInfo: result.pagination,
        loading: false
      });
    } catch (err: any) {
      console.error('Failed to fetch categories in store:', err);
      set({ error: err.message || 'فشل جلب التصنيفات', loading: false });
    }
  }
}));
