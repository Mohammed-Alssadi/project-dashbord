import express from 'express';
import { handleSallaRedirect, handleSallaCallback } from '../controllers/sallaAuthController.js';

const router = express.Router();

// Route: /auth/salla/redirect
router.get('/redirect', handleSallaRedirect);

// Route: /auth/salla/callback
router.get('/callback', handleSallaCallback);

export default router;
