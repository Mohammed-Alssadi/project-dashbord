import NodeCache from 'node-cache';

// إنشاء نسخة كاش موحدة على مستوى التطبيق بأكمله
// - stdTTL: 300 ثانية (5 دقائق) كعمر افتراضي للمفتاح
// - checkperiod: 600 ثانية (10 دقائق) للتحقق وحذف المفاتيح المنتهية الصلاحية
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

export default cache;
