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
  refreshSallaAttributes: (productId: string) => Promise<void>;
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
      // إصلاح #9 — سلة: استخدام خيارات المنتج الحالي فقط
      // جلب 50 منتج ودمج خياراتها يُلوّث IDs الخيارات ويُسبّب رفض سلة للطلبات
      attributes = Array.isArray(productData?.options) ? productData.options : [];
    }

    // إصلاح #20 (مشكلة #66): فشل جلب التصنيفات — رسالة واضحة بصبب المشكلة
    let categories: any[] = [];
    if (categoriesResult.status === 'fulfilled' && categoriesResult.value) {
      categories = extractArray(categoriesResult);
    } else if (categoriesResult.status === 'rejected') {
      const msg = 'فشل جلب تصنيفات المتجر — لن تتمكن من تغيير التصنيف. تحقق من الاتصال';
      errors.categories = msg;
      toast.warning(msg);
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

    // Guard: منع الاستدعاء المزدوج عند الضغط السريع على زر الحفظ
    if (state.isSaving) {
      console.warn('[saveProductData] Already saving — ignoring duplicate call');
      return;
    }

    set({ isSaving: true, validationErrors: {} });
    const productId = state.unifiedProduct.id;

    // إصلاح #37: تأخير متسلسل بين طلبات سلة لتجنب تجاوز Rate Limit (120 req/min)
    const sallaWriteDelay = () => new Promise<void>(r => setTimeout(r, 300));

    // تنفيذ مصفوفة مهام بالتتابع مع تأخير بين كل طلب لتجنب Rate Limit
    // الإصلاح: استخدام index بدلاً من tasks.indexOf(task) — O(N) بدل O(N²)
    const runSequentially = async <T>(tasks: (() => Promise<T>)[]): Promise<PromiseSettledResult<T>[]> => {
      const results: PromiseSettledResult<T>[] = [];
      for (let i = 0; i < tasks.length; i++) {
        try {
          const value = await tasks[i]();
          results.push({ status: 'fulfilled', value });
        } catch (reason) {
          results.push({ status: 'rejected', reason });
        }
        if (i < tasks.length - 1) {
          await sallaWriteDelay();
        }
      }
      return results;
    };

    try {
      if (state.platform === 'zid') {
        const basicPayload = ProductAdapter.toZidBasicPayload(formData);

        // 1. Update basic details (بدون حقل categories لأن زد تتجاهله في PATCH)
        await productEditService.updateProductBasicInfo(productId, basicPayload, state.platform);

        // 1.5. مزامنة الأقسام لزد
        const originalCatIds = (state.unifiedProduct?.categories || []).map((c: any) => Number(c.id));
        const newCatIds = (formData.categories || []).map((c: any) => Number(c.id));

        const toRemove = originalCatIds.filter((id: number) => !newCatIds.includes(id));
        const toAdd = newCatIds.filter((id: number) => !originalCatIds.includes(id));

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
          const originalVariantIds = (state.unifiedProduct?.variants || []).map((v: any) => String(v.id));
          const currentVariantIds = formData.variants.map((v: any) => String(v.id));
          const deletedVariantIds = originalVariantIds.filter((id: string) => !currentVariantIds.includes(id));

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

        // 1. تحديث المعلومات الأساسية للمنتج
        // إصلاح #19 (#68): معالجة خطأ التصنيف منفصلاً لتوفير رسالة هادفة
        try {
          await productEditService.updateProductBasicInfo(productId, basicPayload, state.platform);
        } catch (basicErr: any) {
          const errMsg = (basicErr?.response?.data?.message || basicErr?.message || '').toLowerCase();
          if (errMsg.includes('categor') || errMsg.includes('تصنيف')) {
            toast.warning('تم حفظ بيانات المنتج — لكن فشل تحديث التصنيف. تحقق من صلاحية تصنيفات متجرك');
            // نكمل حفظ المتغيرات حتى لو فشل التصنيف
          } else {
            throw basicErr;
          }
        }

        // 2. معالجة المتغيرات (SKUs) — تحديث البيانات والكميات للمتغيرات الموجودة
        if (formData.variants && formData.variants.length > 0) {
          const originalVariantIds = (state.unifiedProduct?.variants || []).map(v => String(v.id));

          // تحديث المتغيرات الموجودة في سلة فقط (تجاهل المعرفات المؤقتة)
          const existingVariants = formData.variants
            .filter((v: any) => !String(v.id).startsWith('row-') && !String(v.id).startsWith('val-') && originalVariantIds.includes(String(v.id)));

          if (existingVariants.length > 0) {
            const variantUpdateResults = await runSequentially(
              existingVariants.map((variant: any) => () =>
                productEditService.updateProductVariant(
                  productId, variant.id, ProductAdapter.toSallaVariantPayload(variant), 'salla'
                ).catch(e => { throw { variantId: variant.id, displayName: variant.displayName, error: e }; })
              )
            );
            await sallaWriteDelay();

            // تجميع أخطاء التحديث الجزئية وتنبيه المستخدم إن وجدت
            const failedVariantNames = variantUpdateResults
              .filter(r => r.status === 'rejected')
              .map(r => (r as PromiseRejectedResult).reason?.displayName || 'متغير')
              .filter(Boolean);

            // إلقاء خطأ واضح إذا فشل تحديث أي متغير لمنع إظهار إشعار نجاح كاذب
            if (failedVariantNames.length > 0) {
              throw new Error(`فشل تحديث المتغيرات التالية: ${failedVariantNames.join(' | ')}`);
            }
          }
        }
      }

      toast.success('تم حفظ التغييرات بنجاح');
      // إصلاح #20 (#45): إعادة تحميل بيانات المنتج بعد الحفظ لمزامنة IDs الجديدة
      if (state.platform === 'salla') {
        try {
          await get().loadProductData(String(productId), state.platform);
        } catch (reloadErr) {
          console.warn('[Salla] Failed to reload product after save:', reloadErr);
        }
      }
      // إصلاح #20 (جزء 2): إعادة التحميل لزد عند وجود متغيرات جديدة — لمزامنة IDs الجديدة
      if (state.platform === 'zid' && (formData.variants || []).some((v: any) => String(v.id).startsWith('row-'))) {
        try {
          await get().loadProductData(String(productId), 'zid');
        } catch (reloadErr) {
          console.warn('[Zid] Failed to reload product after variant creation:', reloadErr);
        }
      }
    } catch (e: any) {
      console.error('Save Product Data Error:', e);
      throw e;
    } finally {
      set({ isSaving: false });
    }
  },

  // إصلاح #5 (مشكلة #10): إعادة جلب خيارات المنتج من سلة بعد إضافة خيار جديد
  // يضمن أن state.attributes يحتوي دائماً على البيانات الحديثة بنفس الهيكل
  refreshSallaAttributes: async (productId: string) => {
    if (get().platform !== 'salla') return; // عزل سلة — لا يؤثر على زد
    try {
      const raw = await productEditService.fetchProductBasicInfo(productId);
      const productData = raw?.data ?? raw;
      const freshOptions = Array.isArray(productData?.options) ? productData.options : [];
      set({ attributes: freshOptions });
    } catch (e) {
      console.warn('[Salla] Failed to refresh product options after new option creation:', e);
    }
  }
}));
