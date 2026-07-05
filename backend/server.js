import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ─── فحص المتغيرات الحرجة عند بدء التشغيل ───────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET غير محدد في ملف .env — لا يمكن تشغيل الخادم بأمان.');
  process.exit(1);
}

// ─── استيراد الموجهات (Routes) ────────────────────────────────────────────────
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

// ─── الثقة بالـ reverse proxy (serveo tunnel) ────────────────────────────────
app.set('trust proxy', 1);

// ─── Helmet: حماية HTTP Headers من 11+ نوع هجوم ─────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // نعطّله لأن الفرونت إند React يحتاج مرونة
  crossOriginEmbedderPolicy: false
}));

// ─── Rate Limiting: منع هجمات Brute Force والإغراق ───────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200, // أقصى 200 طلب لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً' }
});

// Rate Limit أكثر صرامة على مسارات OAuth
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'محاولات كثيرة، يرجى الانتظار 15 دقيقة' }
});

app.use(generalLimiter);

// ─── CORS — رابط واحد فقط ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.APP_URL || 'https://dashai.serveousercontent.com',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // لقراءة البيانات المرسلة كـ Form urlencoded (مثل callback منصة زد)
app.use(cookieParser());

// ─── مسارات الـ API ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/auth/salla', oauthLimiter, sallaAuthRoutes);
app.use('/auth/zid', oauthLimiter, zidAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/integration', integrationRoutes);

// ─── فحص جاهزية الخادم (Health Check) ───────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// ─── خدمة ملفات الفرونت إند الاستاتيكية ─────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  distPath = path.join(__dirname, '../frontend/dist');
}

if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Global Error Handler — يمسك أي خطأ غير معالَج ─────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً'
  });
});

// ─── معالجة الأخطاء غير المتوقعة لمنع إسقاط الخادم ─────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ─── تشغيل الخادم ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
