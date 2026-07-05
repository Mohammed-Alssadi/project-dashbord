import { useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';

/**
 * خطاف مخصص موحد لإدارة تصفية وتقسيم التصنيفات من السيرفر باستخدام Zustand
 */
export function useCategories() {
  // استخلاص كل قيمة بشكل منفصل لتجنب stale closure و infinite re-renders
  const categories   = useCategoryStore(s => s.categories);
  const loading      = useCategoryStore(s => s.loading);
  const error        = useCategoryStore(s => s.error);
  const page         = useCategoryStore(s => s.page);
  const searchTerm   = useCategoryStore(s => s.searchTerm);
  const keyword      = useCategoryStore(s => s.keyword);
  const status       = useCategoryStore(s => s.status);
  const paginationInfo = useCategoryStore(s => s.paginationInfo);

  const setPage         = useCategoryStore(s => s.setPage);
  const setSearchTerm   = useCategoryStore(s => s.setSearchTerm);
  const setKeyword      = useCategoryStore(s => s.setKeyword);
  const setStatus       = useCategoryStore(s => s.setStatus);
  const fetchCategories = useCategoryStore(s => s.fetchCategories);

  // 1. تطبيق الـ Debounce للبحث (الانتظار 400ms بعد انتهاء الكتابة)
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. جلب التصنيفات تلقائياً عند تغيير الفلاتر أو الصفحة
  useEffect(() => {
    fetchCategories();
  }, [page, keyword, status]);

  return {
    categories,
    loading,
    error,
    paginationInfo,
    page,
    searchTerm,
    status,
    setPage,
    setSearchTerm,
    setStatus,
    refresh: fetchCategories
  };
}
