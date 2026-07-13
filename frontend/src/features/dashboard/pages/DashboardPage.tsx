import { Card, CardContent } from "@/components/ui/card"
import { Package, Users, ShoppingBag, Folder } from "lucide-react"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useDashboardStore } from "../store/dashboardStore"
import { DashboardSkeleton } from "../components/DashboardSkeleton"

export function DashboardPage() {
  const user = useAuthStore(state => state.user)
  const stats = useDashboardStore(state => state.stats)
  const isLoading = useDashboardStore(state => state.isLoading)
  const error = useDashboardStore(state => state.error)

  if (!user) return null

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans" dir="rtl">
      {/* Premium Welcome Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/10 p-2 md:p-5 shadow-sm">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 p-2">
            <p className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex flex-wrap items-center gap-3">
              مرحباً بك، <span className="text-primary">{user.name?.split(' ')[0] || 'مدير المتجر'}</span>
              <span className="inline-block animate-bounce origin-bottom-right duration-1000">👋</span>
            </p>
            
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-1 font-medium">
              إليك نظرة شاملة على أداء متجرك <span className="font-bold text-foreground mx-1">{user.storeName || 'الجديد'}</span> اليوم. نتمنى لك يوماً مليئاً بالطلبات والنجاح! 🚀
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Total Orders */}
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">إجمالي الطلبات</p>
              <p className="text-2xl font-black mt-1">{stats?.totalOrders || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">إجمالي العملاء</p>
              <p className="text-2xl font-black mt-1">{stats?.totalCustomers || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">إجمالي المنتجات</p>
              <p className="text-2xl font-black mt-1">{stats?.totalProducts || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Categories */}
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Folder className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">إجمالي الأقسام</p>
              <p className="text-2xl font-black mt-1">{stats?.totalCategories || 0}</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
