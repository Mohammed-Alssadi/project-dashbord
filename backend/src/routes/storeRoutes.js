import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getStoreProfile } from '../controllers/storeController.js';

const router = express.Router();

// جميع مسارات المتجر محمية بـ JWT
router.use(protect);

router.get('/store-profile', getStoreProfile);

export default router;
