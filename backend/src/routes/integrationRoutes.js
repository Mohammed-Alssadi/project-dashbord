import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getStoreProfile } from '../controllers/integration/storeProfileController.js';

const router = express.Router();

// جميع مسارات integration محمية
router.use(protect);

router.get('/store-profile', getStoreProfile);

export default router;
