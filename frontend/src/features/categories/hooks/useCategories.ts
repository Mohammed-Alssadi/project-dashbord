import { useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';

/**
 * خطاف مخصص موحد لإدارة تصفية وتقسيم التصنيفات من السيرفر باستخدام Zustand
 */
export function useCategories() {
  const store = useCategoryStore();

  // 1. تطبيق الـ Debounce للبحث (الانتظار 400ms بعد انتهاء الكتابة)
  useEffect(() => {
    const handler = setTimeout(() => {
      store.setKeyword(store.searchTerm);
    }, 400);

    return () => clearTimeout(handler);
  }, [store.searchTerm]);

  // 2. جلب التصنيفات تلقائياً عند تغيير الفلاتر أو الصفحة
  useEffect(() => {
    store.fetchCategories();
  }, [store.page, store.keyword, store.status]);

  return {
    categories: store.categories,
    loading: store.loading,
    error: store.error,
    paginationInfo: store.paginationInfo,
    
    // الحالات الحالية للربط
    page: store.page,
    searchTerm: store.searchTerm,
    status: store.status,
    
    // دوال التعديل
    setPage: store.setPage,
    setSearchTerm: store.setSearchTerm,
    setStatus: store.setStatus,
    refresh: store.fetchCategories
  };
}
