import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sallaConfig } from '../../services/salla/sallaConfig.js';
import { exchangeSallaCodeForTokens } from '../../services/salla/sallaAuth.js';
import { fetchSallaMerchantProfile } from '../../services/salla/sallaClient.js';
import { StoreToken, User } from '../../models/index.js';

// sallaAuthController.js — متحكم مصادقة سلة
// دور هذا المتحكم هو التنسيق فقط واستدعاء الخدمات المعزولة وإرجاع الاستجابات للويب

/**
 * 1. تهيئة الربط وتوليد رابط OAuth سلة
 * GET /auth/salla/redirect
 */
export const handleSallaRedirect = async (req, res) => {
  try {
    // توليد state عشوائي لمنع هجمات CSRF
    const oauthState = crypto.randomBytes(16).toString('hex');

    // حفظ الـ state في cookie مؤقت آمن (يُحذف بعد 10 دقائق)
    res.cookie('salla_oauth_state', oauthState, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000 // 10 دقائق
    });

    // بناء رابط OAuth الآمن
    const authUrl = `${sallaConfig.authBaseUrl}/oauth2/auth?` +
      `response_type=code` +
      `&client_id=${sallaConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(sallaConfig.redirectUri)}` +
      (sallaConfig.scopes ? `&scope=${sallaConfig.scopes}` : '') +
      `&state=${oauthState}`;

    // التحقق مما إذا كان الطلب من المتصفح مباشرة أو عبر API
    if (req.headers.accept && req.headers.accept.includes('json')) {
      res.json({ success: true, oauthUrl: authUrl });
    } else {
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error('Salla Redirect Error:', error);
    res.status(500).json({ success: false, message: 'salla connect error' });
  }
};

/**
 * 2. معالجة رمز الـ Callback الراجع من سلة وإتمام عملية الحفظ والتحويل
 * GET /auth/salla/callback
 */
export const handleSallaCallback = async (req, res) => {
  const { code, state } = req.query;

  // التحقق من state لمنع هجمات CSRF
  const savedState = req.cookies?.salla_oauth_state;
  console.log(`[Salla OAuth Debug] Cookie savedState: "${savedState}" | Query state: "${state}"`);

  if (!savedState || savedState !== state) {
    console.error(`Salla OAuth: state mismatch — possible CSRF attack. Saved: "${savedState}", Received: "${state}"`);
    return res.redirect(`${sallaConfig.frontendUrl}/login?error=invalid_state`);
  }
  // حذف state cookie بعد التحقق
  res.clearCookie('salla_oauth_state', { httpOnly: true, secure: true, sameSite: 'lax' });

  if (!code) {
    return res.redirect(`${sallaConfig.frontendUrl}/login?error=no_code_provided`);
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

    // إصدار JWT للمستخدم وحفظه في cookie httpOnly آمن
    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: true,
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
