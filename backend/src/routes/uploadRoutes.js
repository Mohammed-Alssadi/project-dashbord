import express from 'express';
import { handleImageUpload, uploadZidProductImage, uploadSallaProductImage } from '../controllers/uploadController.js';
import { protect, extractShopToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * رفع صورة منتج لـ Zid
 * POST /api/upload/zid/products/:productId/images
 */
router.post(
  '/zid/products/:productId/images',
  protect,
  extractShopToken,
  handleImageUpload,
  uploadZidProductImage
);

/**
 * رفع صورة منتج لـ Salla
 * POST /api/upload/salla/products/:productId/images
 */
router.post(
  '/salla/products/:productId/images',
  protect,
  extractShopToken,
  handleImageUpload,
  uploadSallaProductImage
);

export default router;
