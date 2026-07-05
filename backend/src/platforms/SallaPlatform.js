import axios from 'axios';
import crypto from 'crypto';
import { BasePlatform } from './BasePlatform.js';

const sallaConfig = {
  clientId: process.env.SALLA_CLIENT_ID,
  clientSecret: process.env.SALLA_CLIENT_SECRET,
  redirectUri: process.env.SALLA_REDIRECT_URI || `${process.env.APP_URL}/auth/salla/callback`,
  scopes: process.env.SALLA_SCOPES || 'offline_access read_products read_categories',
  authBaseUrl: process.env.SALLA_AUTH_BASE_URL || 'https://accounts.salla.sa',
  apiBaseUrl: process.env.SALLA_API_BASE_URL || 'https://api.salla.dev/admin/v2'
};


export class SallaPlatform extends BasePlatform {
  async generateAuthUrl() {
    // crypto.randomBytes آمن خلآ من التنبؤ (cryptographically secure)
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `${sallaConfig.authBaseUrl}/oauth2/auth?` +
      `response_type=code` +
      `&client_id=${sallaConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(sallaConfig.redirectUri)}` +
      (sallaConfig.scopes ? `&scope=${encodeURIComponent(sallaConfig.scopes)}` : '') +
      `&state=${state}`;

    return { authUrl, state };
  }

  async exchangeCodeForTokens(code) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', sallaConfig.clientId);
      params.append('client_secret', sallaConfig.clientSecret);
      params.append('redirect_uri', sallaConfig.redirectUri);
      params.append('code', code);

      const response = await axios.post(`${sallaConfig.authBaseUrl}/oauth2/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      return response.data; // { access_token, refresh_token, expires_in, token_type }
    } catch (error) {
      console.error('Salla Auth Exchange Error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Salla oauth code for tokens');
    }
  }

  async refreshToken(refreshToken) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', sallaConfig.clientId);
      params.append('client_secret', sallaConfig.clientSecret);
      params.append('refresh_token', refreshToken);

      const response = await axios.post(`${sallaConfig.authBaseUrl}/oauth2/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      return response.data;
    } catch (error) {
      console.error('Salla Token Refresh Error:', error.response?.data || error.message);
      throw new Error('Failed to refresh Salla access token');
    }
  }

  async fetchProfile(accessToken, managerToken) {
    // سلة تستخدم accessToken فقط — managerToken غير مطلوب لكن يُقبَل للتوافق مع BasePlatform
    try {
      const response = await axios.get(`${sallaConfig.authBaseUrl}/oauth2/user/info`, {
        timeout: 10000,
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = response.data.data;
      return {
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          mobile: data.mobile
        },
        store: {
          id: data.merchant?.id,
          name: data.merchant?.name,
          title: data.merchant?.name,
          url: data.merchant?.domain,
          phone: data.mobile,
          email: data.email
        }
      };
    } catch (error) {
      console.error('Salla fetchProfile Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch merchant profile from Salla');
    }
  }

  /**
   * تطبيع التوكنات الخاصة بسلة للصيغة الموحدة
   * سلة تُعيد: { access_token, refresh_token, expires_in }
   * @param {object} rawTokens
   * @returns {{ accessToken, refreshToken, managerToken, expiresAt }}
   */
  normalizeTokens(rawTokens) {
    const expiresAt = new Date(Date.now() + (rawTokens.expires_in || 86400) * 1000);
    return {
      accessToken: rawTokens.access_token || null,
      refreshToken: rawTokens.refresh_token || null,
      managerToken: null, // سلة لا تحتاج managerToken
      expiresAt
    };
  }

  async fetchStoreProfile(accessToken) {
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
        currency: sallaData.currency || 'SAR',
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
      console.error('Salla fetchStoreProfile Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch store details from Salla');
    }
  }

  async fetchProducts(accessToken, managerToken, queryParams) {
    try {
      // سلة API فلاتر: page, per_page, keyword, status, category_id
      const params = {};
      if (queryParams?.page)      params.page         = queryParams.page;
      if (queryParams?.per_page)  params.per_page     = queryParams.per_page;
      if (queryParams?.keyword)   params.keyword      = queryParams.keyword;   // بحث بالاسم أو SKU
      if (queryParams?.category)  params.category_id  = Number(queryParams.category); // فلتر بالقسم

      // سلة تدعم فلترة الحالة في الـ API بقيم محددة: sale, hidden, out_of_stock
      if (queryParams?.status) {
        if (queryParams.status === 'active') {
          params.status = 'sale';
        } else if (queryParams.status === 'hidden') {
          params.status = 'hidden';
        } else if (queryParams.status === 'out_of_stock') {
          params.status = 'out_of_stock';
        }
      }

      const response = await axios.get(`${sallaConfig.apiBaseUrl}/products`, {
        timeout: 10000,
        params,
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      let products = response.data.data || [];

      // بما أن API سلة أحياناً يتجاهل معامل category_id، نقوم بتطبيق الفلترة برمجياً 
      // كطبقة حماية إضافية (مسموح بها حسب شرط التاجر لأن الفلتر له Endpoint رسمي)
      if (queryParams?.category) {
        const targetCatId = String(queryParams.category);
        products = products.filter(p => 
          Array.isArray(p.categories) && p.categories.some(c => String(c.id) === targetCatId)
        );
      }

      return {
        products,
        pagination: response.data.pagination || response.data.meta?.pagination || null
      };
    } catch (error) {
      console.error('Salla fetchProducts Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch products from Salla');
    }
  }

  async fetchCategories(accessToken, managerToken, queryParams) {
    try {
      // سلة API فلاتر: page, per_page, keyword, status
      const params = {};
      if (queryParams?.page)      params.page     = queryParams.page;
      if (queryParams?.per_page)  params.per_page = queryParams.per_page;
      if (queryParams?.keyword)   params.keyword  = queryParams.keyword;  // بحث باسم القسم
      if (queryParams?.status === 'active' || queryParams?.status === 'hidden') {
        params.status = queryParams.status;
      }

      const response = await axios.get(`${sallaConfig.apiBaseUrl}/categories`, {
        timeout: 10000,
        params,
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return {
        categories: response.data.data || [],
        pagination: response.data.pagination || response.data.meta?.pagination || null
      };
    } catch (error) {
      console.error('Salla fetchCategories Error:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.data?.error?.code === 'Unauthorized') {
        throw new Error('Unauthorized_Scope: The application lacks permissions to read categories (categories.read). Please re-link Salla store to activate.');
      }
      throw new Error('Failed to fetch categories from Salla');
    }
  }
}
