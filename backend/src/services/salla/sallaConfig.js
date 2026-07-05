
export const sallaConfig = {
  // معرف العميل الخاص بالتطبيق على منصة سلة (Salla Partner Portal)
  clientId: process.env.SALLA_CLIENT_ID,
  
  // المفتاح السري الخاص بالتطبيق (يجب الحفاظ عليه سرياً تماماً في البيئة الخلفية)
  clientSecret: process.env.SALLA_CLIENT_SECRET,
  
  // رابط العودة (Callback URI) يعتمد على الرابط الأساسي للمشروع
  redirectUri: `${process.env.APP_URL}/auth/salla/callback`,
  
  // الصلاحيات (Scopes) المطلوبة للوصول إلى بيانات المتجر (المنتجات والتصنيفات والربط الدائم)
  scopes: 'offline_access categories.read categories.read_write products.read products.read_write',

  // الروابط الأساسية للمنصة (تسهل التغيير والترقية والانتقال من بيئة التطوير للإنتاج)
  authBaseUrl: process.env.SALLA_AUTH_BASE_URL || 'https://accounts.salla.sa',
  apiBaseUrl: process.env.SALLA_API_BASE_URL || 'https://api.salla.dev/admin/v2',
  
  // رابط الفرونت إند لإعادة توجيه المستخدم إليه بعد إتمام العمليات يعتمد على الرابط الأساسي للمشروع
  frontendUrl: process.env.APP_URL,
};
