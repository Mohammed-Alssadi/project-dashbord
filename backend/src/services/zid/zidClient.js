import axios from 'axios';

export const fetchZidMerchantProfile = async (accessToken, managerToken) => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-MANAGER-TOKEN': managerToken || '',
      'Accept-Language': 'ar',
      'Accept': 'application/json'
    };

    // نطلب بيانات المستخدم (Me) وبيانات المتجر (Store) في نفس الوقت
    const [meResponse, storeResponse] = await Promise.all([
      axios.get('https://api.zid.sa/v1/managers/account/me', { headers }),
      axios.get('https://api.zid.sa/v1/managers/account/store', { headers })
    ]);

    const user = meResponse.data.user || {};
    const store = storeResponse.data.store || {};

    return {
      user,
      store
    };
  } catch (error) {
    console.error('Zid Profile Fetch Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch Zid merchant profile and store details');
  }
};
