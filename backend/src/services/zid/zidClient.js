import axios from 'axios';

export const fetchZidMerchantProfile = async (accessToken, managerToken) => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Manager-Token': managerToken || '',
      'Accept-Language': 'ar',
      Accept: 'application/json'
    };

    // نطلب بيانات المستخدم وبيانات المتجر في نفس الوقت مع timeout
    const [meResponse, storeResponse] = await Promise.all([
      axios.get('https://api.zid.sa/v1/managers/account/profile', { headers, timeout: 10000 }),
      axios.get('https://api.zid.sa/v1/managers/account/store', { headers, timeout: 10000 })
    ]);

    const user = meResponse.data.user || {};
    const store = storeResponse.data.store || {};

    return { user, store };
  } catch (error) {
    console.error('Zid Profile Fetch Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch Zid merchant profile and store details');
  }
};

/**
 * دالة جلب وتوحيد تفاصيل متجر زد مباشرة من الـ API
 * @param {string} accessToken
 * @param {string} managerToken
 * @returns {Promise<object>}
 */
export const fetchZidStoreProfile = async (accessToken, managerToken) => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Manager-Token': managerToken || '',
      'Accept-Language': 'ar',
      Accept: 'application/json'
    };

    const response = await axios.get('https://api.zid.sa/v1/managers/account/store', { headers, timeout: 10000 });
    const zidData = response.data.store || {};

    return {
      id: zidData.id,
      name: zidData.title,
      domain: zidData.url,
      avatar: null,
      plan: null,
      status: null,
      description: zidData.description || '',
      currency: zidData.currency || 'SAR',
      verified: true,
      licenses: {
        taxNumber: '',
        commercialNumber: '',
        freelanceNumber: ''
      },
      social: {
        whatsapp: zidData.phone || '',
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
    throw new Error('Failed to fetch store details from Zid platform');
  }
};


