import { apiClient } from '../../../services/apiClient';

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  customerUrl: string;
  parentId: number;
  sortOrder: number;
  status: 'active' | 'hidden' | string;
  hasHiddenProducts: boolean;
  updatedAt: string;
  subCategories: Category[];
  platform: string;
  metadata?: {
    title: string | null;
    description: string | null;
    url: string | null;
  };
  showIn?: {
    app: boolean;
    salla_points: boolean;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  perPage: number;
  total: number;
}

export interface CategoriesFilterParams {
  page?: number;
  per_page?: number;
  keyword?: string;
  status?: string;
  force?: boolean;
}

export interface CategoriesApiResponse {
  success: boolean;
  data: Category[];
  pagination: PaginationInfo | null;
}

export const categoryService = {
  /**
   * جلب تصنيفات المتجر مع التصفية والتقسيم
   */
  getCategories: async (params?: CategoriesFilterParams): Promise<{ categories: Category[]; pagination: PaginationInfo | null }> => {
    try {
      const response = await apiClient.get<CategoriesApiResponse>('/api/categories', { params });
      return {
        categories: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      console.error('Error fetching categories from platform:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل جلب التصنيفات من المنصة');
    }
  }
};
