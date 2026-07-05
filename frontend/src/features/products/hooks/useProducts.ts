import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';

/**
 * خطاف مخصص يعمل كجسر (Wrapper) لمخزن Zustand العالمي
 */
export function useProducts() {
  // استخلاص كل قيمة بشكل منفصل لتجنب stale closure و infinite re-renders
  const products      = useProductStore(s => s.products);
  const loading       = useProductStore(s => s.loading);
  const error         = useProductStore(s => s.error);
  const page          = useProductStore(s => s.page);
  const searchTerm    = useProductStore(s => s.searchTerm);
  const keyword       = useProductStore(s => s.keyword);
  const status        = useProductStore(s => s.status);
  const category      = useProductStore(s => s.category);
  const paginationInfo = useProductStore(s => s.paginationInfo);
  const categories    = useProductStore(s => s.categories);

  const setPage        = useProductStore(s => s.setPage);
  const setSearchTerm  = useProductStore(s => s.setSearchTerm);
  const setKeyword     = useProductStore(s => s.setKeyword);
  const setStatus      = useProductStore(s => s.setStatus);
  const setCategory    = useProductStore(s => s.setCategory);
  const fetchProducts  = useProductStore(s => s.fetchProducts);
  const fetchCats      = useProductStore(s => s.fetchCategories);

  // 1. جلب تصنيفات المتجر مرة واحدة فقط عند تحميل الصفحة لأول مرة
  useEffect(() => {
    fetchCats();
  }, []);

  // 2. تطبيق الـ Debounce للبحث (الانتظار 400ms بعد انتهاء الكتابة)
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 3. إعادة الطلب تلقائياً من الـ Store عند تغير الصفحة أو معاملات التصفية
  useEffect(() => {
    fetchProducts();
  }, [page, keyword, status, category]);

  return {
    products,
    loading,
    error,
    paginationInfo,
    categories,
    page,
    searchTerm,
    status,
    category,
    setPage,
    setSearchTerm,
    setStatus,
    setCategory,
    refresh: fetchProducts
  };
}
