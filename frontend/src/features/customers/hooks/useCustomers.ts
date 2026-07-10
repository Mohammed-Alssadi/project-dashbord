import { useEffect } from 'react';
import { useCustomerStore } from '../store/customerStore';

export function useCustomers() {
  const customers = useCustomerStore(s => s.customers);
  const pagination = useCustomerStore(s => s.pagination);
  const loading = useCustomerStore(s => s.loading);
  const error = useCustomerStore(s => s.error);
  const fetchCustomers = useCustomerStore(s => s.fetchCustomers);
  const goToPage = useCustomerStore(s => s.goToPage);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    pagination,
    loading,
    error,
    goToPage,
    refresh: () => fetchCustomers(pagination.currentPage),
  };
}
