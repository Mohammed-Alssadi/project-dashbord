import { useRouteError } from "react-router-dom";
import { PageLoader } from "@/components/PageLoader";

/**
 * GlobalErrorBoundary - شباك صيد الأخطاء الكارثية على مستوى التطبيق بالكامل
 * يتعامل مع أخطاء التحميل (ChunkLoadError) الناتجة عن التحديثات وتحديثات السيرفر
 */
export function GlobalErrorBoundary() {
  const error = useRouteError() as any;
  const isChunkLoadError = error?.name === 'ChunkLoadError' || 
    (error?.message && error.message.includes("Failed to fetch dynamically imported module"));

  if (isChunkLoadError) {
    window.location.reload();
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center font-sans" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-destructive">عذراً، حدث خطأ غير متوقع!</h1>
      <p className="text-muted-foreground mb-6 text-sm">نعتذر، يبدو أن هناك مشكلة في تحميل هذه الصفحة أو تعذر الاتصال بالخادم.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm font-semibold"
      >
        إعادة تحميل الصفحة
      </button>
    </div>
  );
}
