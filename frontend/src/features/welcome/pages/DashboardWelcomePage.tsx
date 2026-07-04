import { useOutletContext } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Package, Users } from "lucide-react"

export function DashboardWelcomePage() {
  const { user } = useOutletContext<any>()

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans" dir="rtl">

      {/* Premium Welcome Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/10 p-2 md:p-5 shadow-sm">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
      
            
            <p className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex flex-wrap items-center gap-3">
              مرحباً بك، <span className="text-primary">{user.name?.split(' ')[0] || 'مدير المتجر'}</span>
              <span className="inline-block animate-bounce origin-bottom-right duration-1000">👋</span>
            </p>
            
            <p className="text-muted-foreground text-sm md:text-base  leading-relaxed mt-1 font-medium">
              إليك نظرة شاملة على أداء متجرك <span className="font-bold text-foreground mx-1">{user.storeName || 'الجديد'}</span> اليوم. نتمنى لك يوماً مليئاً بالطلبات والنجاح! 🚀
            </p>
          </div>

          {/* Quick Stats or Decorative Profile */}
          {/* <div className="hidden lg:flex items-center gap-4 bg-background/60 backdrop-blur-md p-3 rounded-3xl border border-white/10 shadow-sm">
             <div className="flex items-center gap-4 bg-card rounded-2xl p-2 pr-4 border border-border/50 shadow-sm">
               <div className="flex flex-col text-right">
                  <span className="text-[10px] text-muted-foreground font-bold">معرف المتجر</span>
                  <span className="text-xs font-black">{user.platformStoreId || '---'}</span>
               </div>
               <img
                  src={user.avatarUrl || "/logo.png"}
                  alt="Store Avatar"
                  className="size-14 rounded-xl border border-border/80 object-cover shadow-sm bg-background"
                />
             </div>
          </div> */}
        </div>
      </div>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-accent flex items-center justify-center text-primary">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">المبيعات اليوم</p>
              <p className="text-2xl font-black mt-1">0 ر.س</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-accent flex items-center justify-center text-primary">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">الطلبات الجديدة</p>
              <p className="text-2xl font-black mt-1">0</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-accent flex items-center justify-center text-primary">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">العملاء</p>
              <p className="text-2xl font-black mt-1">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
