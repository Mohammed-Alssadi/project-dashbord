import { apiClient } from '../../../services/apiClient';

// واجهة توضح شكل المنتج الموحد والديناميكي المتقدم
export interface Product {
  id: string | number;
  name: string;
  price: number;
  currency: string;
  salePrice: number;
  costPrice: number;
  sku: string;
  imageUrl?: string;
  quantity: number;
  status: string; // active | hidden | out_of_stock
  type: string;
  category: string;
  productUrl?: string;
  platform: 'salla' | 'zid';
}

// واجهة معاملات الفلترة والصفحات
export interface ProductsFilterParams {
  page?: number;
  per_page?: number;
  keyword?: string;
  status?: string;
  category?: string;
  force?: boolean;
}

// واجهة معلومات الترقيم والصفحات
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  perPage: number;
  total: number;
}

export interface Category {
  id: string | number;
  name: string;
}

export interface CategoriesApiResponse {
  success: boolean;
  data: Category[];
}

// واجهة استجابة الـ API الموحدة
export interface ProductsApiResponse {
  success: boolean;
  data: Product[];
  pagination: PaginationInfo | null;
}

export const productService = {
  /**
   * جلب المنتجات الموحدة مع إمكانية التصفية وتقسيم الصفحات
   */
  getProducts: async (params?: ProductsFilterParams): Promise<{ products: Product[]; pagination: PaginationInfo | null }> => {
    try {
      const response = await apiClient.get<ProductsApiResponse>('/api/products', { params });
      return {
        products: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      console.error('Error fetching unified products:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل جلب المنتجات من المنصة');
    }
  },
};
