import User from '../../models/User.js';
import StoreToken from '../../models/StoreToken.js';
import { storeProxyService } from '../../services/integration/storeProxyService.js';
import cache from '../../utils/cache.js';

export const getStoreProfile = async (req, res) => {
  try {
    const userId = req.user.id; // comes from protect middleware

    // 1. تحقق من الكاش أولاً (إلا إذا تم طلب تحديث إجباري)
    const forceRefresh = req.query.force === 'true';
    const cacheKey = `store_profile_${userId}`;
    
    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          data: cachedData
        });
      }
    }

    // 2. إذا لم يكن في الكاش، جلب تفاصيل المستخدم لتحديد المنصة
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    // 3. جلب التوكن الخاص بالمستخدم
    const storeToken = await StoreToken.findOne({ where: { userId } });
    if (!storeToken || !storeToken.accessToken) {
      return res.status(401).json({ success: false, message: 'رمز الوصول للمنصة مفقود، يرجى إعادة تسجيل الدخول' });
    }

    // 4. استدعاء السيرفر الوسيط (Proxy) لجلب وتصفية البيانات
    const profileResponse = await storeProxyService.getStoreProfile(user.platform, storeToken.accessToken);

    if (!profileResponse.success) {
      return res.status(400).json({ success: false, message: profileResponse.message });
    }

    // 5. حفظ النتيجة في الكاش (الافتراضي 5 دقائق حسب إعدادات utils/cache.js)
    cache.set(cacheKey, profileResponse.data);

    // 6. إرجاع البيانات النظيفة للفرونت إند
    return res.status(200).json({
      success: true,
      source: 'api',
      data: profileResponse.data
    });

  } catch (error) {
    console.error('Error in getStoreProfile controller:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء جلب بيانات المتجر' });
  }
};
