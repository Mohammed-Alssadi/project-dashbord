import 'dotenv/config';

export const zidConfig = {
  // Client ID الخاص بالتطبيق على منصة زد partners
  clientId: process.env.ZID_CLIENT_ID,
  
  // Client Secret الخاص بالتطبيق (حساس جداً)
  clientSecret: process.env.ZID_CLIENT_SECRET,
  
  // رابط العودة (Redirect Callback URI) المسجل في زد
  redirectUri:`${process.env.APP_URL}/auth/zid/callback`,

  // رابط واجهة الـ Frontend (للتحويل بعد الدخول)
  frontendUrl: process.env.APP_URL,

  // رابط الـ Auth الأساسي لمنصة زد
  authBaseUrl: process.env.ZID_AUTH_BASE_URL || 'https://oauth.zid.sa',
};
