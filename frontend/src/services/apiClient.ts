import axios from 'axios';
import { toast } from 'sonner';

const baseApiUrl = import.meta.env.VITE_API_URL || '';

/**
 * apiClient — يُرسل الكوكي تلقائياً مع كل طلب (credentials: include)
 * لا يوجد أي تعامل مع localStorage
 */
export const apiClient = axios.create({
  baseURL: baseApiUrl,
  withCredentials: true,
});

// معالجة الاستجابات عبر interceptor
apiClient.interceptors.response.use(
  (response) => {
    // نعرض toast.success فقط على طلبات التعديل (مش GET)
    // طلبات جلب البيانات العادية لا تحتاج إشعاراً
    const method = response.config.method?.toUpperCase();
    const isMutation = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

    if (isMutation && response.data?.success && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // تجاهل أخطاء 401 — تحدث بشكل طبيعي عند عدم وجود جلسة أو بعد تسجيل الخروج
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    const method = error.config?.method?.toUpperCase();
    const isMutation = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

    // حصر التنبيه التلقائي بالـ Toast لعمليات الإدخال والتعديل والحذف فقط
    if (isMutation) {
      let backendMessage = error.response?.data?.message;
      if (typeof backendMessage === 'object' && backendMessage !== null) {
        backendMessage = backendMessage.description || backendMessage.name || JSON.stringify(backendMessage);
      }
      const defaultErrorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
      toast.error(typeof backendMessage === 'string' ? backendMessage : defaultErrorMessage);
    }

    return Promise.reject(error);
  }
);
