import express from 'express';
import { getMe, logout } from '../controllers/auth/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
