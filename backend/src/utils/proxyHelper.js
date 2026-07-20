/**
 * فحص ما إذا كان استعلام البحث يمثل رمز SKU
 * @param {string} str - نص الاستعلام
 * @returns {boolean}
 */
const isSkuPattern = (str) => {
  if (!str) return false;
  const trimmed = str.trim();
  // السكيو غالباً يحتوي على واصلة أو نقطة، أو يكون مزيجاً من الحروف والأرقام بطول أكبر من أو يساوي 6
  const hasDashesOrDots = /[-.]/.test(trimmed);
  const isAlphanumericAndLong = /^[a-zA-Z0-9]{6,}$/.test(trimmed);
  const isPureNumberAndLong = /^[0-9]{8,}$/.test(trimmed);
  return hasDashesOrDots || isAlphanumericAndLong || isPureNumberAndLong;
};

/**
 * تحويل بارامترات الفرونت إند الموحدة إلى ما يناسب المنصة الخارجية
 * @param {object} query - معاملات الاستعلام القياسية
 * @param {string} platform - المنصة ('salla' or 'zid')
 * @param {string} path - مسار الطلب
 * @returns {object} معاملات الاستعلام المترجمة
 */
export const normalizeQueryParams = (query, platform, path) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 15;
  const normalized = {};

  const isProductPath = path && path.includes('products');
  const isSkuSearch = isProductPath && query.search && isSkuPattern(query.search);

  if (platform === 'salla') {
    normalized.page = page;
    normalized.per_page = isSkuSearch ? 100 : limit;
    
    // ترجمة البحث (سواء للمنتجات أو الأقسام)
    if (query.search && !isSkuSearch) {
      normalized.keyword = query.search;
    }
    
    // ترجمة الفلترة بالقسم (للمنتجات فقط)
    if (query.category_id) {
      normalized.categories = [query.category_id];
    }

    // إزالة التنسيق الخفيف لجلب كامل تفاصيل المنتجات (الأسعار، الصور، الكميات، الأقسام)
  } else if (platform === 'zid') {
    normalized.page = page;
    normalized.page_size = isSkuSearch ? 100 : limit;

    // ترجمة البحث
    if (query.search && !isSkuSearch) {
      if (isProductPath) {
        normalized.name = query.search;
      } else {
        // زد لا يدعم فلترة الأقسام بالسيرفر ولكن نمررها كـ name احتياطاً لو طرأ تحديث
        normalized.name = query.search;
      }
    }

    // ترجمة الفلترة بالقسم (للمنتجات فقط)
    if (query.category_id) {
      normalized.categories = query.category_id;
    }

    // ترجمة حالة النشر إلى مسودة لزد
    if (query.is_published) {
      normalized.is_draft = query.is_published === 'true' ? 'false' : 'true';
    }
  }

  // دمج بقية المعاملات المرسلة بدون ترجمة (مثل filters خاصة أو غيرها)
  // ونقوم بحذف المعاملات الموحدة التي قمنا بترجمتها
  const finalQuery = { ...query, ...normalized };
  delete finalQuery.limit;
  delete finalQuery.search;
  delete finalQuery.category_id;
  delete finalQuery.is_published;

  // حذف المعاملات الخاصة بالأقسام التي تتم تصفيتها محلياً في البروكسي لمنع السيرفر الخارجي من إرجاع قائمة فارغة
  if (path && path.includes('categories')) {
    delete finalQuery.status;
    delete finalQuery.page;
    delete finalQuery.per_page;
    delete finalQuery.page_size;
    delete finalQuery.limit;
  }

  return finalQuery;
};

/**
 * توحيد استجابات الباجينيشن من المنصات المختلفة
 * @param {object} rawData - البيانات الخام المستلمة من المنصة
 * @param {string} platform - المنصة ('salla' or 'zid')
 * @param {string} path - مسار الطلب
 * @param {object} originalQuery - معاملات الاستعلام الأصلية التي أرسلها الفرونت إند
 * @returns {object} كائن الاستجابة الموحد القياسي
 */
