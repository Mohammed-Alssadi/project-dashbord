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
 * Includes both page_size (Zid) and per_page (Salla) parameters.
 */
export const buildProductParams = (
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

  // Detect Zid pagination format (uses count and next/previous)
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

  // Detect Salla pagination format (uses pagination object)
  if (response && response.pagination) {
    const p = response.pagination || {};
    const currentPage = p.currentPage || page;
    const totalPages = p.totalPages || 1;
    return {
      currentPage,
      totalPages,
      totalCount: p.total || 0,
      perPage: p.perPage || pageSize,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }

  return {
    currentPage: page,
    totalPages: 1,
    totalCount: 0,
    perPage: pageSize,
    hasNext: false,
    hasPrev: false,
  };
};
