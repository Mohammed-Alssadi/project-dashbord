import { User, StoreToken } from '../../models/index.js';
import { fetchSallaStoreProfile } from '../../services/salla/sallaClient.js';
import { fetchZidStoreProfile } from '../../services/zid/zidClient.js';
import cache from '../../utils/cache.js';

export const getStoreProfile = async (req, res) => {
  try {
    const userId = req.user.id;

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

    // 2. جلب تفاصيل المستخدم لتحديد المنصة
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    // 3. جلب التوكن الخاص بالمستخدم من قاعدة البيانات
    const storeToken = await StoreToken.findOne({ where: { userId } });
    if (!storeToken || !storeToken.accessToken) {
      return res.status(401).json({ success: false, message: 'رمز الوصول للمنصة مفقود، يرجى إعادة تسجيل الدخول' });
    }

    // 4. استدعاء الخدمة المباشرة للمنصة وجلب البيانات حية من الـ API
    let profileData = null;

    if (user.platform === 'salla') {
      profileData = await fetchSallaStoreProfile(storeToken.accessToken);
    } else if (user.platform === 'zid') {
      profileData = await fetchZidStoreProfile(storeToken.accessToken, storeToken.managerToken);
    } else {
      return res.status(400).json({ success: false, message: 'المنصة الحالية غير مدعومة لجلب البيانات' });
    }

    if (!profileData) {
      return res.status(400).json({ success: false, message: 'فشل في جلب بيانات المتجر من المنصة' });
    }

    // 5. حفظ النتيجة في الكاش للسرعة (5 دقائق)
    cache.set(cacheKey, profileData);

    // 6. إرجاع البيانات للفرونت إند
    return res.status(200).json({
      success: true,
      source: 'api',
      data: profileData
    });

  } catch (error) {
    console.error('Error in getStoreProfile controller:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء جلب بيانات المتجر' });
  }
};
