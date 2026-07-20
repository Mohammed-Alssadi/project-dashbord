import { create } from 'zustand';
import { productEditService } from '../services/productEditService';
import { toast } from 'sonner';
import type { UnifiedProduct } from '../types/unifiedProduct';
import { ProductAdapter } from '../utils/productAdapter';
import { useAuthStore } from "@/features/auth/store/authStore";
import type { ProductFormData } from '../utils/productValidation';

// ── أخطاء الـ Endpoints الاختيارية ──────────────────────────────────────────
export interface EndpointErrors {
  images?: string;
  customOptions?: string;
  attributes?: string;
  badges?: string;
  categories?: string;
}

// ── نوع حالة الـ Store ────────────────────────────────────────────────────────
interface ProductEditState {
  product: any | null;                  // الكائن الخام من الـ API (لأغراض القراءة فقط كالشارات والتقييمات)
  unifiedProduct: UnifiedProduct | null; // الكائن الموحد الجديد لجميع عمليات التعديل والربط بالواجهة
  attributes: any[];                     // صفات المتجر المتاحة (زد فقط، أو خيارات المنتج المتاحة لسلة)
  categories: any[];                     // تصنيفات المتجر المتاحة لاختيارها
  platform: 'salla' | 'zid' | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;                  // خطأ قاتل يمنع تحميل الصفحة
  endpointErrors: EndpointErrors;        // أخطاء النهايات الاختيارية
  validationErrors: Record<string, string>; // أخطاء التحقق من المدخلات قبل الحفظ

  loadProductData: (productId: string | number, platform?: 'salla' | 'zid') => Promise<void>;
  resetStore: () => void;
  updateProductField: (field: string, value: any) => void;
  updateVariantField: (variantId: string | number, field: string, value: any) => void;
  saveProductData: (formData: ProductFormData) => Promise<void>;
}

// ── الحالة الابتدائية الفارغة ─────────────────────────────────────────────────
const EMPTY_STATE = {
  product: null,
  unifiedProduct: null as UnifiedProduct | null,
  attributes: [] as any[],
  categories: [] as any[],
  platform: null as 'salla' | 'zid' | null,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
  endpointErrors: {} as EndpointErrors,
  validationErrors: {} as Record<string, string>,
};

