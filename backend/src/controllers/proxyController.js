import axios from 'axios';

/**
 * دالة ذكية لإعادة كتابة مسارات Zid بشكل مرن يدعم المسارات الفرعية
 * @param {string} path - المسار المطلوب من الفرونت إند
 * @param {object} query - معاملات الاستعلام
 * @returns {string} المسار المعدل
 */
const mapZidPath = (path, query) => {
  // مسار البحث المخصص للمنتجات
  if ((path === '/products' || path === '/products/') && query && query.q) {
    return '/products/search';
  }

  // تقسيم المسار إلى أجزاء لتسهيل المعالجة
  const parts = path.split('/').filter(Boolean); // تزيل الأجزاء الفارغة

  // المسارات الأساسية في زد التي تقع تحت managers/store
  const storeEntities = ['categories', 'orders', 'customers'];

  if (parts.length > 0 && storeEntities.includes(parts[0])) {
    const entity = parts[0]; // categories, orders, customers
    let newPath = `/managers/store/${entity}`;

    // إذا كان هناك معرف (ID)
    if (parts.length > 1) {
      const id = parts[1];
      newPath += `/${id}`;

      // الأجزاء المتبقية من المسار (مثل /profile أو /products الخ)
      const restOfPath = parts.slice(2).join('/');

      // الأقسام والطلبات تحتاج كلمة view عند الاستعلام عن عنصر واحد (بدون مسار فرعي إضافي)
      if (!restOfPath && (entity === 'categories' || entity === 'orders')) {
        newPath += '/view';
      } else if (restOfPath) {
        newPath += `/${restOfPath}`;
      }
    }

    return newPath;
  }

  return path;
};

/**
 * البوابة الديناميكية (Dynamic Proxy Controller) - الإصدار الشفاف والمحسن
 * تستقبل الطلبات، تدمج الترويسات، تعالج المسارات، وتعيد الاستجابة كما هي (JSON أو Buffer)
 */
export const dynamicProxy = async (req, res) => {
  try {
    const userPlatform = req.user.platform; // 'salla' or 'zid'
    const accessToken = req.storeToken.accessToken;
    const managerToken = req.storeToken.managerToken;

    let path = req.params[0] ? `/${req.params[0]}` : '';

    // ─── حماية من اجتياز المسار (Path Traversal) ──────────────────────────────
    if (path.includes('..')) {
      console.warn(`[Security] Path Traversal attempt blocked: ${path} by user ${req.user.id}`);
      return res.status(403).json({ success: false, message: 'مسار غير صالح (Path Traversal)' });
    }

    // ─── حماية SSRF (القائمة البيضاء للمسارات المسموحة) ──────────────────────
    const allowedPrefixes = ['/products', '/categories', '/orders', '/customers', '/store', '/profile'];
    const isAllowed = path === '' || allowedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));

    if (!isAllowed) {
      console.warn(`[Security] Blocked unauthorized proxy access to path: ${path} by user ${req.user.id}`);
      return res.status(403).json({ success: false, message: 'مسار غير مصرح به (Proxy Whitelist)' });
    }
    // ──────────────────────────────────────────────────────────────────────────

    // 1. معالجة وتجهيز الترويسات (Headers Pass-through)
    const incomingHeaders = { ...req.headers };

    // إزالة الترويسات التي قد تسبب مشاكل أو تعارض
    const headersToRemove = [
      'host',
      'content-length',
      'connection',
      'accept-encoding',
      'authorization',
      'origin',
      'referer'
    ];
    headersToRemove.forEach(h => delete incomingHeaders[h.toLowerCase()]);

    let headers = {
      ...incomingHeaders,
      'Authorization': `Bearer ${accessToken}`,
    };

    // وضع ترويسة Accept افتراضية إذا لم تكن موجودة
    if (!headers['accept']) {
      headers['accept'] = 'application/json';
    }

    let baseUrl = '';

    // 2. إعداد المسارات الأساسية وترويسات المنصات الخاصة
    if (userPlatform === 'salla') {
      baseUrl = 'https://api.salla.dev/admin/v2';
    } else if (userPlatform === 'zid') {
      baseUrl = 'https://api.zid.sa/v1';
      if (managerToken) headers['X-Manager-Token'] = managerToken;
      if (req.user.platformStoreId) headers['Store-Id'] = String(req.user.platformStoreId);
      if (!headers['accept-language']) headers['accept-language'] = 'ar';

      // إعادة كتابة المسار لمنصة زد بذكاء
      path = mapZidPath(path, req.query);
    } else {
      return res.status(400).json({ success: false, message: 'منصة غير مدعومة' });
    }

    const targetUrl = `${baseUrl}${path}`;

    // 3. تجهيز إعدادات Axios
    const axiosConfig = {
      method: req.method,
      url: targetUrl,
      headers: headers,
      params: req.query,
      timeout: 20000,
      // استلام الاستجابة الخام لتمرير كافة أنواع الملفات (JSON, PDF, Images...)
      responseType: 'arraybuffer',
      // عدم رمي خطأ عند تلقي حالة 400 أو 500 ليتم تمريرها بشفافية
      validateStatus: () => true
    };

    // إرسال الـ Body فقط إذا كان الطلب ليس GET أو HEAD لمنع رفض الطلبات
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // تمرير الـ raw body إن وجد، وإلا تمرير الكائن
      axiosConfig.data = req.body;
    }

    // 4. تنفيذ الطلب
    const response = await axios(axiosConfig);

    // 5. معالجة ترويسات الاستجابة لإرسالها للفرونت إند (بما فيها Pagination)
    const responseHeaders = { ...response.headers };
    // إزالة الترويسات التي تخص النقل وضغط البيانات لأن Express سيقوم بإنشائها
    delete responseHeaders['content-length'];
    delete responseHeaders['transfer-encoding'];
    delete responseHeaders['content-encoding'];

    // إعداد حالة الرد والترويسات للفرونت إند
    res.status(response.status).set(responseHeaders);

    // 6. إرجاع النتيجة مباشرة (سواء كانت Buffer أو JSON، سيتم قراءتها حسب الـ Content-Type الذي أرسلناه في الترويسات)
    return res.send(response.data);

  } catch (error) {
    // هذه الـ Catch تُستخدم فقط في حال فشل إرسال الطلب نهائياً (مثل انقطاع الاتصال أو خطأ في الشبكة)
    // لأن validateStatus يمنع رمي الأخطاء لحالات الـ HTTP Errors
    console.error(`[Proxy Fatal Error] Internal Error:`, error.message);
    return res.status(503).json({
      success: false,
      message: 'تعذر الاتصال بالمنصة الخارجية. يرجى المحاولة لاحقاً.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
