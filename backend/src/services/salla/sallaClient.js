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
    // استدعاء رابط تفاصيل الحساب من سلة (يجلب بيانات المستخدم والتاجر معاً)
    const response = await axios.get(`${sallaConfig.authBaseUrl}/oauth2/user/info`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // تمرير التوكن في الترويسة للمصادقة
      }
    });
    
    // إرجاع الكائن كاملاً (يحتوي على بيانات المستخدم للـ login وبيانات المتجر merchant للربط)
    return response.data.data; 
  } catch (error) {
    console.error('Salla Profile Fetch Error:', error.response?.data || error.message);
    throw new Error('فشل جلب بيانات الملف التعريفي للتاجر من منصة سلة');
  }
};

/**
 * دالة استدعاء منتجات متجر سلة (مثال أولي للمزامنة)
 * @param {string} accessToken - رمز الوصول
 * @returns {Promise<Array>} - مصفوفة المنتجات
 */
export const fetchSallaProducts = async (accessToken) => {
  try {
    const response = await axios.get(`${sallaConfig.apiBaseUrl}/products`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Salla Products Fetch Error:', error.response?.data || error.message);
    throw new Error('فشل جلب المنتجات من منصة سلة');
  }
};
