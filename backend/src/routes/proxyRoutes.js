import express from 'express';
import { dynamicProxy } from '../controllers/proxyController.js';
import { protect, extractShopToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * مسار البروكسي الشامل
 * يستقبل أي طلب (GET, POST, PUT, DELETE) لأي مسار فرعي
 * ويمرره عبر الميدل وير الخاص بالمصادقة وجلب التوكن
 */
router.all('/*', protect, extractShopToken, dynamicProxy);

export default router;
