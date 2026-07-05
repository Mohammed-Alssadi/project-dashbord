import { transformProduct } from '../services/productTransformer.js';

/**
 * متحكم المنتجات الموحد والديناميكي
 * يجلب المنتجات حية من API المنصة مباشرة — بدون كاش
 *
 * الفلاتر المدعومة:
 *   ?page=1          — رقم الصفحة
 *   ?per_page=10     — عدد العناصر (max: 50)
 *   ?keyword=نص      — بحث (سلة: keyword، زد: q)
 *   ?status=active   — الحالة (سلة فقط: active|hidden|out_of_stock)
 *   ?category=123    — فلتر بالقسم (سلة: category_id، زد: categories)
 */
export const getProducts = async (req, res) => {
  try {
    const platform = req.user.platform;
    const accessToken = req.storeToken.accessToken;
    const managerToken = req.storeToken.managerToken;

    // ─── Input Validation ─────────────────────────────────────────────────────
    let page = parseInt(req.query.page) || 1;
    let per_page = parseInt(req.query.per_page) || 10;
    const keyword = String(req.query.keyword || '').slice(0, 100);
    const status = String(req.query.status || '');
    const category = String(req.query.category || '');

    if (page < 1) page = 1;
    if (per_page < 1) per_page = 10;
    if (per_page > 50) per_page = 50;

    // ─── جلب حي مباشر من API المنصة ──────────────────────────────────────────
    const result = await req.platformService.fetchProducts(accessToken, managerToken, {
      page,
      per_page,
      keyword,
      status,
      category,
      storeId: req.user.platformStoreId
    });

    const products = result.products || [];
    const pagination = result.pagination;

    // تحويل وتوحيد الهيكل
    const normalizedProducts = products.map(p => transformProduct(platform, p));

    const normalizedPagination = pagination ? {
      currentPage: Number(pagination.current_page || pagination.currentPage) || 1,
      totalPages: Number(pagination.total_pages || pagination.totalPages) || Math.ceil((pagination.total || 0) / per_page) || 1,
      perPage: Number(pagination.per_page || pagination.perPage) || per_page,
      total: Number(pagination.total) || 0
    } : {
      currentPage: page,
      totalPages: 1,
      perPage: per_page,
      total: normalizedProducts.length
    };

    return res.status(200).json({
      success: true,
      data: normalizedProducts,
      pagination: normalizedPagination
    });
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتجات'
    });
  }
};
