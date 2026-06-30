// zidConfig.js
// إعدادات الربط والـ OAuth الخاصة بمنصة زد
// يستورد هذا الملف المتغيرات مباشرة من process.env لتكون معزولة داخل خدمة زد

export const zidConfig = {
  // Client ID الخاص بالتطبيق على منصة زد partners
  clientId: process.env.ZID_CLIENT_ID,
  
  // Client Secret الخاص بالتطبيق (حساس جداً)
  clientSecret: process.env.ZID_CLIENT_SECRET,
  
  // رابط العودة (Redirect Callback URI) المسجل في زد
  redirectUri: process.env.ZID_REDIRECT_URI || 'http://localhost:5000/api/auth/zid/callback',
};
