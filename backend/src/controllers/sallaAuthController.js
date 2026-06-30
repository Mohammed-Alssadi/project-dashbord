import { sallaConfig } from '../services/salla/sallaConfig.js';
import { exchangeSallaCodeForTokens } from '../services/salla/sallaAuth.js';
import { fetchSallaMerchantProfile } from '../services/salla/sallaClient.js';
import { LinkedStore, StoreToken } from '../models/index.js';

// sallaAuthController.js
// متحكم مصادقة سلة (Salla Auth Controller)
// دور هذا المتحكم هو التنسيق فقط واستدعاء الخدمات المعزولة وإرجاع الاستجابات للويب

/**
 * 1. تهيئة الربط وتوليد رابط OAuth سلة
 * GET /auth/salla/redirect
 */
export const handleSallaRedirect = async (req, res) => {
  try {
    // بناء رابط OAuth الآمن باستخدام العناوين المخزنة في sallaConfig
    const authUrl = `${sallaConfig.authBaseUrl}/oauth2/auth?` +
      `response_type=code` +
      `&client_id=${sallaConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(sallaConfig.redirectUri)}` +
      (sallaConfig.scopes ? `&scope=${sallaConfig.scopes}` : '') +
      `&state=salla_secure_state`;

    // إرجاع الرابط كاستجابة JSON للفرونت إند ليقوم بتحويل متصفح العميل إليه
    res.json({ success: true, oauthUrl: authUrl });
  } catch (error) {
    console.error('Salla Redirect Error:', error);
    res.status(500).json({ success: false, message: ' salla connect error' });
  }
};

/**
 * 2. معالجة رمز الـ Callback الراجع من سلة وإتمام عملية الحفظ والتحويل
 * GET /auth/salla/callback
 */
export const handleSallaCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${sallaConfig.frontendUrl}/dashboard/stores?error=no_code_provided`);
  }
  try {
    // 1. استدعاء الخدمة لمقايضة الكود المؤقت بالتوكن الحقيقي
    const tokens = await exchangeSallaCodeForTokens(code);
    // 2. جلب بيانات الملف التعريفي (يحتوي على بيانات المستخدم + بيانات المتجر)
    const profileData = await fetchSallaMerchantProfile(tokens.access_token);
    const merchant = profileData.merchant; // بيانات المتجر (الاسم، الدومين، الخ)
    // profileData يحتوي أيضاً على: profileData.id, profileData.name, profileData.email (بيانات المستخدم لتسجيل الدخول)
    // 3. البحث عن المتجر أو إنشاؤه في قاعدة البيانات للحصول على الـ ID الخاص به
    // (نستخدم findOrCreate لأن upsert في MySQL قد لا تعيد الـ ID دائماً)
    const [store, created] = await LinkedStore.findOrCreate({
      where: {
        platform: 'salla',
        platformStoreId: merchant.name
      },
      defaults: {
        userId: 1 // سيتم تغييره لاحقاً لربطه بالمستخدم الحقيقي الذي سجل دخوله
      }
    });
    // 4. حساب وقت انتهاء صلاحية التوكن (الوقت الحالي + ثواني الصلاحية)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    // 5. حفظ التوكنز في جدول store_tokens وربطها بالمتجر (store.id)
    const [tokenRecord, tokenCreated] = await StoreToken.findOrCreate({
      where: { storeId: store.id },
      defaults: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt
      }
    });
    // إذا كان التوكن موجوداً مسبقاً (التاجر يسجل دخوله مرة أخرى)، نقوم بتحديث البيانات
    if (!tokenCreated) {
      await tokenRecord.update({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt
      });
    }
    // 6. إعادة التوجيه للفرونت إند مع رسالة النجاح
    res.redirect(`${sallaConfig.frontendUrl}/dashboard/stores?success=true`);
  } catch (error) {
    console.error('Salla OAuth Callback Detailed Error:', error.response?.data || error.message);
    res.redirect(`${sallaConfig.frontendUrl}/dashboard/stores?error=oauth_exchange_failed`);
  }
};
