import express from 'express';
import { getMerchantProfile } from '../controllers/merchantController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// جميع المسارات يجب أن تكون محمية وتستخدم خدمة المنصة
router.use(protect);

router.get('/profile', getMerchantProfile);

export default router;
