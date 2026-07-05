import axios from 'axios';
import { sallaConfig } from './sallaConfig.js';

// sallaClient.js
// عميل الاتصال واستدعاء الميزات لمتجر سلة (Salla API Client Service)

/**
 * دالة جلب بيانات التاجر والملف التعريفي للمتجر في سلة
 * @param {string} accessToken - رمز الوصول النشط الخاص بالمتجر
 * @returns {Promise<object>} - كائن التاجر والمعلومات العامة (merchant)
 */
export const fetchSallaMerchantProfile = async (accessToken) => {
  try {
    const response = await axios.get(`${sallaConfig.authBaseUrl}/oauth2/user/info`, {
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Salla Profile Fetch Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch merchant profile data from Salla platform');
  }
};

/**
 * دالة جلب وتوحيد تفاصيل المتجر بالكامل مباشرة من سلة
 * @param {string} accessToken
 * @returns {Promise<object>}
 */
export const fetchSallaStoreProfile = async (accessToken) => {
  try {
    const response = await axios.get(`${sallaConfig.apiBaseUrl}/store/info`, {
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    const sallaData = response.data.data;
    if (!sallaData) return null;

    return {
      id: sallaData.id,
      name: sallaData.name,
      domain: sallaData.domain,
      avatar: sallaData.avatar,
      plan: sallaData.plan,
      status: sallaData.status,
      description: sallaData.description || '',
      currency: sallaData.currency || '',
      verified: sallaData.verified || false,
      licenses: {
        taxNumber: sallaData.licenses?.tax_number || '',
        commercialNumber: sallaData.licenses?.commercial_number || '',
        freelanceNumber: sallaData.licenses?.freelance_number || ''
      },
      social: {
        whatsapp: sallaData.social?.whatsapp || '',
        twitter: sallaData.social?.twitter || '',
        instagram: sallaData.social?.instagram || '',
        snapchat: sallaData.social?.snapchat || '',
        telegram: sallaData.social?.telegram || '',
        youtube: sallaData.social?.youtube || '',
        maroof: sallaData.social?.maroof || '',
        facebook: sallaData.social?.facebook || ''
      }
    };
  } catch (error) {
    console.error('Salla Store Info Fetch Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch store details from Salla platform');
  }
};


/**
 * دالة استدعاء منتجات متجر سلة مع الفلترة والتقسيم
 * @param {string} accessToken - رمز الوصول
 * @param {object} filters - معايير البحث والفلترة والصفحات
 * @returns {Promise<object>} - المنتجات وبيانات الترقيم
 */
export const fetchSallaProducts = async (accessToken, filters = {}) => {
  try {
    const response = await axios.get(`${sallaConfig.apiBaseUrl}/products`, {
      timeout: 10000,
      params: {
        page: filters.page,
        per_page: filters.per_page,
        keyword: filters.keyword,
        status: filters.status,
        category_id: filters.category
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return {
      products: response.data.data || [],
      pagination: response.data.pagination || response.data.meta?.pagination || null
    };
  } catch (error) {
    console.error('Salla Products Fetch Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch products from Salla platform');
  }
};

/**
 * دالة استدعاء تصنيفات متجر سلة
 * @param {string} accessToken - رمز الوصول
 * @param {object} filters - معايير البحث والصفحات
 * @returns {Promise<object>} - التصنيفات وبيانات الترقيم
 */
export const fetchSallaCategories = async (accessToken, filters = {}) => {
  try {
    const response = await axios.get(`${sallaConfig.apiBaseUrl}/categories`, {
      timeout: 10000,
      params: {
        page: filters.page,
        per_page: filters.per_page,
        keyword: filters.keyword,
        status: filters.status
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return {
      categories: response.data.data || [],
      pagination: response.data.pagination || response.data.meta?.pagination || null
    };
  } catch (error) {
    console.error('Salla Categories Fetch Error:', error.response?.data || error.message);
    const errData = error.response?.data;
    if (errData?.error?.code === 'Unauthorized' || error.response?.status === 401) {
      throw new Error('Unauthorized_Scope: The application lacks permissions to read categories (categories.read). Please re-link your Salla store to activate this permission.');
    }
    throw new Error('Failed to fetch categories from Salla platform');
  }
};
