import type { SallaProductItem, ZidProductItem } from '../types/product';

/**
 * Extracts localized string value from an object (checking 'ar' and 'en') or returns the string.
 */
export const extractName = (name: any): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    return name.ar || name.en || '';
  }
  return String(name);
};

// ==========================================
// SALLA PARSERS
// ==========================================

export const parseSallaProduct = (rawProduct: any): SallaProductItem => {
  return rawProduct as SallaProductItem;
};

export const parseSallaProductList = (response: any): SallaProductItem[] => {
  const list = response?.data || [];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(parseSallaProduct);
};

export const parseSallaDetails = (rawDetails: any): SallaProductItem => {
  return rawDetails as SallaProductItem;
};

// ==========================================
// ZID PARSERS
// ==========================================

export const parseZidProduct = (rawProduct: any): ZidProductItem => {
  return rawProduct as ZidProductItem;
};

export const parseZidProductList = (response: any): ZidProductItem[] => {
  const list = response?.results || [];
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(parseZidProduct);
};

export const parseZidDetails = (rawDetails: any): ZidProductItem => {
  return rawDetails as ZidProductItem;
};
