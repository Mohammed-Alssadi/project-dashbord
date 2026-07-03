import express from 'express';
import { getCategoriesList } from '../controllers/categoryController.js';
import { protect, extractShopToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * مسار جلب التصنيفات الشاملة مع التصفية والتقسيم
 * GET /api/categories
 */
router.get('/', protect, extractShopToken, getCategoriesList);

export default router;
