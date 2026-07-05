import express from 'express';
import { handleRedirect, handleCallback, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Middleware: التحقق من صحة اسم المنصة قبل أي معالجة ──────────────────────
const SUPPORTED_PLATFORMS = ['salla', 'zid'];
const validatePlatform = (req, res, next) => {
  const { platform } = req.params;
  if (!platform || !SUPPORTED_PLATFORMS.includes(platform.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Platform '${platform}' is not supported. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`
    });
  }
  req.params.platform = platform.toLowerCase(); // normalize
  next();
};

// مسارات الجلسة الشخصية للمستخدم
router.get('/me', protect, getMe);
router.post('/logout', logout);

// مسارات OAuth الديناميكية للمنصات (سلة، زد) — محمية بـ platform validator
router.get('/:platform/redirect', validatePlatform, handleRedirect);
router.all('/:platform/callback', validatePlatform, handleCallback);

export default router;
