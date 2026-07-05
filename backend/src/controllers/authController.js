import jwt from 'jsonwebtoken';
import { PlatformFactory } from '../platforms/PlatformFactory.js';
import * as userRepository from '../repositories/userRepository.js';

/**
 * دالة إعادة التوجيه لصفحة تسجيل الدخول في المنصة ديناميكياً
 */
export const handleRedirect = async (req, res) => {
  try {
    const { platform } = req.params;
    const platformService = PlatformFactory.getPlatform(platform);

    const { authUrl, state } = await platformService.generateAuthUrl();

    // حفظ الـ state في الكوكي لحماية CSRF
    res.cookie(`${platform}_oauth_state`, state, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000 // 15 دقيقة
    });

    if (req.headers.accept?.includes('json')) {
      return res.json({ success: true, oauthUrl: authUrl });
    }
    return res.redirect(authUrl);
  } catch (error) {
    console.error(`Redirect Error for platform ${req.params?.platform}:`, error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * دالة استقبال الـ Callback بعد موافقة التاجر على التطبيق
 */
export const handleCallback = async (req, res) => {
  const { platform } = req.params;
  const code = req.query.code || req.body?.code;
  const state = req.query.state || req.body?.state;
  const savedState = req.cookies?.[`${platform}_oauth_state`];

  console.log(`[${platform.toUpperCase()} Callback Debug] Code received:`, code ? 'Yes' : 'No', 'Query:', req.query, 'Body:', req.body, 'Cookies:', req.cookies);

  // مسح كوكي الـ state لحماية الجلسة
  res.clearCookie(`${platform}_oauth_state`, {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });

  // التحقق من معامل الـ state للحماية من هجمات CSRF
  if (!state || state !== savedState) {
    console.error(`[${platform.toUpperCase()} OAuth Callback Error] State mismatch. Received: '${state}', Expected: '${savedState}'`);
    return res.redirect(`${process.env.APP_URL}/login?error=invalid_state`);
  }

  if (!code) {
    return res.redirect(`${process.env.APP_URL}/login?error=no_code_provided`);
  }

  try {
    const platformService = PlatformFactory.getPlatform(platform);

    // 1. مقايضة الكود المؤقت بالتوكنز
    const rawTokens = await platformService.exchangeCodeForTokens(code);

    // 2. تطبيع التوكنات للصيغة الموحدة — كل منصة تعرف بنيتها الخاصة
    const normalizedTokens = platformService.normalizeTokens(rawTokens);

    // 3. جلب ملف التعريف للمستخدم والمتجر بصيغة موحدة
    const profile = await platformService.fetchProfile(normalizedTokens.accessToken, normalizedTokens.managerToken);

    // 4. حفظ بيانات المستخدم والتوكنات في عملية واحدة عبر الـ Repository
    const user = await userRepository.saveMerchantUser({
      platform,
      platformStoreId: profile.store.id,
      name: profile.user.name,
      email: profile.user.email,
      storeName: profile.store.name,
      storeDomain: profile.store.url,
      storePhone: profile.store.phone,
      tokens: normalizedTokens // نمرر الـ normalized tokens مباشرة
    });

    // 5. إصدار JWT للجلسة وحفظها في الكوكيز
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

    // 6. التحويل للداشبورد مباشرة
    return res.redirect(`${process.env.APP_URL}/dashboard`);
  } catch (error) {
    console.error(`${platform.toUpperCase()} OAuth Callback Error:`, error.message);
    return res.redirect(`${process.env.APP_URL}/login?error=oauth_exchange_failed`);
  }
};

/**
 * جلب بيانات التاجر الحالي المسجل في الجلسة
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        storeName: user.storeName,
        storeDomain: user.storeDomain,
        platform: user.platform,
        platformStoreId: user.platformStoreId
      }
    });
  } catch (error) {
    console.error('Error fetching me:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * تسجيل خروج المستخدم ومسح جميع كوكيز الجلسة
 */
export const logout = (req, res) => {
  // خيارات الكوكي الرئيسية — يجب أن تطابق خيارات الإنشاء في handleCallback
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  };

  // مسح JWT token الرئيسي
  res.clearCookie('token', cookieOptions);

  // مسح أي OAuth state cookies متبقية لكل المنصات المدعومة
  ['salla', 'zid'].forEach((platform) => {
    res.clearCookie(`${platform}_oauth_state`, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
  });

  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
};
