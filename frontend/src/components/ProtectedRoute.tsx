import { Navigate, Outlet } from "react-router-dom"
import { useAuthState } from "@/features/auth/hooks/useAuthState"

/**
 * مسار محمي — يتحقق من الجلسة عبر الكوكي باستخدام useAuthState
 */
export function ProtectedRoute() {
  const { user, loading, isLoggedIn } = useAuthState()

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

  // تمرير المستخدم عبر الـ context ليتمكن DashboardLayout من استخدامه بدون جلب إضافي
  return <Outlet context={{ user }} />
}
