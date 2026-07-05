import { Sequelize } from 'sequelize';

// إنشاء كائن Sequelize وتكوين الاتصال بقاعدة البيانات
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dashai_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD,
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

    // sync() في بيئة التطوير فقط — في الإنتاج نستخدم Migrations
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      console.log('⚡ Database tables synchronized (development mode).');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

testConnection();

export default sequelize;

