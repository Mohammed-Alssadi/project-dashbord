import axios from 'axios';
import { normalizeQueryParams, normalizeProxyResponse } from '../utils/proxyHelper.js';

/**
 * دالة ذكية لإعادة كتابة مسارات Zid بشكل مرن يدعم المسارات الفرعية
 * @param {string} path - المسار المطلوب من الفرونت إند
 * @param {object} query - معاملات الاستعلام
 * @returns {string} المسار المعدل
 */
const mapZidPath = (path, query) => {
  // ملاحظة: البحث في زد يستخدم الآن معامل 'name' على مسار /products مباشرة
  // ولا نحتاج لتوجيه إلى /products/search

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
    const originalPath = path;

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
    // ─── اعتراض طلب رفع صورة بالرابط (Image Upload by URL Helper) ─────────────
    if (req.method === 'POST' && path.match(/\/products\/[^/]+\/images-by-url\/?/)) {
      const productId = path.split('/')[2];
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'رابط الصورة مطلوب' });
      }

      console.log(`[Proxy Image Upload By URL] Fetching image from URL: ${imageUrl} for product ${productId}`);
      
      try {
        const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(imgResponse.data);
        const contentType = imgResponse.headers['content-type'] || 'image/jpeg';
        
        let fileName = 'image.jpg';
        if (contentType.includes('png')) fileName = 'image.png';
        else if (contentType.includes('webp')) fileName = 'image.webp';
        else if (contentType.includes('gif')) fileName = 'image.gif';

        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('image', imgBuffer, {
          filename: fileName,
          contentType: contentType
        });

        let uploadUrl = '';
        let headers = {
          'Authorization': `Bearer ${accessToken}`,
          ...form.getHeaders()
        };

        if (userPlatform === 'salla') {
          uploadUrl = `https://api.salla.dev/admin/v2/products/${productId}/images`;
        } else if (userPlatform === 'zid') {
          uploadUrl = `https://api.zid.sa/v1/products/${productId}/images/`;
          if (managerToken) headers['X-Manager-Token'] = managerToken;
          if (req.user.platformStoreId) headers['Store-Id'] = String(req.user.platformStoreId);
          headers['Role'] = 'Manager';
        }

        console.log(`[Proxy Image Upload By URL] Uploading to platform: ${uploadUrl}`);
        const uploadResponse = await axios.post(uploadUrl, form, { headers });
        
        res.status(200).json({
          success: true,
          data: uploadResponse.data
        });
        return;
      } catch (err) {
        console.error('[Proxy Image Upload By URL Error]:', err.message);
        return res.status(500).json({ success: false, message: 'فشل رفع الصورة للمنصة', error: err.message });
      }
    }

    // ─── اعتراض حالة نفاد المخزون لمتجر سلة لمنع الـ 422 وإرجاع مصفوفة فارغة بشكل سليم ──────────────────
    if (userPlatform === 'salla' && req.query.status === 'out_of_stock' && (originalPath === '/products' || originalPath === '/products/')) {
      const mockResponse = {
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          perPage: 15,
          hasNext: false,
          hasPrev: false
        }
      };
      res.status(200).set({
        'content-type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      return res.send(Buffer.from(JSON.stringify(mockResponse), 'utf8'));
    }
    // ──────────────────────────────────────────────────────────────────────────────────

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

    // ترجمة وتوحيد معاملات الاستعلام المرسلة من الفرونت إند لمسار المنتجات والأقسام
    const isListPath = 
      originalPath === '/products' || originalPath === '/products/' ||
      originalPath === '/categories' || originalPath === '/categories/';
    
    const normalizedQuery = isListPath 
      ? normalizeQueryParams(req.query, userPlatform, originalPath)
      : req.query;

    // 2. إعداد المسارات الأساسية وترويسات المنصات الخاصة
    if (userPlatform === 'salla') {
      baseUrl = 'https://api.salla.dev/admin/v2';
    } else if (userPlatform === 'zid') {
      baseUrl = 'https://api.zid.sa/v1';
      if (managerToken) headers['X-Manager-Token'] = managerToken;
      if (req.user.platformStoreId) headers['Store-Id'] = String(req.user.platformStoreId);
      if (!headers['accept-language']) headers['accept-language'] = 'ar';
      headers['Role'] = 'Manager';

      // إعادة كتابة المسار لمنصة زد بذكاء باستخدام معاملات الاستعلام الموحدة
      path = mapZidPath(path, normalizedQuery);
    } else {
      return res.status(400).json({ success: false, message: 'منصة غير مدعومة' });
    }

    const targetUrl = `${baseUrl}${path}`;

    // 3. تجهيز إعدادات Axios
    const axiosConfig = {
      method: req.method,
      url: targetUrl,
      headers: headers,
      params: normalizedQuery,
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

    if (response.status < 200 || response.status >= 300) {
      // اعتراض خطأ 404 لعدم تطابق المنتجات في زد وتحويله لرد ناجح فارغ
      if (userPlatform === 'zid' && response.status === 404 && originalPath.includes('products')) {
        try {
          const errText = response.data.toString('utf8');
          const errJson = JSON.parse(errText);
          if (errJson.detail && (errJson.detail.includes('No product matches') || errJson.detail.includes('not found') || errJson.detail.includes('صفحة غير صحيحة'))) {
            const mockResponse = {
              success: true,
              data: [],
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalCount: 0,
                perPage: 15,
                hasNext: false,
                hasPrev: false
              }
            };
            res.status(200).set({
              'content-type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            });
            return res.send(Buffer.from(JSON.stringify(mockResponse), 'utf8'));
          }
        } catch (e) {}
      }

      console.error(`[Proxy Request Failed] Method: ${req.method}, Target: ${targetUrl}, Status: ${response.status}`);
      try {
        console.error(`[Proxy Request Failed Params]:`, JSON.stringify(axiosConfig.params));
        const errText = response.data.toString('utf8');
        console.error(`[Proxy Request Failed Body]:`, errText);
      } catch (e) {}
    }

    // 5. معالجة ترويسات الاستجابة لإرسالها للفرونت إند (بما فيها Pagination)
    const responseHeaders = { ...response.headers };
    // إزالة الترويسات التي تخص النقل وضغط البيانات لأن Express سيقوم بإنشائها
    delete responseHeaders['content-length'];
    delete responseHeaders['transfer-encoding'];
    delete responseHeaders['content-encoding'];

    // منع المتصفح من كاش البيانات (مهم عند تغيير المتاجر)
    responseHeaders['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
    responseHeaders['Pragma'] = 'no-cache';
    responseHeaders['Expires'] = '0';

    // إعداد حالة الرد والترويسات للفرونت إند
    res.status(response.status).set(responseHeaders);

    let responseData = response.data;
    const contentType = response.headers['content-type'] || '';
    const isJson = contentType.includes('application/json');
    // isListPath is already declared above

    if (req.method === 'GET' && response.status >= 200 && response.status < 300 && isJson && isListPath) {
      try {
        const textData = response.data.toString('utf8');
        const jsonData = JSON.parse(textData);
        
        // تمت إزالة طباعة الردود الناجحة لتنظيف التيرمينال

        const normalizedResponse = normalizeProxyResponse(jsonData, userPlatform, originalPath, req.query);
        responseData = Buffer.from(JSON.stringify(normalizedResponse), 'utf8');
      } catch (e) {
        console.error('[Proxy Response Normalization Error]:', e.message);
      }
    }

    // 6. إرجاع النتيجة
    return res.send(responseData);

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
