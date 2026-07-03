import jwt from 'jsonwebtoken';
import { sallaConfig } from '../../services/salla/sallaConfig.js';
import { exchangeSallaCodeForTokens } from '../../services/salla/sallaAuth.js';
import { fetchSallaMerchantProfile } from '../../services/salla/sallaClient.js';
import { StoreToken, User } from '../../models/index.js';

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
    const profileData = await fetchSallaMerchantProfile(tokens.access_token);
    const merchant = profileData.merchant; // بيانات المتجر
    const sallaUser = profileData; // بيانات المستخدم

    // لا نقوم بالبحث عن التوكن الحالي، لأننا في نظام (جلسة لكل متجر).
    // الدخول الجديد يعني استبدال الجلسة الحالية تماماً.
    
    // البحث عن المتجر أو إنشاؤه بناءً على platform_store_id
    let [user, created] = await User.findOrCreate({
      where: {
        platform: 'salla',
        platformStoreId: merchant.id.toString()
      },
      defaults: {
        name: sallaUser.name || 'Salla Merchant',
        email: sallaUser.email || null,
        avatarUrl: sallaUser.avatar || null,
        storeName: merchant.name || null,
        storeDomain: merchant.domain || null,
        storePhone: sallaUser.mobile || null
      }
    });

    // تحديث بيانات المتجر والتاجر إذا كانت موجودة مسبقاً (لضمان أن البيانات محدثة)
    if (!created) {
      await user.update({
        name: sallaUser.name || user.name,
        email: sallaUser.email || user.email,
        avatarUrl: sallaUser.avatar || user.avatarUrl,
        storeName: merchant.name || user.storeName,
        storeDomain: merchant.domain || user.storeDomain,
        storePhone: sallaUser.mobile || user.storePhone
      });
    }

    // حفظ التوكنز في جدول store_tokens وربطها بهذا الـ User
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    const [tokenRecord, tokenCreated] = await StoreToken.findOrCreate({
      where: { userId: user.id },
      defaults: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt
      }
    });
    if (!tokenCreated) {
      await tokenRecord.update({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: expiresAt
      });
    }

    // إصدار JWT للمستخدم وحفظه في كوكي httpOnly آمن
    const jwtToken = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'dashai_super_secret_key_2026', 
      { expiresIn: '7d' }
    );
    
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: true,       // دائماً secure لأننا نستخدم HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
    });

    // Redirect مباشر للداشبورد عبر APP_URL (رابط الموقع الواحد)
    const appUrl = process.env.APP_URL || 'https://dashai.serveousercontent.com';
    res.redirect(`${appUrl}/dashboard`);

  } catch (error) {
    console.error('Salla OAuth Callback Detailed Error:', error.response?.data || error.message);
    const appUrl = process.env.APP_URL || 'https://dashai.serveousercontent.com';
    res.redirect(`${appUrl}/login?error=oauth_failed`);
  }
};
