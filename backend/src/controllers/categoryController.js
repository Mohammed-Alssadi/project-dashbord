import { transformCategory } from '../services/categoryTransformer.js';

/**
 * متحكم جلب التصنيفات الشامل والموحد
 * يجلب التصنيفات حية من API المنصة مباشرة — بدون كاش
 *
 * الفلاتر المدعومة:
 *   ?page=1          — رقم الصفحة
 *   ?per_page=10     — عدد العناصر (max: 100)
 *   ?keyword=نص      — بحث (سلة: server-side، زد: client-side على names.ar/en)
 *   ?status=active   — الحالة (سلة: active|hidden، زد: يُطبَّق على is_published)
 */
export const getCategoriesList = async (req, res) => {
  try {
    const platform = req.user.platform;
    const accessToken = req.storeToken.accessToken;
    const managerToken = req.storeToken.managerToken;

    // ─── Input Validation ──────────────────────────────────────────────────────
    let page = parseInt(req.query.page) || 1;
    let per_page = parseInt(req.query.per_page) || 10;
    const keyword = String(req.query.keyword || '').slice(0, 100);
    const status = String(req.query.status || '');

    if (page < 1) page = 1;
    if (per_page < 1) per_page = 10;
    if (per_page > 100) per_page = 100;

    // ─── جلب حي مباشر من API المنصة ──────────────────────────────────────────
    const result = await req.platformService.fetchCategories(accessToken, managerToken, {
      page,
      per_page,
      keyword,
      status,
      storeId: req.user.platformStoreId
    });

    const categories = result.categories || [];
    const pagination = result.pagination;

    // توحيد وتوطين بيانات التصنيفات
    const normalizedCategories = categories.map(c => transformCategory(platform, c));

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

    return res.status(200).json({
      success: true,
      data: normalizedCategories,
      pagination: normalizedPagination
    });
  } catch (error) {
    console.error('Error in getCategoriesList controller:', error);

    const isUnauthorizedScope = error.message?.includes('Unauthorized_Scope');
    return res.status(isUnauthorizedScope ? 403 : 500).json({
      success: false,
      message: isUnauthorizedScope
        ? 'التطبيق لا يملك صلاحية قراءة التصنيفات، يرجى إعادة ربط المتجر'
        : 'حدث خطأ أثناء جلب التصنيفات، يرجى المحاولة لاحقاً'
    });
  }
};
