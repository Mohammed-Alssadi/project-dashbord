import { useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';

export function useCategories() {
  const categories = useCategoryStore(s => s.categories);
  const pagination = useCategoryStore(s => s.pagination);
  const loading = useCategoryStore(s => s.loading);
  const error = useCategoryStore(s => s.error);
  const fetchCategories = useCategoryStore(s => s.fetchCategories);
  const goToPage = useCategoryStore(s => s.goToPage);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    pagination,
    loading,
    error,
    goToPage,
    refresh: () => fetchCategories(pagination.currentPage),
  };
}

