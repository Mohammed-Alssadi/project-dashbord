import axios from 'axios';
import { toast } from 'sonner';

const baseApiUrl = import.meta.env.VITE_API_URL || '';

/**
 * apiClient — يُرسل الكوكي تلقائياً مع كل طلب (credentials: include)
 * لا يوجد أي تعامل مع localStorage
 */
export const apiClient = axios.create({
  baseURL: baseApiUrl,
  withCredentials: true, // إرسال الكوكي (JWT) مع كل طلب تلقائياً
});

// معالجة الأخطاء العامة عبر toast
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.success && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // تجاهل أخطاء 401 — تحدث بشكل طبيعي عند عدم وجود جلسة أو بعد تسجيل الخروج
    // useAuthState يتعامل معها بصمت عبر try/catch الخاص به
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }
    const backendMessage = error.response?.data?.message;
    const defaultErrorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
    toast.error(backendMessage || defaultErrorMessage);
    return Promise.reject(error);
  }
);
