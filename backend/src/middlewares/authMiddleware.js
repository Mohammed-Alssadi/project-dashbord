import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';
import * as tokenRepository from '../repositories/tokenRepository.js';
import { PlatformFactory } from '../platforms/PlatformFactory.js';

export const protect = async (req, res, next) => {
  let token;

  // Check cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Then check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // 1. JWT_SECRET مضمون الوجود — server.js يوقف التشغيل إذا كان غائباً
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. جلب المستخدم من الـ Repository
    const user = await userRepository.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;

    // 3. تهيئة خدمة المنصة المخصصة ديناميكياً (زد أو سلة) وإرفاقها بالطلب
    const platformService = PlatformFactory.getPlatform(user.platform);
    req.platformService = platformService;

    // 4. جلب التوكن الخاص بالمتجر وإرفاقه بالطلب تلقائياً
    let storeToken = await tokenRepository.findTokenByUserId(user.id);
    
    if (storeToken) {
      // التحقق من صلاحية التوكن وتجديده تلقائياً إذا شارف على الانتهاء (أقل من 5 دقائق متبقية)
      const isExpired = storeToken.expiresAt && (new Date(storeToken.expiresAt).getTime() - Date.now() < 5 * 60 * 1000);
      
      if (isExpired) {
        if (storeToken.refreshToken) {
          try {
            console.log(`[Token Refresh] Refreshing token for user ${user.id} on platform ${user.platform}...`);
            const rawNewTokens = await platformService.refreshToken(storeToken.refreshToken);

            // ─── استخدام normalizeTokens من كلاس المنصة المحدد ─────────────────────
            // كل منصة تعرف بنية توكناتها الخاصة — المنطق معزول داخل المنصة وليس هنا
            const normalized = platformService.normalizeTokens(rawNewTokens);

            storeToken = await tokenRepository.updateToken(user.id, normalized);
            console.log(`[Token Refresh] Token refreshed successfully for user ${user.id}.`);
          } catch (refreshError) {
            console.error(`[Token Refresh Error] Failed to refresh token for user ${user.id}:`, refreshError.message);
            return res.status(401).json({ 
              success: false, 
              message: 'Store connection has expired. Please re-authenticate.', 
              code: 'STORE_AUTH_EXPIRED' 
            });
          }
        } else {
          console.warn(`[Token Refresh Warning] Token for user ${user.id} is expired but no refresh token is available.`);
          return res.status(401).json({ 
            success: false, 
            message: 'Store connection has expired. Please re-authenticate.', 
            code: 'STORE_AUTH_EXPIRED' 
          });
        }
      }

      req.storeToken = storeToken;
      req.shopToken = storeToken.accessToken; // للتوافق الرجعي مع الأكواد القديمة
    }

    next();
  } catch (error) {
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
      console.error('Auth middleware error:', error);
    }
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

/**
 * ميدل وير للتحقق من وجود توكن متجر نشط وصالح للاستخدام
 * يتحقق من: وجود storeToken + وجود accessToken فعلي غير فارغ
 */
export const extractShopToken = async (req, res, next) => {
  if (req.storeToken && req.storeToken.accessToken) {
    next();
  } else if (req.storeToken && !req.storeToken.accessToken) {
    // التوكن موجود لكن accessToken فارغ — يحتاج إعادة ربط
    return res.status(401).json({
      success: false,
      message: 'Store access token is missing. Please re-authenticate.',
      code: 'STORE_TOKEN_INVALID'
    });
  } else {
    return res.status(404).json({ success: false, message: 'No store linked to this account or link has expired' });
  }
};

