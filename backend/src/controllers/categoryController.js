import { fetchSallaCategories } from '../services/salla/sallaClient.js';
import { transformCategory } from '../services/categoryTransformer.js';
import cache from '../utils/cache.js';

/**
 * متحكم جلب التصنيفات الشامل والمفصل
 * يدعم البحث والتقسيم والفرز
 */
export const getCategoriesList = async (req, res) => {
  try {
    const platform = req.user.platform;
    const accessToken = req.shopToken;

    // ─── Input Validation ──────────────────────────────────────────────────────
    let page = parseInt(req.query.page) || 1;
    let per_page = parseInt(req.query.per_page) || 10;
    const keyword = String(req.query.keyword || '').slice(0, 100);
    const status = String(req.query.status || '');
    const force = req.query.force === 'true';

    if (page < 1) page = 1;
    if (per_page < 1) per_page = 10;
    if (per_page > 100) per_page = 100;

    const forceRefresh = force;
    const cacheKey = `categories_${req.user.id}_${page}_${per_page}_${keyword}_${status}`;

    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({ success: true, source: 'cache', ...cachedData });
      }
    }

    let categories = [];
    let pagination = null;

    if (platform === 'salla') {
      const result = await fetchSallaCategories(accessToken, { page, per_page, keyword, status });
      categories = result.categories || [];
      pagination = result.pagination;

    } else if (platform === 'zid') {
      // Zid category listing — قيد الدعم
      return res.status(400).json({ success: false, message: 'جلب التصنيفات من زد غير مدعوم حالياً' });
    } else {
      return res.status(400).json({ success: false, message: 'منصة غير مدعومة' });
    }

    // توحيد وتوطين بيانات التصنيفات
    const normalizedCategories = categories.map(c => transformCategory(platform, c));

    // ─── Pagination موحّد camelCase ────────────────────────────────────────────
    const normalizedPagination = pagination ? {
      currentPage: Number(pagination.current_page || pagination.currentPage) || 1,
      totalPages: Number(pagination.total_pages || pagination.totalPages) || Math.ceil((pagination.total || 0) / per_page) || 1,
      perPage: Number(pagination.per_page || pagination.perPage) || per_page,
      total: Number(pagination.total) || 0
    } : {
      currentPage: page,
      totalPages: 1,
      perPage: per_page,
      total: normalizedCategories.length
    };

    const responseData = {
      data: normalizedCategories,
      pagination: normalizedPagination
    };

    cache.set(cacheKey, responseData);

    return res.status(200).json({ success: true, source: 'api', ...responseData });

  } catch (error) {
    console.error('Error in getCategoriesList controller:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التصنيفات'
    });
  }
};

