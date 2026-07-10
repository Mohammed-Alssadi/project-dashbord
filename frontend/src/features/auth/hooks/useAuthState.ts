import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

/**
 * useAuthState — يجلب حالة المستخدم من متجر Zustand المشترك
 * لمنع تكرار طلبات الشبكة بالتوازي
 */
export function useAuthState() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const fetchUser = useAuthStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, isLoggedIn, loading }
}

