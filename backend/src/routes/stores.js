import express from 'express';
import { getLinkedStores, deleteLinkedStore } from '../controllers/storesController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// جلب المتاجر المتصلة (مسار مباشر: /stores)
router.get('/', verifyToken, getLinkedStores);

// إلغاء ربط متجر متصل (مسار مباشر: /stores/:id)
router.delete('/:id', verifyToken, deleteLinkedStore);

export default router;
