import { useState, useEffect } from 'react';
import { useProductStore } from '../store/productStore';
import { productService } from '../services/productService';
import { adaptProduct, type UnifiedProduct } from '../services/productAdapter';
import { useAuthState } from '@/features/auth/hooks/useAuthState';

export function useProductDetail(productId: string | number) {
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthState();
  const platform = (user?.platform as 'salla' | 'zid' | 'unknown') || 'unknown';

  const storeProducts = useProductStore(s => s.products);

  const fetchDetail = async () => {
    if (!productId || platform === 'unknown') return;

    try {
      setLoading(true);
      setError(null);

      // 1. محاولة إيجاد المنتج في الستور المحلي أولاً للعرض السريع
      const localProduct = storeProducts.find(p => String(p.id) === String(productId));
      if (localProduct) {
        setProduct(localProduct);
        // ننهي حالة التحميل الأولية لأن لدينا بيانات صالحة للعرض الفوري
        setLoading(false);
      }

      // 2. جلب نسخة حديثة من الـ API
      const rawResponse = await productService.getProductById(productId);
      
      // سلة ترجع المنتج داخل data. كائن منفرد
      const cleanRaw = platform === 'salla' && rawResponse?.data ? rawResponse.data : rawResponse;
      
      const adapted = adaptProduct(cleanRaw);

      setProduct(adapted);
    } catch (err: any) {
      console.error('[useProductDetail] Error:', err);
      // إذا لم يكن لدينا منتج محلي عُرض بالفعل، نظهر خطأ الشاشة الكاملة
      if (!product) {
        setError(err.message || 'فشل جلب تفاصيل المنتج');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [productId, platform]);

  return {
    product,
    loading,
    error,
    refetch: fetchDetail
  };
}
