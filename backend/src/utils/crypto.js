import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
// استخدام JWT_SECRET كبذرة لإنشاء مفتاح التشفير (تأكد من وجوده في ملف .env)
const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
// إنشاء مفتاح تشفير آمن بطول 32 بايت باستخدام scrypt
const key = crypto.scryptSync(secret, 'secure-salt-123!', 32);

/**
 * دالة لتشفير النصوص (Tokens)
 * @param {string} text - النص الصريح
 * @returns {string|null} النص المشفر بصيغة iv:authTag:encrypted
 */
export const encryptToken = (text) => {
  if (!text) return text;
  
  // إذا كان النص يحتوي على نقطتين (:) مرتين، قد يكون مشفراً مسبقاً
  if (text.split(':').length === 3) return text;
  
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
};

/**
 * دالة لفك تشفير النصوص
 * @param {string} text - النص المشفر بصيغة iv:authTag:encrypted
 * @returns {string|null} النص الصريح
 */
export const decryptToken = (text) => {
  if (!text) return text;
  
  const parts = text.split(':');
  // إذا لم يتطابق مع نمط التشفير الخاص بنا، نرجعه كما هو (للتوافق مع التوكنات القديمة)
  if (parts.length !== 3) {
    return text;
  }
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    // نرجع النص القديم كما هو في حال فشل الفك لتجنب إسقاط النظام
    return text;
  }
};
