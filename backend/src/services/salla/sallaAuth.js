import axios from 'axios';
import { sallaConfig } from './sallaConfig.js';

// sallaAuth.js
// منطق المصادقة والـ OAuth وإدارة التوكنز لـ منصة سلة (Salla Auth Service)

/**
 * دالة مقايضة كود التفويض المؤقت برموز الوصول الدائمة
 * @param {string} code - كود التفويض القادم من سلة عبر الـ Callback
 * @returns {Promise<object>} - التوكنز والبيانات المستلمة (access_token, refresh_token, expires_in)
 */
export const exchangeSallaCodeForTokens = async (code) => {
  try {
    // تنسيق البيانات كـ Form Data (x-www-form-urlencoded) كما تفرضه معايير OAuth2 في سلة
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', sallaConfig.clientId);
    params.append('client_secret', sallaConfig.clientSecret);
    params.append('redirect_uri', sallaConfig.redirectUri);
    params.append('code', code);

    const response = await axios.post(`${sallaConfig.authBaseUrl}/oauth2/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data; // { access_token, refresh_token, expires_in, token_type }
  } catch (error) {
    console.error('Salla Auth Exchange Error:', error.response?.data || error.message);
    throw new Error('فشلت عملية تبادل الكود بالتوكنز مع منصة سلة');
  }
};

/**
 * دالة تجديد الـ Access Token منتهي الصلاحية باستخدام الـ Refresh Token
 * @param {string} refreshToken - رمز التحديث الخاص بالمتجر
 * @returns {Promise<object>} - التوكنز الجديدة المستلمة
 */
export const refreshSallaToken = async (refreshToken) => {
  try {
    // تنسيق البيانات كـ Form Data (x-www-form-urlencoded) لتجديد توكن سلة
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', sallaConfig.clientId);
    params.append('client_secret', sallaConfig.clientSecret);
    params.append('refresh_token', refreshToken);

    const response = await axios.post(`${sallaConfig.authBaseUrl}/oauth2/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data; // يعيد كائن التوكنز الجديد
  } catch (error) {
    console.error('Salla Token Refresh Error:', error.response?.data || error.message);
    throw new Error('فشل تجديد توكن الوصول لمنصة سلة');
  }
};
