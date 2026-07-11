import { useAuthStore } from '@/features/auth/store/authStore';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Builds request query parameters in a platform-agnostic way.
 */
export const buildCategoryParams = (
  params: PaginationParams
): Record<string, any> => {
  const page = params.page || 1;
  const limit = params.pageSize || 15;
  const platform = useAuthStore.getState().user?.platform;

  if (platform === 'salla') {
    return {
      page,
      per_page: limit,
    };
  }

  // Default to Zid (page_size)
  return {
    page,
    page_size: limit,
  };
};

/**
 * Extracts unified pagination metadata by automatically detecting the response format.
 */
export const extractPagination = (
  response: any,
  currentParams: PaginationParams
): PaginationMeta => {
  const page = currentParams.page || 1;
  const pageSize = currentParams.pageSize || 15;

  // Detect Zid format
  if (response && response.total_categories_count !== undefined) {
    const totalCount = response.total_categories_count || 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    
    return {
      currentPage: page,
      totalPages: totalPages,
      totalCount,
      perPage: pageSize,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Detect Zid alternative format
  if (response && (response.count !== undefined || response.next !== undefined)) {
    const totalCount = response.count || 0;
    return {
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      perPage: pageSize,
      hasNext: !!response.next,
      hasPrev: !!response.previous,
    };
  }

  // Detect Salla format
  if (response && response.pagination) {
    const p = response.pagination || {};
    const currentPage = p.currentPage || page;
    const totalPages = p.totalPages || 1;
    return {
      currentPage,
      totalPages,
      totalCount: p.total || p.count || 0,
      perPage: p.perPage || pageSize,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }

  // Fallback heuristic: If we receive exactly 'pageSize' items, assume there is a next page.
  const dataList = response?.categories || response?.data || response?.results || response || [];
  const itemsCount = Array.isArray(dataList) ? dataList.length : 0;

  return {
    currentPage: page,
    totalPages: itemsCount === pageSize ? page + 1 : page,
    totalCount: itemsCount === pageSize ? (page * pageSize) + 1 : (page - 1) * pageSize + itemsCount,
    perPage: pageSize,
    hasNext: itemsCount === pageSize,
    hasPrev: page > 1,
  };
};
