import { useState, useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';
import { categoryService } from '../services/categoryService';
import { adaptCategory, type UnifiedCategory } from '../services/categoryAdapter';
import { useAuthState } from '@/features/auth/hooks/useAuthState';

export function useCategoryDetail(categoryId: string | number) {
  const [category, setCategory] = useState<UnifiedCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthState();
  const platform = (user?.platform as 'salla' | 'zid' | 'unknown') || 'unknown';

  const storeCategories = useCategoryStore(s => s.categories);

  const fetchDetail = async () => {
    if (!categoryId || platform === 'unknown') return;

    try {
      setLoading(true);
      setError(null);

      // 1. محاولة إيجاد القسم في الستور المحلي أولاً للعرض السريع
      const localCategory = storeCategories.find(c => String(c.id) === String(categoryId));
      if (localCategory) {
        setCategory(localCategory);
        setLoading(false);
      }

      // 2. جلب نسخة حديثة من الـ API
      const rawResponse = await categoryService.getCategoryDetail(categoryId);
   
      // سلة ترجع القسم داخل data وكائن زد يكون داخل categories أو مباشر
      const cleanRaw = platform === 'salla' && rawResponse?.data 
        ? rawResponse.data 
        : (platform === 'zid' && rawResponse?.categories ? rawResponse.categories : rawResponse);

      const adapted = adaptCategory(cleanRaw);

      setCategory(adapted);
    } catch (err: any) {
      console.error('[useCategoryDetail] Error:', err);
      if (!category) {
        setError(err.message || 'فشل جلب تفاصيل القسم');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [categoryId, platform]);

  return {
    category,
    loading,
    error,
    refetch: fetchDetail
  };
}
