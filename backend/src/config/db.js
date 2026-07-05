import { Sequelize } from 'sequelize';

// إنشاء كائن Sequelize وتكوين الاتصال بقاعدة البيانات
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// اختبار والتحقق من سلامة الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('⚡ Database connected successfully via Sequelize ORM.');

    // sync({ alter: false }) في بيئة التطوير فقط — لا يُعدِّل الجداول الموجودة أبداً
    // في الإنتاج نعتمد على Migrations فقط
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('⚡ Database tables synchronized (development mode).');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // الخادم لا يمكنه العمل بدون قاعدة بيانات — نوقفه فوراً
    process.exit(1);
  }
};

testConnection();

export default sequelize;
