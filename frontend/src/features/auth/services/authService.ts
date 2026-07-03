import { apiClient } from '@/services/apiClient'

export interface AuthUser {
  id: string | number
  email: string
  name?: string
  platform?: string
  avatarUrl?: string
  storeName?: string
  platformStoreId?: string
}

/**
 * authService — يتصل بالـ backend عبر الكوكي فقط
 * لا يوجد أي تعامل مع localStorage
 */
export const authService = {
  /**
   * جلب بيانات المستخدم الحالي من الـ backend عبر كوكي الجلسة
   */
  getMe: async (): Promise<AuthUser | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: AuthUser }>('/api/auth/me')
      return response.data.success ? response.data.data : null
    } catch {
      return null
    }
  },

  /**
   * تسجيل الخروج — يُخبر الـ backend بمسح الكوكي
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch {
      // تجاهل الأخطاء — الكوكي سيُمسح من الـ backend في كلا الحالتين
    } finally {
      // إطلاق حدث لتحديث حالة المصادقة في كل المكونات
      window.dispatchEvent(new Event('auth_change'))
    }
  },
}
