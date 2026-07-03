import { fetchSallaCategories } from '../services/salla/sallaClient.js';
import { transformCategory } from '../services/categoryTransformer.js';

/**
 * متحكم جلب التصنيفات الشامل والمفصل
 * يدعم البحث والتقسيم والفرز
 */
export const getCategoriesList = async (req, res) => {
  try {
    const platform = req.user.platform; // salla | zid
    const accessToken = req.shopToken;  // توكن المتجر

    // قراءة معاملات الاستعلام
    const { page, per_page, keyword, status } = req.query;

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

    return res.json({
      success: true,
      data: normalizedCategories,
      pagination: normalizedPagination
    });
  } catch (error) {
    console.error('Error in getCategoriesList controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while fetching store categories'
    });
  }
};
