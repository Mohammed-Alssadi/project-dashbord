import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';

export function useProducts() {
  const products    = useProductStore(s => s.products);
  const pagination  = useProductStore(s => s.pagination);
  const loading     = useProductStore(s => s.loading);
  const error       = useProductStore(s => s.error);
  const fetchProducts = useProductStore(s => s.fetchProducts);
  const goToPage    = useProductStore(s => s.goToPage);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    goToPage,
    refresh: () => fetchProducts(pagination.currentPage),
  };
}
