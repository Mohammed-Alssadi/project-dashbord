import axios from 'axios';

/**
 * دالة لتوحيد وتصفية البيانات القادمة من سلة
 * حتى يتعامل معها الفرونت إند بشكل نظيف وموحد
 */
const normalizeSallaStoreInfo = (sallaData) => {
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
      facebook: sallaData.social?.facebook || '',
    }
  };
};

export const storeProxyService = {
  /**
   * جلب بيانات المتجر بناءً على المنصة
   */
  getStoreProfile: async (platform, accessToken) => {
    try {
      if (platform === 'salla') {
        const response = await axios.get('https://api.salla.dev/admin/v2/store/info', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        return {
          platform: 'salla',
          success: true,
          data: normalizeSallaStoreInfo(response.data.data)
        };
      } 
      
      if (platform === 'zid') {
        // // TODO: بناء تكامل زد مستقبلاً عندما يكون جاهزاً
        // const response = await axios.get('ZID_STORE_INFO_ENDPOINT', { ... });
        // return normalizeZidStoreInfo(response.data);
        return {
          platform: 'zid',
          success: false,
          message: "تكامل زد غير مدعوم حالياً في هذه الوظيفة"
        };
      }

      throw new Error('منصة غير مدعومة');
      
    } catch (error) {
      console.error(`Error fetching store profile for ${platform}:`, error.response?.data || error.message);
      return {
        success: false,
        message: 'فشل في جلب بيانات المتجر من المنصة'
      };
    }
  }
};
