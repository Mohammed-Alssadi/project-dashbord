require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// ─── التحقق من المتغيرات الإلزامية لقاعدة البيانات ───────────────────────────
const requiredVars = ['DB_USER', 'DB_NAME', 'DB_HOST'];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ FATAL: ${v} is not set in .env`);
    process.exit(1);
  }
});

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null, // null = no password (not a hardcoded fallback)
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: {
    ...baseConfig,
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false
    }
  }
};
