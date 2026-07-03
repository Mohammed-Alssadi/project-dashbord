import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// استيراد الموجهات (Routes)
import authRoutes from './src/routes/auth.js';
import sallaAuthRoutes from './src/routes/sallaAuth.js';
import zidAuthRoutes from './src/routes/zidAuth.js';
import productRoutes from './src/routes/productRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import integrationRoutes from './src/routes/integrationRoutes.js';

// تهيئة الاتصال بقاعدة البيانات
import './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// الثقة بالـ reverse proxy (serveo tunnel) لضمان صحة الـ cookies عبر HTTPS
app.set('trust proxy', 1);

// CORS — رابط واحد فقط
app.use(cors({
  origin: process.env.APP_URL || 'https://dashai.serveousercontent.com',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// مسارات الـ API المنفصلة للخدمات والمنصات
app.use('/api/auth', authRoutes);
app.use('/auth/salla', sallaAuthRoutes);
app.use('/auth/zid', zidAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/integration', integrationRoutes);

// فحص جاهزية الخادم (Health Check)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// تحديد مسار مجلد dist للفرونت إند (يدعم بيئة التطوير والإنتاج)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let distPath = path.join(__dirname, 'dist'); // المسار الافتراضي للإنتاج

// إذا لم يكن ملف index.html موجوداً في مجلد dist الحالي، نستخدم مجلد الفرونت إند المحلي للتطوير
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  distPath = path.join(__dirname, '../frontend/dist');
}

// خدمة ملفات الفرونت إند الاستاتيكية وتوجيه المسارات لـ index.html
if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    // تجنب اعتراض مسارات الـ API أو الـ Auth
    if (req.path.startsWith('/auth') || req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

