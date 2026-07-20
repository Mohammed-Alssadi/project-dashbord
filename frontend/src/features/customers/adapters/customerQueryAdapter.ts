export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  perPage: 15,
  hasNext: false,
  hasPrev: false,
};

export function buildCustomerParams(options: { page: number; pageSize?: number }): Record<string, any> {
  return {
    page: options.page,
    limit: options.pageSize || 15,
  };
}

export function extractPagination(rawResponse: any, _options?: { page: number; pageSize?: number }): PaginationMeta {
  if (rawResponse?.pagination) {
    return {
      currentPage: rawResponse.pagination.currentPage || rawResponse.pagination.current_page || 1,
      totalPages: rawResponse.pagination.totalPages || rawResponse.pagination.total_pages || 1,
      totalCount: rawResponse.pagination.totalCount || rawResponse.pagination.total || rawResponse.count || 0,
      perPage: rawResponse.pagination.perPage || rawResponse.pagination.per_page || 15,
      hasNext: rawResponse.pagination.hasNext || !!rawResponse.next,
      hasPrev: rawResponse.pagination.hasPrev || !!rawResponse.previous,
    };
  }
  return DEFAULT_PAGINATION;
}
