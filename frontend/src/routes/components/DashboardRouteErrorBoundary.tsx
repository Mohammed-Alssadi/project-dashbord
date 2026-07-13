import { useRouteError, useRevalidator } from "react-router-dom";

/**
 * DashboardRouteErrorBoundary - شباك صيد الأخطاء لمسارات لوحة التحكم الداخلية
 * يقوم بإعادة المحاولة الناعمة (Soft Retry) عبر الـ Revalidator دون خسارة السايدبار والهيدر
 */
export function DashboardRouteErrorBoundary() {
  const error = useRouteError() as any;
  const revalidator = useRevalidator();
  console.error("Dashboard Route Error caught:", error);

  const handleRetry = () => {
    revalidator.revalidate();
  };

  const isRevalidating = revalidator.state === "loading";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-card border border-border/60 rounded-2xl gap-4 m-6 font-sans" dir="rtl">
      <div className="p-3 bg-destructive/10 rounded-full text-destructive">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-foreground">عذراً، فشل تحميل الصفحة!</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        حدث خطأ داخلي أثناء محاولة عرض هذه الصفحة. قد يكون هناك خلل مؤقت في جلب البيانات أو الاتصال.
      </p>
      <button 
        onClick={handleRetry}
        disabled={isRevalidating}
        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        {isRevalidating && (
          <div className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        )}
        <span>إعادة المحاولة</span>
      </button>
    </div>
  );
}
