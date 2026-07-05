import axios from 'axios';
import crypto from 'crypto';
import { BasePlatform } from './BasePlatform.js';

const zidConfig = {
  clientId: process.env.ZID_CLIENT_ID,
  clientSecret: process.env.ZID_CLIENT_SECRET,
  redirectUri: process.env.ZID_REDIRECT_URI || `${process.env.APP_URL}/auth/zid/callback`,
  authBaseUrl: process.env.ZID_AUTH_BASE_URL || 'https://oauth.zid.sa'
};


export class ZidPlatform extends BasePlatform {
  async generateAuthUrl() {
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `${zidConfig.authBaseUrl}/oauth/authorize?` +
      `response_type=code` +
      `&client_id=${zidConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(zidConfig.redirectUri)}` +
      `&state=${state}`;

    return { authUrl, state };
  }

  async exchangeCodeForTokens(code) {
    try {
      const response = await axios.post(`${zidConfig.authBaseUrl}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: Number(zidConfig.clientId),
        client_secret: zidConfig.clientSecret,
        redirect_uri: zidConfig.redirectUri,
        code
      });
      return response.data; // { access_token, refresh_token, authorization, expires_in }
    } catch (error) {
      console.error('Zid Auth Exchange Error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Zid code for tokens');
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${zidConfig.authBaseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: Number(zidConfig.clientId),
        client_secret: zidConfig.clientSecret,
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      console.error('Zid Token Refresh Error:', error.response?.data || error.message);
      throw new Error('Failed to refresh Zid access token');
    }
  }

  /**
   * تطبيع التوكنات الخاصة بزد للصيغة الموحدة
   * زد تُعيد: { authorization, access_token, refresh_token, expires_in }
   * - authorization = Bearer token لاستدعاءات الـ API (المنتجات، التصنيفات)
   * - access_token  = Manager Token لـ X-Manager-Token header
   * @param {object} rawTokens
   * @returns {{ accessToken, refreshToken, managerToken, expiresAt }}
   */
  normalizeTokens(rawTokens) {
    const expiresAt = new Date(Date.now() + (rawTokens.expires_in || 86400) * 1000);
    return {
      accessToken: rawTokens.authorization || null, // Bearer token للـ API
      refreshToken: rawTokens.refresh_token || null,
      managerToken: rawTokens.access_token || null, // X-Manager-Token header
      expiresAt
    };
  }

  async fetchProfile(accessToken, managerToken) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Manager-Token': managerToken || '',
        'Accept-Language': 'ar',
        Accept: 'application/json'
      };

      const [meResponse, storeResponse] = await Promise.all([
        axios.get('https://api.zid.sa/v1/managers/account/profile', { headers, timeout: 10000 }),
        axios.get('https://api.zid.sa/v1/managers/account/store', { headers, timeout: 10000 })
      ]);

      const user = meResponse.data.user || {};
      const store = storeResponse.data.store || {};

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile
        },
        store: {
          id: store.id,
          name: store.title,
          title: store.title,
          url: store.url,
          phone: store.phone,
          email: store.email
        }
      };
    } catch (error) {
      console.error('Zid Profile Fetch Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch merchant profile from Zid');
    }
  }

  async fetchStoreProfile(accessToken, managerToken) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Manager-Token': managerToken || '',
        'Accept-Language': 'ar',
        Accept: 'application/json'
      };

      const response = await axios.get('https://api.zid.sa/v1/managers/account/store', { headers, timeout: 10000 });
      const store = response.data.store || {};

      return {
        id: store.id,
        name: store.title,
        domain: store.url,
        avatar: null,
        plan: null,
        status: null,
        description: store.description || '',
        currency: store.currency || 'SAR',
        verified: true,
        licenses: {
          taxNumber: '',
          commercialNumber: '',
          freelanceNumber: ''
        },
        social: {
          whatsapp: store.phone || '',
          twitter: '',
          instagram: '',
          snapchat: '',
          telegram: '',
          youtube: '',
          maroof: '',
          facebook: ''
        }
      };
    } catch (error) {
      console.error('Zid Store Profile Fetch Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch store details from Zid');
    }
  }

  async fetchProducts(accessToken, managerToken, queryParams) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Manager-Token': managerToken || '',
        'Store-Id': String(queryParams?.storeId || ''),
        'Accept-Language': 'ar',
        Accept: 'application/json'
      };

      // زد API فلاتر: page, per_page, q (وليس keyword), categories
      const params = {};
      if (queryParams?.page)      params.page       = queryParams.page;
      if (queryParams?.per_page)  params.per_page   = queryParams.per_page;
      if (queryParams?.keyword)   params.q          = queryParams.keyword;    // زد يستخدم 'q' وليس 'keyword'
      if (queryParams?.category)  params.categories = queryParams.category;  // فلتر بالتصنيف
      // ملاحظة: زد لا يدعم فلتر status في هذا endpoint — يُتجاهل تلقائياً

      const response = await axios.get('https://api.zid.sa/v1/products', {
        headers,
        timeout: 10000,
        params
      });

      const rawProducts = response.data.results || response.data.products || [];
      const totalCount = response.data.count || rawProducts.length;
      const perPage = Number(queryParams?.per_page) || 24;

      // بناء هيكل Pagination موحد يتطابق مع متطلبات الفرونت إند والـ controllers
      const pagination = {
        current_page: Number(queryParams?.page) || 1,
        total_pages: Math.ceil(totalCount / perPage) || 1,
        per_page: perPage,
        total: totalCount
      };

      return {
        products: rawProducts,
        pagination
      };
    } catch (error) {
      console.error('Zid Products Fetch Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch products from Zid');
    }
  }

  async fetchCategories(accessToken, managerToken, queryParams) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Manager-Token': managerToken || '',
        'Store-Id': String(queryParams?.storeId || ''),
        'Accept-Language': 'ar',
        Accept: 'application/json'
      };

      const params = {};
      if (queryParams?.page) params.page = queryParams.page;

      const response = await axios.get('https://api.zid.sa/v1/managers/store/categories', {
        headers,
        timeout: 10000,
        params
      });

      const categories = response.data.categories || [];

      return {
        categories,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('Zid Categories Fetch Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch categories from Zid');
    }
  }
}
