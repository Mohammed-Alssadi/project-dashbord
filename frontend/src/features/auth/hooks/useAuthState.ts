import { useEffect, useState } from 'react'
import { apiClient } from '@/services/apiClient'

import { type AuthUser } from '../services/authService'

/**
 * useAuthState — يجلب حالة المستخدم من الـ backend عبر الكوكي
 * لا يوجد أي تعامل مع localStorage
 */
export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: AuthUser }>('/api/auth/me')
      setUser(res.data.success ? res.data.data : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    // الاستماع لحدث تغيير المصادقة (logout)
    window.addEventListener('auth_change', fetchUser)
    return () => window.removeEventListener('auth_change', fetchUser)
  }, [])

  return { user, isLoggedIn: !!user, loading }
}
