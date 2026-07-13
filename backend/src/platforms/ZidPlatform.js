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

  async fetchRawMerchantProfile(accessToken, managerToken) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Manager-Token': managerToken || '',
        'Accept-Language': 'ar',
        Accept: 'application/json'
      };
      
      const response = await axios.get('https://api.zid.sa/v1/managers/account/profile', { headers, timeout: 10000 });
      return response.data; // Return the entire raw object
    } catch (error) {
      console.error('Zid Raw Merchant Profile Fetch Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch raw merchant profile from Zid');
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

      // ─── جلب 5 نقاط نهاية بشكل متوازٍ — فشل أي منها لن يوقف الباقي ──────────
      const [
        storeResult,
        brandingResult,
        socialResult,
        localizationResult,
        businessResult
      ] = await Promise.allSettled([
        axios.get('https://api.zid.sa/v1/managers/account/store',              { headers, timeout: 10000 }),
        axios.get('https://api.zid.sa/v1/managers/account/store/branding',     { headers, timeout: 8000 }),
        axios.get('https://api.zid.sa/v1/managers/account/store/social',       { headers, timeout: 8000 }),
        axios.get('https://api.zid.sa/v1/managers/account/store/localization', { headers, timeout: 8000 }),
        axios.get('https://api.zid.sa/v1/managers/account/store/business',     { headers, timeout: 8000 })
      ]);

      // ─── استخلاص البيانات الخام من كل نتيجة بأمان ────────────────────────────
      const store       = storeResult.status        === 'fulfilled' ? (storeResult.value.data?.store || {})               : {};
      const brandingRaw = brandingResult.status     === 'fulfilled' ? (brandingResult.value.data?.branding || null)       : null;
      const socialRaw   = socialResult.status       === 'fulfilled' ? (socialResult.value.data?.social || null)           : null;
      const localeRaw   = localizationResult.status === 'fulfilled' ? (localizationResult.value.data?.localization || null) : null;
      const businessRaw = businessResult.status     === 'fulfilled' ? (businessResult.value.data?.business || null)       : null;

      if (storeResult.status === 'rejected') {
        console.error('Zid store fetch failed:', storeResult.reason?.message);
        throw new Error('Failed to fetch base store data from Zid');
      }

      // ─── تطبيع بيانات الهوية البصرية (Branding) ──────────────────────────────
      const branding = brandingRaw ? {
        theme: brandingRaw.theme ? {
          id:        brandingRaw.theme.id,
          name:      brandingRaw.theme.name,
          mainImage: brandingRaw.theme.main_image || null,
          images:    brandingRaw.theme.images || []
        } : null,
        logo:  brandingRaw.logo  || null,
        icon:  brandingRaw.icon  || null,
        cover: brandingRaw.cover || null,
        colors: brandingRaw.colors ? {
          btnDefaultBackground: brandingRaw.colors.btn_default_background_color  || null,
          btnDefaultText:       brandingRaw.colors.btn_default_text_color        || null,
          btnDefaultBorder:     brandingRaw.colors.btn_default_border_color      || null,
          btnHoverBackground:   brandingRaw.colors.btn_hover_background_color    || null,
          btnPressedBackground: brandingRaw.colors.btn_pressed_background_color  || null,
          btnPressedText:       brandingRaw.colors.btn_pressed_text_color        || null,
          btnPressedBorder:     brandingRaw.colors.btn_pressed_border_color      || null
        } : null
      } : null;

      // ─── تطبيع بيانات التواصل الاجتماعي (Social) ─────────────────────────────
      const social = {
        whatsapp:  store.phone        || '',
        twitter:   socialRaw?.twitter   || '',
        instagram: socialRaw?.instagram || '',
        snapchat:  socialRaw?.snapchat  || '',
        facebook:  socialRaw?.facebook  || '',
        tiktok:    socialRaw?.tiktok    || '',
        telegram:  '',
        youtube:   '',
        maroof:    ''
      };

      // ─── تطبيع بيانات اللغة والعملة (Localization) ───────────────────────────
      const normalizeCurrency = (c) => c ? ({
        name:        c.name,
        code:        c.code,
        symbol:      (c.symbol || '').trim(),
        flag:        c.country?.flag        || null,
        countryName: c.country?.name        || null,
        countryCode: c.country?.code        || null
      }) : null;

      const localization = localeRaw ? {
        language: localeRaw.language ? {
          name:      localeRaw.language.name,
          code:      localeRaw.language.code,
          direction: localeRaw.language.direction
        } : null,
        languages: (localeRaw.languages || []).map(l => ({
          name:      l.name,
          code:      l.code,
          direction: l.direction
        })),
        currency:   normalizeCurrency(localeRaw.currency),
        // إزالة التكرار من قائمة العملات بناءً على code+id معاً
        currencies: (localeRaw.currencies || [])
          .filter((c, idx, arr) => arr.findIndex(x => x.code === c.code && x.id === c.id) === idx)
          .map(normalizeCurrency)
      } : null;

      // ─── تطبيع بيانات النشاط التجاري (Business) ─────────────────────────────
      const bd       = businessRaw?.store_business_data || null;
      const business = bd ? {
        businessType:                  bd.business_type              || null,
        corporateName:                 bd.business_corporate_name    || null,
        commercialName:                bd.commercial_name            || null,
        maroofNumber:                  bd.maroof_number              || null,
        civilId:                       bd.civil_id                   || null,
        hasBranches:                   bd.has_branches               ?? false,
        branchCount:                   bd.branch_no                  || null,
        employeeCount:                 bd.employee_no                || null,
        email:                         bd.email                      || null,
        isMaroofChecked:               bd.is_maroof_checked          ?? false,
        isFreelanceChecked:            bd.is_freelance_checked       ?? false,
        commercialRegisterCertificate: bd.commercial_register_certificate || null,
        maroofCertificate:             bd.maroof_certificate         || null,
        civilIdImage:                  bd.civil_id_image             || null,
        commercialRegistrationNumber:  businessRaw.commercial_registration_number || null
      } : null;

      // ─── الكائن النهائي الموحّد المُرسَل للفرونت إند ─────────────────────────
      return {
        id:          store.id                         || null,
        name:        store.title                      || '',
        domain:      store.url                        || '',
        avatar:      branding?.icon || branding?.logo || store.logo || null,
        phone:       store.phone                      || null,
        email:       store.email                      || null,
        timezone:    store.timezone                   || null,
        plan:        store.plan_name || store.plan    || null,
        status:      store.status                     || null,
        description: store.description               || '',
        currency:    localization?.currency?.code    || store.currency || 'SAR',
        verified:    true,
        licenses: {
          taxNumber:        store.tax_number        || '',
          commercialNumber: store.commercial_register || '',
          freelanceNumber:  ''
        },
        social,
        branding,
        localization,
        business
      };
    } catch (error) {
      console.error('Zid Store Profile Fetch Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch store details from Zid');
    }
  }

}

