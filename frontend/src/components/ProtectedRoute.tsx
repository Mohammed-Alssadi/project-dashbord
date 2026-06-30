import { Outlet } from "react-router-dom"

export function ProtectedRoute() {
  // تم إيقاف حماية الصفحات مؤقتاً بناءً على رغبة المستخدم
  // المكون يمرر المحتوى مباشرة دون الحاجة للتحقق من الجلسة أو الـ localStorage حالياً
  return <Outlet />
}
