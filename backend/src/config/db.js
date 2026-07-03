import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// إنشاء كائن Sequelize وتكوين الاتصال بقاعدة البيانات
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dashai_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '12345678',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // غيرها إلى console.log لمشاهدة استعلامات SQL أثناء التطوير
    pool: {
      max: 10, // أقصى عدد اتصالات بالتجميعة
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true, // تفعيل createdAt و updatedAt تلقائياً
      underscored: true // تحويل أسماء الأعمدة للـ Snake Case (مثال: user_id)
    }
  }
);

// اختبار والتحقق من سلامة الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('⚡ Database connected successfully via Sequelize ORM.');
    
    // إنشاء الجداول في قاعدة البيانات تلقائياً (بدون alter لتفادي تكرار الفهارس)
    await sequelize.sync();
    console.log('⚡ Database tables synchronized successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

testConnection();

export default sequelize;
