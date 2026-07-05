import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { zidConfig } from '../../services/zid/zidConfig.js';
import { exchangeZidCodeForTokens } from '../../services/zid/zidAuth.js';
import { fetchZidMerchantProfile } from '../../services/zid/zidClient.js';
import { StoreToken, User } from '../../models/index.js';

/**
 * GET /auth/zid/redirect
 * يُولّد رابط OAuth لمنصة زد مع state عشوائي لمنع CSRF
 */
export const handleZidRedirect = async (req, res) => {
  try {
    // توليد state عشوائي لمنع هجمات CSRF
    const oauthState = crypto.randomBytes(16).toString('hex');

    // حفظ الـ state في cookie مؤقت آمن
    res.cookie('zid_oauth_state', oauthState, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // تم التغيير من 'lax' لـ 'none' لأن زد يرسل callback كطلب POST خارجي
      maxAge: 10 * 60 * 1000 // 10 دقائق
    });

    const authUrl = `${zidConfig.authBaseUrl}/oauth/authorize?` +
      `response_type=code` +
      `&client_id=${zidConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(zidConfig.redirectUri)}` +
      `&state=${oauthState}`;

    // التحقق مما إذا كان الطلب من المتصفح مباشرة أو عبر API
    if (req.headers.accept && req.headers.accept.includes('json')) {
      res.json({ success: true, oauthUrl: authUrl });
    } else {
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error('Zid Redirect Error:', error);
    res.status(500).json({ success: false, message: 'zid connect error' });
  }
};

/**
 * GET/POST /auth/zid/callback
 * معالجة الـ callback من زد وإتمام عملية الربط
 */
export const handleZidCallback = async (req, res) => {
  console.log(`[Zid Callback Debug] Method: ${req.method} | Query:`, req.query, `| Body:`, req.body);

  const code = req.query.code || req.body?.code;
  const state = req.query.state || req.body?.state;

  // حذف state cookie للتنظيف
  res.clearCookie('zid_oauth_state', { httpOnly: true, secure: true, sameSite: 'none' });

  if (!code) {
    return res.redirect(`${zidConfig.frontendUrl}/login?error=no_code_provided`);
  }

  try {
    // 1. مقايضة الكود بالتوكنز
    const tokens = await exchangeZidCodeForTokens(code);
    console.log('[Zid Tokens Response Debug]:', tokens);
    
    // tokens.authorization هو رمز الوصول (Authorization Bearer JWT)
    // tokens.access_token هو رمز المدير الخاص بالمتجر (X-Manager-Token)
    const { user: zidUser, store: zidStore } = await fetchZidMerchantProfile(tokens.authorization, tokens.access_token);
    console.log('[Zid User & Store Debug]:', { zidUser, zidStore });

    // 2. التحقق من وجود إيميل مشابه وتفادي تعارض قيد الفريد (Unique Constraint)
    const targetEmail = zidUser.email || zidStore.email || null;
    let user = null;
    let created = false;

    if (targetEmail) {
      // البحث عن أي مستخدم مسجل مسبقاً بنفس البريد
      const existingUserByEmail = await User.findOne({ where: { email: targetEmail } });
      
      if (existingUserByEmail) {
        const storeIdStr = zidStore.id ? zidStore.id.toString() : zidUser.id.toString();
        // إذا كان المستخدم ينتمي لنفس المتجر على زد، نستخدمه ونحدث بياناته
        if (existingUserByEmail.platform === 'zid' && existingUserByEmail.platformStoreId === storeIdStr) {
          user = existingUserByEmail;
          created = false;
          await user.update({
            name: zidUser.name || user.name,
            storeName: zidStore.title || user.storeName,
            storeDomain: zidStore.url || user.storeDomain,
            storePhone: zidStore.phone || zidUser.mobile || user.storePhone
          });
        } else {
          // إذا كان الإيميل مسجلاً لمتجر آخر، نقوم بإنشاء إيميل فريد مضاف إليه معرف المتجر لتجنب التعارض
          const emailParts = targetEmail.split('@');
          const uniqueEmail = `${emailParts[0]}+zid-${storeIdStr}@${emailParts[1]}`;
          
          const [newUser, newCreated] = await User.findOrCreate({
            where: {
              platform: 'zid',
              platformStoreId: storeIdStr
            },
            defaults: {
              name: zidUser.name || 'Zid Merchant',
              email: uniqueEmail,
              avatarUrl: null,
              storeName: zidStore.title || null,
              storeDomain: zidStore.url || null,
              storePhone: zidStore.phone || zidUser.mobile || null
            }
          });
          user = newUser;
          created = newCreated;
        }
      }
    }

    // إذا لم يتم العثور/الإنشاء بعد (لعدم وجود إيميل أو عدم وجود تعارض)
    if (!user) {
      const [newUser, newCreated] = await User.findOrCreate({
        where: {
          platform: 'zid',
          platformStoreId: zidStore.id ? zidStore.id.toString() : zidUser.id.toString()
        },
        defaults: {
          name: zidUser.name || 'Zid Merchant',
          email: targetEmail,
          avatarUrl: null,
          storeName: zidStore.title || null,
          storeDomain: zidStore.url || null,
          storePhone: zidStore.phone || zidUser.mobile || null
        }
      });
      user = newUser;
      created = newCreated;

      if (!created) {
        await user.update({
          name: zidUser.name || user.name,
          email: targetEmail || user.email,
          storeName: zidStore.title || user.storeName,
          storeDomain: zidStore.url || user.storeDomain,
          storePhone: zidStore.phone || zidUser.mobile || user.storePhone
        });
      }
    }

    // 3. حفظ التوكنز في store_tokens
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 86400) * 1000);
    const [tokenRecord, tokenCreated] = await StoreToken.findOrCreate({
      where: { userId: user.id },
      defaults: {
        accessToken: tokens.authorization,
        refreshToken: tokens.refresh_token,
        managerToken: tokens.access_token || null,
        expiresAt: expiresAt
      }
    });
    if (!tokenCreated) {
      await tokenRecord.update({
        accessToken: tokens.authorization,
        refreshToken: tokens.refresh_token,
        managerToken: tokens.access_token || null,
        expiresAt: expiresAt
      });
    }

    // 4. إصدار JWT وحفظه في cookie httpOnly فقط — لا يُرسَل أبداً عبر URL
    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: true,       // دائماً secure — متسق مع سلة
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 5. إعادة التوجيه للداشبورد عبر APP_URL
    res.redirect(`${zidConfig.frontendUrl}/dashboard`);

  } catch (error) {
    console.error('Zid OAuth Callback Error:', error.response?.data || error.message);
    res.redirect(`${zidConfig.frontendUrl}/login?error=oauth_exchange_failed`);
  }
};

