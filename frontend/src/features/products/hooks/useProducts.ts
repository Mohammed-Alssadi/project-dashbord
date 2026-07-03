import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';

/**
 * خطاف مخصص يعمل كجسر (Wrapper) لمخزن Zustand العالمي
 */
export function useProducts() {
  const store = useProductStore();

  // 1. جلب تصنيفات المتجر مرة واحدة فقط عند تحميل الصفحة لأول مرة
  useEffect(() => {
    store.fetchCategories();
  }, []);

  // 2. تطبيق الـ Debounce للبحث (الانتظار 400ms بعد انتهاء الكتابة)
  useEffect(() => {
    const handler = setTimeout(() => {
      store.setKeyword(store.searchTerm);
    }, 400);

    return () => clearTimeout(handler);
  }, [store.searchTerm]);

  // 3. إعادة الطلب تلقائياً من الـ Store عند تغير الصفحة أو معاملات التصفية
  useEffect(() => {
    store.fetchProducts();
  }, [store.page, store.keyword, store.status, store.category, store.type]);

  return {
    products: store.products,
    loading: store.loading,
    error: store.error,
    paginationInfo: store.paginationInfo,
    categories: store.categories, // قائمة كائنات التصنيفات الشاملة [{ id, name }]
    types: store.types,
    
    // الحالات الحالية للربط
    page: store.page,
    searchTerm: store.searchTerm,
    status: store.status,
    category: store.category,
    type: store.type,
    
    // دوال التعديل والـ Actions
    setPage: store.setPage,
    setSearchTerm: store.setSearchTerm,
    setStatus: store.setStatus,
    setCategory: store.setCategory,
    setType: store.setType,
    refresh: store.fetchProducts
  };
}
