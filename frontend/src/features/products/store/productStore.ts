import { create } from 'zustand';
import { productService } from '../services/productService';
import { categoryService } from '../../categories/services/categoryService';
import type { Product, PaginationInfo } from '../services/productService';

interface CategoryOption {
  id: number;
  name: string;
  slug?: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  searchTerm: string;
  keyword: string;
  status: string;
  category: string;
  paginationInfo: PaginationInfo | null;
  categories: CategoryOption[];

  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setKeyword: (keyword: string) => void;
  setStatus: (status: string) => void;
  setCategory: (category: string) => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: true,
  error: null,
  page: 1,
  searchTerm: '',
  keyword: '',
  status: 'الكل',
  category: 'الكل',
  paginationInfo: null,
  categories: [],

  setPage: (page) => set({ page }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setKeyword: (keyword) => set({ keyword, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const { page, keyword, status, category } = get();

      const apiStatus   = status   === 'الكل' ? undefined : status;
      const apiKeyword  = keyword.trim() === '' ? undefined : keyword.trim();
      const apiCategory = category === 'الكل' ? undefined : String(category);

      const result = await productService.getProducts({
        page,
        per_page: 10,
        keyword: apiKeyword,
        status: apiStatus,
        category: apiCategory
      });

      set({ products: result.products, paginationInfo: result.pagination, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب المنتجات', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await categoryService.getCategories({ per_page: 100 });
      const simplified = response.categories.map(c => ({ 
        id: Number(c.id), 
        name: c.name,
        slug: c.seo?.url || '' // حفظ الـ slug للمنصات التي تعتمد عليه كزد
      }));
      set({ categories: simplified });
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  }
}));
