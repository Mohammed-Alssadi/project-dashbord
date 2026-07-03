import jwt from 'jsonwebtoken';
import { zidConfig } from '../../services/zid/zidConfig.js';
import { exchangeZidCodeForTokens } from '../../services/zid/zidAuth.js';
import { fetchZidMerchantProfile } from '../../services/zid/zidClient.js';
import { StoreToken, User } from '../../models/index.js';

export const handleZidRedirect = async (req, res) => {
  try {
    const authUrl = `${zidConfig.authBaseUrl}/oauth/authorize?` +
      `response_type=code` +
      `&client_id=${zidConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(zidConfig.redirectUri)}` +
      `&state=zid_secure_state`;

    res.json({ success: true, oauthUrl: authUrl });
  } catch (error) {
    console.error('Zid Redirect Error:', error);
    res.status(500).json({ success: false, message: 'zid connect error' });
  }
};

export const handleZidCallback = async (req, res) => {
  console.log('ZID CALLBACK HIT. Method:', req.method);
  console.log('Query:', req.query);
  console.log('Body:', req.body);

  const code = req.query.code || req.body?.code;

  if (!code) {
    const details = { query: req.query, body: req.body, method: req.method };
    return res.redirect(`${zidConfig.frontendUrl}/login?error=no_code_provided&details=${encodeURIComponent(JSON.stringify(details))}`);
  }
  try {
    // 1. استدعاء الخدمة لمقايضة الكود المؤقت بالتوكن الحقيقي
    const tokens = await exchangeZidCodeForTokens(code);
    const { user: zidUser, store: zidStore } = await fetchZidMerchantProfile(tokens.access_token, tokens.manager_token);

    // 2. البحث عن المتجر أو إنشاؤه بناءً على platformStoreId (معرف المتجر)
    let [user, created] = await User.findOrCreate({
      where: {
        platform: 'zid',
        platformStoreId: zidStore.id ? zidStore.id.toString() : zidUser.id.toString()
      },
      defaults: {
        name: zidUser.name || 'Zid Merchant',
        email: zidUser.email || zidStore.email || null,
        avatarUrl: null,
        storeName: zidStore.title || null,
        storeDomain: zidStore.url || null,
        storePhone: zidStore.phone || zidUser.mobile || null
      }
    });

    // تحديث بيانات التاجر والمتجر إذا كانت موجودة مسبقاً
    if (!created) {
      await user.update({
        name: zidUser.name || user.name,
        email: zidUser.email || zidStore.email || user.email,
        storeName: zidStore.title || user.storeName,
        storeDomain: zidStore.url || user.storeDomain,
        storePhone: zidStore.phone || zidUser.mobile || user.storePhone
      });
    }

    // 3. حفظ التوكنز في جدول store_tokens
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 86400) * 1000);
    const [tokenRecord, tokenCreated] = await StoreToken.findOrCreate({
      where: { userId: user.id },
      defaults: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        managerToken: tokens.manager_token || null, // Zid specific
        expiresAt: expiresAt
      }
    });
    if (!tokenCreated) {
      await tokenRecord.update({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        managerToken: tokens.manager_token || null,
        expiresAt: expiresAt
      });
    }

    // 4. إصدار JWT
    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'dashai_super_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // TODO: DEV ONLY - إعادة التوجيه للفرونت إند المحلي مع تمرير التوكن للتطوير
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? `${zidConfig.frontendUrl}/dashboard?success=true`
      : `http://localhost:5173/dashboard?token=${jwtToken}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Zid OAuth Callback Error:', error.response?.data || error.message);
    res.redirect(`${zidConfig.frontendUrl}/login?error=oauth_exchange_failed`);
  }
};
