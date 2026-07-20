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
    const isProxyOrUpload = error.config?.url?.includes('/api/proxy') || error.config?.url?.includes('/api/upload');
    if (error.response?.status === 401 && !isProxyOrUpload) {
      toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجدداً');
      
      // تحديث حالة تسجيل الدخول في الستور المركزي لإطلاق التوجيه الناعم (Soft Redirect)
      // هذا يحافظ على التوست ظاهراً على الشاشة بدلاً من حذفه بإعادة تحميل الصفحة كاملة
      useAuthStore.setState({ user: null, isLoggedIn: false, loading: false });

      return Promise.reject(error);
    }

    // إظهار إشعار (Toast) لأي خطأ قادم من الباك اند (مهما كان نوع الطلب)
    const data = error.response?.data;
    let extractedMessage = '';

    if (data) {
      // 1. إذا كان الكائن يحتوي على رسالة نصية مباشرة
      if (typeof data.message === 'string') {
        extractedMessage = data.message;
      }
      // 2. إذا كانت رسالة سلة/زد المهيكلة (مثلاً: message: { description: "..." })
      else if (data.message && typeof data.message === 'object') {
        extractedMessage = data.message.description || data.message.name || data.message.message || JSON.stringify(data.message);
      }
      // 3. إذا كان هناك حقل detail (مثل ردود زد)
      else if (typeof data.detail === 'string') {
        extractedMessage = data.detail;
      }
      // 4. إذا كان هناك حقل error مباشر
      else if (typeof data.error === 'string') {
        extractedMessage = data.error;
      }
      // 5. إذا كان هناك حقل details يحتوي على معلومات أعمق (مثل رد الرفع المخصص)
      else if (data.details) {
        const details = data.details;
        if (typeof details === 'string') {
          extractedMessage = details;
        } else if (typeof details === 'object') {
          // استخراج تفاصيل أخطاء الحقول مثل {"id": ["هذا الحقل مطلوب"]} أو {"image": [...]}
          const fieldErrors = Object.entries(details)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : JSON.stringify(val)}`)
            .join(' | ');
          extractedMessage = fieldErrors || JSON.stringify(details);
        }
      }
      // 6. إذا كان الرد عبارة عن أخطاء حقول مباشرة بالكامل (مثل {"image": ["لم يتم إرسال أي ملف."]})
      else if (typeof data === 'object') {
        const fieldErrors = Object.entries(data)
          .filter(([key]) => key !== 'success')
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : JSON.stringify(val)}`)
          .join(' | ');
        if (fieldErrors) {
          extractedMessage = fieldErrors;
        }
      }
    }

    // إذا لم ننجح في استخراج رسالة، نستخدم الخطأ الافتراضي من المتصفح/أكسيوس
    if (!extractedMessage) {
      extractedMessage = error.message || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
    }

    toast.error(extractedMessage, { duration: 6000 });

    return Promise.reject(error);
  }
);
