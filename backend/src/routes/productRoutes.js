import express from 'express';
import { getProducts } from '../controllers/productController.js';
import { protect, extractShopToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * مسارات المنتجات والتصنيفات الموحدة
 */
router.get('/', protect, extractShopToken, getProducts);


export default router;
