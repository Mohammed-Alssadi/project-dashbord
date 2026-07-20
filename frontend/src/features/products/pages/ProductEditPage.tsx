import { useEffect } from "react";
import { ProductEditSidebar } from "../components/ProductEdit/ProductEditSidebar";
import { Accordion } from "../../../components/ui/accordion";
import { BasicInfoSection } from "../components/ProductEdit/BasicInfoSection";
import { PricingInventorySection } from "../components/ProductEdit/PricingInventorySection";
import { ProductDetailsSection } from "../components/ProductEdit/ProductDetailsSection";
import { VariantsSection } from "../components/ProductEdit/VariantsSection";
import { CustomizationsSection } from "../components/ProductEdit/CustomizationsSection";
import { SeoSection } from "../components/ProductEdit/SeoSection";
import { Button } from "../../../components/ui/button";
import { ChevronRight, Save, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductEditStore } from "../store/productEditStore";
import { useProductForm } from "../hooks/useProductForm";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { loadProductData, isLoading, isSaving, error, endpointErrors, unifiedProduct } = useProductEditStore();
  const { methods, onFormSubmit, handleFormSubmit } = useProductForm();

  useEffect(() => {
    if (id) {
      loadProductData(id);
    }
  }, [id, loadProductData]);

  const handleSave = async (data: any) => {
    try {
      await onFormSubmit(data);
      if (id) {
        navigate(`/products/${id}`);
      }
    } catch (e: any) {
      console.error("Failed to save product changes:", e);
      const errorMsg = e.response?.data?.message || e.message || "حدث خطأ غير متوقع أثناء حفظ التعديلات";
      toast.error(typeof errorMsg === 'object' ? (errorMsg.description || errorMsg.message || JSON.stringify(errorMsg)) : errorMsg);
    }
  };

  // ── شاشة التحميل ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">جاري جلب بيانات المنتج من المنصة...</p>
      </div>
    );
  }

  // ── خطأ قاتل (فشل جلب المنتج نفسه) ─────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <p className="text-destructive font-semibold text-lg">فشل تحميل المنتج</p>
          <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
        </div>
        <Button onClick={() => id && loadProductData(id)}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const partialErrors = Object.entries(endpointErrors);

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right pb-10" dir="rtl">

        {/* ── ترويسة الصفحة ثابتة (Sticky Header) ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 py-3 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 -mt-4 md:-mt-6 lg:-mt-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="size-8 rounded-lg shrink-0"
            >
              <ChevronRight className="size-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground shrink-0">تعديل المنتج</h2>
              <span className="text-muted-foreground text-sm font-normal hidden sm:inline-block">|</span>
              <span className="text-muted-foreground text-base font-semibold truncate max-w-[150px] md:max-w-[300px] lg:max-w-[450px]">
                {unifiedProduct?.nameAr || unifiedProduct?.nameEn || "منتج بدون تسمية"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs font-semibold"
              onClick={() => navigate(-1)}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-lg text-xs font-semibold gap-1.5"
              onClick={handleFormSubmit(handleSave)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </div>

        {/* ── تحذيرات الـ Endpoints الاختيارية الفاشلة ─────────────────────── */}
        {partialErrors.length > 0 && (
          <div className="space-y-1.5">
            {partialErrors.map(([key, msg]) => (
              <div
                key={key}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-amber-200/80 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800/60 text-amber-800 dark:text-amber-400 text-sm"
              >
                <AlertTriangle className="size-4 shrink-0" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── المحتوى الرئيسي ───────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-6">
            <Accordion type="multiple" defaultValue={["basic-info"]} className="w-full space-y-4">
              <BasicInfoSection />
              <PricingInventorySection />
              <ProductDetailsSection />
              <VariantsSection />
              <CustomizationsSection />
              <SeoSection />
            </Accordion>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-20 space-y-6">
              <ProductEditSidebar />
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
