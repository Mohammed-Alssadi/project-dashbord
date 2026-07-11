import type { SallaCategoryItem, ZidCategoryItem } from '../types/category';

// ==========================================
// SALLA ADAPTERS
// ==========================================

export const parseSallaCategoryList = (response: any): SallaCategoryItem[] => {
  const data = response?.categories || response?.data || response || [];
  if (!Array.isArray(data)) return [];
  
  return data.map((item: any) => ({
    ...item,
    id: item.id || Math.random().toString(),
  }));
};

export const parseSallaCategoryDetails = (response: any): SallaCategoryItem => {
  const data = response?.data || response;
  return {
    ...data,
  };
};

// ==========================================
// ZID ADAPTERS
// ==========================================

export const parseZidCategoryList = (response: any): ZidCategoryItem[] => {
  const data = response?.categories || response?.data || response?.results || response || [];
  if (!Array.isArray(data)) return [];

  return data.map((item: any) => ({
    ...item,
    id: item.id || item.uuid || Math.random().toString(),
  }));
};

export const parseZidCategoryDetails = (response: any): ZidCategoryItem => {
  const data = response?.categories || response?.category || response?.data || response;
  return {
    ...data,
  };
};
