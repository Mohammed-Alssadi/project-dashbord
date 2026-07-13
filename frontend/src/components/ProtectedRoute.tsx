import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"

/**
 * مسار محمي — يتحقق من الجلسة عبر الكوكي ويشغل جلب بيانات المستخدم
 */
export function ProtectedRoute() {
  const loading = useAuthStore(state => state.loading)
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
