import 'dotenv/config'; // شحن بيئة العمل وتحديثها
import express from 'express';
import cors from 'cors';
import sallaAuthRoutes from './src/routes/sallaAuth.js';
import zidAuthRoutes from './src/routes/zidAuth.js';
import storesRoutes from './src/routes/stores.js';
import './src/config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد CORS للسماح بنطاق المشروع المسجل بالبيئة
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// مسارات الـ API المنفصلة لتفويض المنصات
app.use('/auth/salla', sallaAuthRoutes);
app.use('/auth/zid', zidAuthRoutes);
app.use('/stores', storesRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// تحديد مسار مجلد dist للفرونت إند (يدعم بيئة التطوير والإنتاج)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let distPath = path.join(__dirname, 'dist'); // في الإنتاج يتم رفعه داخل مجلد الباك إند
if (!fs.existsSync(distPath)) {
  distPath = path.join(__dirname, '../frontend/dist'); // بيئة التطوير المحلية
}

// خدمة ملفات الفرونت إند الاستاتيكية وتوجيه المسارات لـ index.html
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.get('*', (req, res, next) => {
    // تجنب توجيه مسارات الـ API
    if (req.path.startsWith('/auth') || req.path.startsWith('/stores') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