export const normalizeProxyResponse = (rawData, platform, path, originalQuery) => {
  const page = parseInt(originalQuery.page) || 1;
  const limit = parseInt(originalQuery.limit) || 15;
  const pathLower = path.toLowerCase();

  let unifiedData = [];
  let pagination = {
    currentPage: page,
    totalPages: 1,
    totalCount: 0,
    perPage: limit,
    hasNext: false,
    hasPrev: page > 1,
  };

  // ─── 1. توحيد ردود منصة سلة (Salla) ──────────────────────────────
  if (platform === 'salla') {
    unifiedData = rawData?.data || [];
    
    if (rawData?.pagination) {
      const p = rawData.pagination;
      const currentPage = p.currentPage || page;
      const totalPages = p.totalPages || 1;
      pagination = {
        currentPage,
        totalPages,
        totalCount: p.total || p.count || unifiedData.length,
        perPage: p.perPage || limit,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      };
    }
  } 
  // ─── 2. توحيد ردود منصة زد (Zid) ───────────────────────────────
  else if (platform === 'zid') {
    // استخراج مصفوفة البيانات حسب مسار الطلب
    if (pathLower.includes('products')) {
      unifiedData = rawData?.results || rawData?.products || [];
    } else if (pathLower.includes('categories')) {
      unifiedData = rawData?.categories || rawData?.results || [];
    } else if (pathLower.includes('orders')) {
      unifiedData = rawData?.orders || rawData?.results || [];
    } else if (pathLower.includes('customers')) {
      unifiedData = rawData?.customers || rawData?.results || [];
    } else {
      // heuristic/fallback
      unifiedData = rawData?.data || rawData?.results || rawData?.categories || rawData?.orders || rawData?.customers || [];
      if (!Array.isArray(unifiedData) && typeof rawData === 'object' && rawData !== null) {
        unifiedData = [rawData];
      }
    }

    // استخراج باجينيشن زد
    const totalCount = rawData?.count || rawData?.total_categories_count || rawData?.total_order_count || unifiedData.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      perPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // ─── 3. معالجة وتصفية الأقسام في البروكسي (سيرفر-سايد محاكي) ────────────────
  if (pathLower.includes('categories')) {
    // 1. فلترة البحث محلياً
    if (originalQuery.search) {
      const search = originalQuery.search.trim().toLowerCase();
      unifiedData = unifiedData.filter(item => {
        const nameAr = typeof item.name === 'object' ? (item.name?.ar || '') : item.name || '';
        const nameEn = typeof item.name === 'object' ? (item.name?.en || '') : '';
        const slug = item.slug || '';
        const id = String(item.id);
        return nameAr.toLowerCase().includes(search) || 
               nameEn.toLowerCase().includes(search) || 
               slug.toLowerCase().includes(search) || 
               id.includes(search);
      });
    }

    // 2. فلترة الحالة لمنصة سلة
    if (platform === 'salla' && originalQuery.status) {
      const statusFilter = originalQuery.status; // active | hidden
      unifiedData = unifiedData.filter(item => {
        const itemStatus = item.status || 'active';
        return itemStatus === statusFilter;
      });
    }

    // 3. فلترة حالة النشر لمنصة زد
    if (platform === 'zid' && originalQuery.is_published) {
      const isPublishedFilter = originalQuery.is_published === 'true';
      unifiedData = unifiedData.filter(item => {
        const itemPublished = item.is_published ?? true;
        return itemPublished === isPublishedFilter;
      });
    }

    // 4. تقسيم الصفحات (Pagination) محلياً
    const totalCount = unifiedData.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    unifiedData = unifiedData.slice(startIndex, startIndex + limit);

    pagination = {
      currentPage,
      totalPages,
      totalCount,
      perPage: limit,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }

  // ─── 4. تصفية المنتجات محلياً بالـ SKU أو المعرف أو الاسم ───
  if (pathLower.includes('products') && originalQuery.search) {
    const search = originalQuery.search.trim().toLowerCase();
    unifiedData = unifiedData.filter(item => {
      const nameAr = typeof item.name === 'object' ? (item.name?.ar || '') : item.name || '';
      const nameEn = typeof item.name === 'object' ? (item.name?.en || '') : '';
      const sku = item.sku || '';
      const id = String(item.id);
      return nameAr.toLowerCase().includes(search) || 
             nameEn.toLowerCase().includes(search) || 
             sku.toLowerCase().includes(search) || 
             id.includes(search);
    });

    // إعادة حساب الباجينيشن للمنتجات بعد التصفية المحلية بالـ SKU
    const totalCount = unifiedData.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    unifiedData = unifiedData.slice(startIndex, startIndex + limit);

    pagination = {
      currentPage,
      totalPages,
      totalCount,
      perPage: limit,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }

  return {
    success: true,
    data: unifiedData,
    pagination,
  };
};
