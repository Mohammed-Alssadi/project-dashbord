import type { SallaCustomerItem, ZidCustomerItem } from '../types/customer';

// ==========================================
// SALLA PARSERS
// ==========================================

export const parseSallaCustomer = (rawCustomer: any): SallaCustomerItem => {
  return rawCustomer as SallaCustomerItem;
};

export const parseSallaCustomerList = (response: any): SallaCustomerItem[] => {
  const list = response?.data || [];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(parseSallaCustomer);
};

export const parseSallaCustomerDetails = (rawDetails: any): SallaCustomerItem => {
  // Salla usually returns the customer inside response.data for detail endpoints
  const details = rawDetails?.data || rawDetails;
  return details as SallaCustomerItem;
};

// ==========================================
// ZID PARSERS
// ==========================================

export const parseZidCustomer = (rawCustomer: any): ZidCustomerItem => {
  return rawCustomer as ZidCustomerItem;
};

export const parseZidCustomerList = (response: any): ZidCustomerItem[] => {
  const list = response?.customers || response?.results || [];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(parseZidCustomer);
};

export const parseZidCustomerDetails = (rawDetails: any): ZidCustomerItem => {
  // Zid usually returns the customer inside response.customer for detail endpoints
  const details = rawDetails?.customer || rawDetails;
  return details as ZidCustomerItem;
};
