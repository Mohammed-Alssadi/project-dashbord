import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/authStore';

const baseApiUrl = import.meta.env.VITE_API_URL || '';

/**
 * apiClient — يُرسل الكوكي تلقائياً مع كل طلب (credentials: include)
 * لا يوجد أي تعامل مع localStorage
 */
export const apiClient = axios.create({
  baseURL: baseApiUrl,
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
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
    // معالجة خطأ 401 (انتهاء الجلسة أو غير مصرح)
    if (error.response?.status === 401) {
      toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجدداً');
      
      // تحديث حالة تسجيل الدخول في الستور المركزي لإطلاق التوجيه الناعم (Soft Redirect)
      // هذا يحافظ على التوست ظاهراً على الشاشة بدلاً من حذفه بإعادة تحميل الصفحة كاملة
      useAuthStore.setState({ user: null, isLoggedIn: false, loading: false });

      return Promise.reject(error);
    }

    // إظهار إشعار (Toast) لأي خطأ قادم من الباك اند (مهما كان نوع الطلب)
    let backendMessage = error.response?.data?.message;
    if (typeof backendMessage === 'object' && backendMessage !== null) {
      backendMessage = backendMessage.description || backendMessage.name || JSON.stringify(backendMessage);
    }
    const defaultErrorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
    toast.error(typeof backendMessage === 'string' ? backendMessage : defaultErrorMessage);

    return Promise.reject(error);
  }
);
