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

// ─── استيراد الموجهات (Routes) الموحدة ────────────────────────────────────────
import authRoutes from './src/routes/authRoutes.js';
import storeRoutes from './src/routes/storeRoutes.js';
import merchantRoutes from './src/routes/merchant.routes.js';
import proxyRoutes from './src/routes/proxyRoutes.js';
import { protect } from './src/middlewares/authMiddleware.js';
import { getStoreProfile } from './src/controllers/storeController.js';

// تهيئة الاتصال بقاعدة البيانات وتفعيل العلاقات بين الـ Models
import sequelize from './src/config/db.js';
import './src/models/index.js'; // ← يُفعِّل: User.hasOne(StoreToken) + onDelete CASCADE

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
  max: 2000, // تم زيادة الحد إلى 2000 طلب لتفادي المشاكل أثناء التطوير أو الاستخدام الكثيف
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

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true })); // لقراءة البيانات المرسلة كـ Form urlencoded (مثل callback منصة زد)
app.use(cookieParser());

// ─── مسارات الـ API الموحدة ───────────────────────────────────────────────────
// مسارات المصادقة: /api/auth/* (API JSON) و /auth/* (OAuth redirect مع rate limit)
app.use('/api/auth', authRoutes);
app.use('/auth', oauthLimiter, authRoutes);

app.use('/api/proxy', proxyRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/merchant', merchantRoutes);

// ─── فحص جاهزية الخادم مع التحقق من DB (Health Check) ─────────────────────
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'ok',
      message: 'Backend is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (dbError) {
    res.status(503).json({
      status: 'error',
      message: 'Backend is running but database is unreachable',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// ─── خدمة ملفات الفرونت إند الاستاتيكية ─────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  distPath = path.join(__dirname, '../frontend/dist');
}

// تسجيل المجلد الاستاتيكي بشكل دائم
app.use(express.static(distPath));

// توجيه جميع المسارات الأخرى إلى index.html الخاص بالفرونت إند ديناميكياً
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build (index.html) not found. Please ensure you have run "npm run build" in the frontend directory.');
  }
});

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
