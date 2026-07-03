import express from 'express';
import { handleZidRedirect, handleZidCallback } from '../controllers/zid/zidAuthController.js';

const router = express.Router();

// Route: /auth/zid/redirect
router.get('/redirect', handleZidRedirect);

// Route: /auth/zid/callback
router.all('/callback', handleZidCallback);

export default router;
