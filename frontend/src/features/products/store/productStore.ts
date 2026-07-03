import { create } from 'zustand';
import { productService } from '../services/productService';
import { categoryService } from '../../categories/services/categoryService';
import type { Product, PaginationInfo } from '../services/productService';

// نوع مبسط للتصنيفات المستخدمة في قائمة الفلترة
interface CategoryOption {
  id: number;
  name: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  searchTerm: string;
  keyword: string;
  status: string;
  category: string; // يخزن الـ ID الخاص بالتصنيف للفلترة على مستوى السيرفر
  type: string;
  paginationInfo: PaginationInfo | null;
  categories: CategoryOption[]; // قائمة التصنيفات المبسطة للفلترة (معرف ورقمي + اسم)
  types: string[];

  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setKeyword: (keyword: string) => void;
  setStatus: (status: string) => void;
  setCategory: (category: string) => void;
  setType: (type: string) => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: true,
  error: null,
  page: 1,
  searchTerm: "",
  keyword: "",
  status: "الكل",
  category: "الكل",
  type: "الكل",
  paginationInfo: null,
  categories: [],
  types: ["product", "service", "digital", "card", "bundle", "food"], // قائمة الأنواع الثابتة في سلة

  setPage: (page) => set({ page }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setKeyword: (keyword) => set({ keyword, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setType: (type) => set({ type, page: 1 }),

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const { page, keyword, status, category, type } = get();

      // تجهيز المعاملات للسيرفر
      const apiStatus = status === "الكل" ? undefined : status;
      const apiKeyword = keyword.trim() === "" ? undefined : keyword.trim();
      
      // إرسال معرف التصنيف كرقم صحيح — سلة تتجاهل القيم النصية
      const apiCategory = category === "الكل" ? undefined : Number(category);

      const result = await productService.getProducts({
        page,
        per_page: 10,
        keyword: apiKeyword,
        status: apiStatus,
        category: apiCategory as any // category_id كرقم صحيح لسلة
      });

      // فلترة النوع فقط محلياً لأن السيرفر لا يدعمها مباشرة
      let finalProducts = result.products;
      if (type !== "الكل") {
        finalProducts = finalProducts.filter(p => p.type === type);
      }

      set({
        products: finalProducts,
        paginationInfo: result.pagination,
        loading: false
      });
    } catch (err: any) {
      console.error('Failed to fetch products in Zustand store:', err);
      set({ error: err.message || 'فشل جلب المنتجات', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await categoryService.getCategories({ per_page: 100 });
      // تحويل الأقسام المفصلة إلى قائمة مبسطة { id: number, name: string }
      const simplified = response.categories.map(c => ({ id: Number(c.id), name: c.name }));
      set({ categories: simplified });
    } catch (err: any) {
      console.error('Failed to load categories in Zustand store:', err);
      set({ error: err.message || 'Failed to fetch categories' });
    }
  }
}));
