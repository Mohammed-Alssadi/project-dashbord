import { fetchSallaCategories } from '../services/salla/sallaClient.js';
import { transformCategory } from '../services/categoryTransformer.js';
import cache from '../utils/cache.js';

/**
 * متحكم جلب التصنيفات الشامل والمفصل
 * يدعم البحث والتقسيم والفرز
 */
export const getCategoriesList = async (req, res) => {
  try {
    const platform = req.user.platform; // salla | zid
    const accessToken = req.shopToken;  // توكن المتجر

    // قراءة معاملات الاستعلام
    const { page = 1, per_page = 10, keyword = '', status = '', force } = req.query;

    const forceRefresh = force === 'true';
    const cacheKey = `categories_${req.user.id}_${page}_${per_page}_${keyword}_${status}`;

    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          ...cachedData
        });
      }
    }

    let categories = [];
    let pagination = null;

    if (platform === 'salla') {
      const result = await fetchSallaCategories(accessToken, {
        page: page || 1,
        per_page: per_page || 10,
        keyword,
        status
      });

      categories = result.categories || [];
      pagination = result.pagination;

    } else if (platform === 'zid') {
      console.log('Zid category listing is currently stubbed.');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Platform not currently supported'
      });
    }

    // توحيد وتوطين بيانات التصنيفات
    const normalizedCategories = categories.map(c => transformCategory(platform, c));

    // إعداد كائن الترقيم الموحد
    const normalizedPagination = pagination ? {
      currentPage: Number(pagination.currentPage || pagination.current_page) || 1,
      totalPages: Number(pagination.totalPages || pagination.total_pages) || Math.ceil((pagination.total || 0) / (pagination.perPage || pagination.per_page || 10)) || 1,
      perPage: Number(pagination.perPage || pagination.per_page) || 10,
      total: Number(pagination.total) || 0
    } : null;

    const responseData = {
      data: normalizedCategories,
      pagination: normalizedPagination || {
        current_page: Number(page) || 1,
        total_pages: 1,
        per_page: Number(per_page) || 10,
        total: normalizedCategories.length
      }
    };

    // حفظ في الكاش لمدة 5 دقائق (300 ثانية - الافتراضي)
    cache.set(cacheKey, responseData);

    return res.status(200).json({
      success: true,
      source: 'api',
      ...responseData
    });
  } catch (error) {
    console.error('Error in getCategoriesList controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while fetching store categories'
    });
  }
};
