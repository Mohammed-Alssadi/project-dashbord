import { fetchSallaProducts } from '../services/salla/sallaClient.js';
import { transformProduct } from '../services/productTransformer.js';
import cache from '../utils/cache.js';

/**
 * متحكم جلب المنتجات الموحد والديناميكي
 * تم تحسينه ليكون سريعاً جداً (يطلب صفحة واحدة فقط)
 */
export const getProducts = async (req, res) => {
  try {
    const platform = req.user.platform;
    const accessToken = req.shopToken;

    // ─── Input Validation ─────────────────────────────────────────────────────
    let page = parseInt(req.query.page) || 1;
    let per_page = parseInt(req.query.per_page) || 10;
    const keyword = String(req.query.keyword || '').slice(0, 100); // حد أقصى 100 حرف
    const status = String(req.query.status || '');
    const category = String(req.query.category || '');
    const force = req.query.force === 'true';

    // ضمانات الحدود
    if (page < 1) page = 1;
    if (per_page < 1) per_page = 10;
    if (per_page > 50) per_page = 50; // حد أقصى 50 منتج للحماية من الإغراق

    const forceRefresh = force;
    const cacheKey = `products_${req.user.id}_${page}_${per_page}_${keyword}_${status}_${category}`;

    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({ success: true, source: 'cache', ...cachedData });
      }
    }

    let products = [];
    let pagination = null;

    if (platform === 'salla') {
      // Note: req.query always returns strings — parse category to number for Salla API
      const categoryId = category ? Number(category) : undefined;

      // عند وجود فلتر تصنيف، نجلب عدداً أكبر من المنتجات لأن سلة API لا تدعم category_id دائماً
      const fetchPerPage = categoryId ? 200 : (per_page || 10);

      const result = await fetchSallaProducts(accessToken, {
        page: categoryId ? 1 : page, // عند الفلترة نبدأ من الصفحة الأولى
        per_page: fetchPerPage,
        keyword,
        status,
        category: categoryId // محاولة الفلترة من سلة API مباشرة
      });
      
      let rawProducts = result.products;

      // فلترة محلية بالتصنيف كضمان (في حال أن سلة لم تفلتر صح)
      if (categoryId) {
        rawProducts = rawProducts.filter(p => {
          if (Array.isArray(p.categories)) {
            return p.categories.some(cat => Number(cat.id) === categoryId);
          }
          return false;
        });
      }

      products = rawProducts;
      // إعادة حساب الترقيم يدوياً عند الفلترة المحلية
      if (categoryId) {
        const currentPage = Number(page) || 1;
        const perPageNum = Number(per_page) || 10;
        const total = rawProducts.length;
        pagination = {
          current_page: currentPage,
          total_pages: Math.ceil(total / perPageNum),
          per_page: perPageNum,
          total: total
        };
        // تقسيم الصفحات يدوياً
        products = rawProducts.slice((currentPage - 1) * perPageNum, currentPage * perPageNum);
      } else {
        pagination = result.pagination;
      }

    } else if (platform === 'zid') {
      // Zid product fetching — قيد الدعم
      return res.status(400).json({ success: false, message: 'جلب المنتجات من زد غير مدعوم حالياً' });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Platform not currently supported'
      });
    }

    // تحويل وتوطين المنتجات المعروضة للصفحة الحالية
    const normalizedProducts = products.map(p => transformProduct(platform, p));

    // إعداد كائن الترقيم الموحد
    const normalizedPagination = pagination ? {
      currentPage: Number(pagination.current_page) || 1,
      totalPages: Number(pagination.total_pages) || Math.ceil((pagination.total || 0) / (pagination.per_page || 10)) || 1,
      perPage: Number(pagination.per_page) || 10,
      total: Number(pagination.total) || 0
    } : null;

    const responseData = {
      data: normalizedProducts,
      pagination: normalizedPagination || {
        currentPage: Number(page) || 1,
        totalPages: 1,
        perPage: Number(per_page) || 10,
        total: normalizedProducts.length
      }
    };

    // حفظ في الكاش لمدة 5 دقائق (300 ثانية - افتراضي)
    cache.set(cacheKey, responseData);

    return res.status(200).json({
      success: true,
      source: 'api',
      ...responseData
    });
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتجات'
    });
  }
};