// ── الـ Store الرئيسي ─────────────────────────────────────────────────────────
export const useProductEditStore = create<ProductEditState>((set, get) => ({
  ...EMPTY_STATE,

  loadProductData: async (productId, platform) => {
    const activePlatform = platform ?? (useAuthStore.getState().user?.platform as 'salla' | 'zid') ?? 'zid';

    // ── إعادة تعيين كامل قبل التحميل لمنع ظهور بيانات منتج سابق ──
    set({ ...EMPTY_STATE, isLoading: true, platform: activePlatform });

    const errors: EndpointErrors = {};
    const isZid = activePlatform === 'zid';

    // 1. بيانات المنتج الأساسية — إلزامية (يوقف التحميل إذا فشلت)
    let productData: any = null;
    try {
      const raw = await productEditService.fetchProductBasicInfo(productId);
      productData = activePlatform === 'salla' ? (raw?.data ?? raw) : raw;
    } catch (e: any) {
      set({
        error: 'فشل جلب بيانات المنتج. تحقق من الاتصال وأعد المحاولة.',
        isLoading: false,
        endpointErrors: {},
      });
      return;
    }

    // 2. بيانات إضافية بالتوازي — اختيارية
    const [
      imagesResult,
      customOptionsResult,
      customUserInputResult,
      attributesResult,
      categoriesResult,
    ] = await Promise.allSettled([
      isZid
        ? productEditService.fetchProductImages(productId)
        : Promise.resolve(null),
      isZid
        ? productEditService.fetchProductCustomOptions(productId)
        : Promise.resolve(null),
      isZid
        ? productEditService.fetchProductCustomUserInputFields(productId)
        : Promise.resolve(null),
      isZid
        ? productEditService.fetchAttributes()
        : Promise.resolve(null),
      productEditService.fetchCategories(),
    ]);

    const extractArray = (res: PromiseSettledResult<any>) => {
      if (res.status === 'fulfilled' && res.value) {
        const val = res.value;
        if (Array.isArray(val)) return val;
        if (val && typeof val === 'object') {
          if (Array.isArray(val.results)) return val.results;
          if (Array.isArray(val.data)) return val.data;
          for (const key of Object.keys(val)) {
            if (Array.isArray(val[key])) return val[key];
          }
        }
      }
      return [];
    };

    let images: any[] = [];
    if (isZid) {
      if (imagesResult.status === 'fulfilled' && imagesResult.value) {
        images = extractArray(imagesResult);
      } else if (imagesResult.status === 'rejected') {
        errors.images = 'فشل جلب صور المنتج';
      }
    }

    let customOptions: any[] = [];
    if (isZid) {
      const opts = extractArray(customOptionsResult);
      const inputs = extractArray(customUserInputResult);
      customOptions = [...opts, ...inputs];
      if (customOptionsResult.status === 'rejected') {
        errors.customOptions = 'فشل جلب خيارات تخصيص المنتج';
      }
    }

    let attributes: any[] = [];
    if (isZid) {
      if (attributesResult.status === 'fulfilled' && attributesResult.value) {
        attributes = extractArray(attributesResult);
      } else if (attributesResult.status === 'rejected') {
        errors.attributes = 'فشل جلب خصائص المنتج';
      }
    } else {
      // سلة: لا تملك سلة مساراً عاماً لجلب الصفات (Attributes). للحصول على قائمة صفات المتجر وقيمها كاملة،
      // نقوم بجلب قائمة المنتجات الأخرى واستخراج الخيارات والقيم المتاحة ودمجها بذكاء.
      let allStoreOptions: any[] = [];
      try {
        const { apiClient } = await import('../../../services/apiClient');
        const productsRes = await apiClient.get('/api/proxy/products', { params: { per_page: 50 } });
        const productsList = productsRes.data?.data || productsRes.data || [];
        
        const optionsMap = new Map<string, any>();
        
        // 1. إضافة خيارات المنتج الحالي أولاً
        if (Array.isArray(productData?.options)) {
          productData.options.forEach((opt: any) => {
            const optName = typeof opt.name === 'object' ? (opt.name.ar || opt.name.en || '') : String(opt.name || '');
            if (optName) {
              optionsMap.set(optName, JSON.parse(JSON.stringify(opt)));
            }
          });
        }

        // 2. استخراج ودمج الخيارات من المنتجات الأخرى بالمتجر
        if (Array.isArray(productsList)) {
          productsList.forEach((prod: any) => {
            if (String(prod.id) === String(productId)) return;
            
            if (Array.isArray(prod.options)) {
              prod.options.forEach((opt: any) => {
                const optName = typeof opt.name === 'object' ? (opt.name.ar || opt.name.en || '') : String(opt.name || '');
                if (!optName) return;

                if (!optionsMap.has(optName)) {
                  optionsMap.set(optName, JSON.parse(JSON.stringify(opt)));
                } else {
                  const existingOpt = optionsMap.get(optName);
                  const existingVals = existingOpt.values || [];
                  const newVals = opt.values || [];
                  const mergedVals = [...existingVals];

                  newVals.forEach((nv: any) => {
                    const nvName = typeof nv.name === 'object' ? (nv.name.ar || nv.name.en || '') : String(nv.name || '');
                    const exists = existingVals.some((ev: any) => {
                      const evName = typeof ev.name === 'object' ? (ev.name.ar || ev.name.en || '') : String(ev.name || '');
                      return evName === nvName;
                    });
                    if (!exists) {
                      mergedVals.push(nv);
                    }
                  });
                  existingOpt.values = mergedVals;
                }
              });
            }
          });
        }
        allStoreOptions = Array.from(optionsMap.values());
      } catch (e) {
        console.warn('Failed to extract store options from Salla products list:', e);
        allStoreOptions = Array.isArray(productData?.options) ? productData.options : [];
      }
      attributes = allStoreOptions;
    }

    let categories: any[] = [];
    if (categoriesResult.status === 'fulfilled' && categoriesResult.value) {
      categories = extractArray(categoriesResult);
    } else if (categoriesResult.status === 'rejected') {
      errors.categories = 'فشل جلب تصنيفات المتجر';
    }

    const unifiedProduct = activePlatform === 'salla'
      ? ProductAdapter.fromSalla(productData)
      : ProductAdapter.fromZid(productData, images, customOptions);

    set({
      product: productData,
      unifiedProduct,
      attributes,
      categories,
      isLoading: false,
      error: null,
      endpointErrors: errors,
    });
  },

  resetStore: () => {
    set(EMPTY_STATE);
  },

  updateProductField: (field, value) => {
    set((state) => {
      if (!state.unifiedProduct) return {};
      const updatedUnifiedProduct = {
        ...state.unifiedProduct,
        [field]: value
      };
      return {
        unifiedProduct: updatedUnifiedProduct
      };
    });
  },

  updateVariantField: (variantId, field, value) => {
    set((state) => {
      if (!state.unifiedProduct) return {};

      const updatedUnifiedVariants = state.unifiedProduct.variants.map((uv) => {
        if (String(uv.id) === String(variantId)) {
          const key = (field === 'sale_price' || field === 'salePrice')
            ? 'salePrice'
            : (field === 'cost_price' || field === 'cost' || field === 'costPrice')
              ? 'costPrice'
              : field;

          if (key === 'stocks') {
            const newStocks = value;
            const totalQty = Array.isArray(newStocks) ? newStocks.reduce((sum: number, st: any) => sum + (st.quantity || 0), 0) : 0;
            const isAnyUnlimited = Array.isArray(newStocks) ? newStocks.some((st: any) => st.isUnlimited) : false;
            return {
              ...uv,
              stocks: newStocks,
              quantity: totalQty,
              isUnlimited: isAnyUnlimited
            };
          }

          const numericFields = ['price', 'salePrice', 'costPrice', 'quantity', 'weight'];
          const finalVal = numericFields.includes(key) && value !== '' && value !== null
            ? Number(value)
            : (value === '' ? null : value);

          return {
            ...uv,
            [key]: finalVal
          };
        }
        return uv;
      });

      return {
        unifiedProduct: {
          ...state.unifiedProduct,
          variants: updatedUnifiedVariants
        }
      };
    });
  },

  saveProductData: async (formData) => {
    const state = get();
    if (!state.unifiedProduct || !state.platform) return;

    set({ isSaving: true, validationErrors: {} });
    const productId = state.unifiedProduct.id;

    try {
      if (state.platform === 'zid') {
        const basicPayload = ProductAdapter.toZidBasicPayload(formData);

        // 1. Update basic details (بدون حقل categories لأن زد تتجاهله في PATCH)
        await productEditService.updateProductBasicInfo(productId, basicPayload, state.platform);

        // 1.5. مزامنة الأقسام لزد
        const originalCatIds = (state.unifiedProduct.categories || []).map(c => Number(c.id));
        const newCatIds = (formData.categories || []).map(c => Number(c.id));

        const toRemove = originalCatIds.filter(id => !newCatIds.includes(id));
        const toAdd = newCatIds.filter(id => !originalCatIds.includes(id));

        for (const catId of toRemove) {
          try {
            await productEditService.removeProductCategory(productId, catId);
          } catch (e) {
            console.warn(`لم يُحذف القسم ${catId} من المنتج:`, e);
          }
        }
        for (const catId of toAdd) {
          try {
            await productEditService.addProductCategory(productId, catId);
          } catch (e) {
            console.warn(`لم يُضاف القسم ${catId} للمنتج:`, e);
          }
        }

        // 2. مزامنة وتعديل وحذف المتغيرات
        if (formData.variants && formData.variants.length > 0) {
          const originalVariantIds = state.unifiedProduct.variants.map(v => String(v.id));
          const currentVariantIds = formData.variants.map(v => String(v.id));
          const deletedVariantIds = originalVariantIds.filter(id => !currentVariantIds.includes(id));

          // Delete removed variants
          for (const varId of deletedVariantIds) {
            await productEditService.deleteProductVariant(productId, varId, 'zid');
          }

          // Update or create current variants
          for (const variant of formData.variants) {
            const isNew = String(variant.id).startsWith('row-') || String(variant.id).startsWith('val-') || !originalVariantIds.includes(String(variant.id));
            const zidVariantPayload = ProductAdapter.toZidVariantPayload(variant);

            if (isNew) {
              await productEditService.createProductVariant(productId, zidVariantPayload);
            } else {
              await productEditService.updateProductVariant(productId, variant.id, zidVariantPayload, 'zid');
            }
          }
        }
      } else {
        const basicPayload = ProductAdapter.toSallaBasicPayload(formData);

        // 1. Update Salla Product Basic Info
        await productEditService.updateProductBasicInfo(productId, basicPayload, state.platform);

        // 2. Loop and update each Salla Variant SKU
        if (formData.variants.length > 0) {
          let reasonId = 303342349;
          try {
            const { apiClient } = await import('../../../services/apiClient');
            const reasonsRes = await apiClient.get('/api/proxy/products/quantities/reasons');
            const reasonsList = reasonsRes.data?.data || [];
            if (reasonsList.length > 0) {
              reasonId = reasonsList[0].id;
            }
          } catch (e) {
            console.warn('Failed to fetch Salla stock adjustment reasons, using fallback.', e);
          }

          for (const variant of formData.variants) {
            const sallaVarPayload = ProductAdapter.toSallaVariantPayload(variant);
            await productEditService.updateProductVariant(productId, variant.id, sallaVarPayload, 'salla');

            if (variant.stocks && variant.stocks.length > 0) {
              const quantitiesPayload = {
                quantities: variant.stocks.map(st => ({
                  branch: Number(st.locationId),
                  quantity: st.quantity,
                  reason_id: reasonId
                }))
              };
              await productEditService.updateSallaVariantQuantities(variant.id, quantitiesPayload);
            }
          }
        }
      }

      toast.success('تم حفظ التغييرات بنجاح');
    } catch (e: any) {
      console.error('Save Product Data Error:', e);
      throw e;
    } finally {
      set({ isSaving: false });
    }
  }
}));
