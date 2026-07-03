import { useOutletContext } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Package, Users } from "lucide-react"

export function DashboardWelcomePage() {
  const { user } = useOutletContext<any>()

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans" dir="rtl">

      {/* Store Header Identity */}
      <div className="flex items-center gap-4 bg-card border border-border/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />

        <img
          src={user.avatarUrl || "/logo.png"}
          alt="Store Avatar"
          className="size-16 md:size-20 rounded-xl border border-border/80 object-cover shadow-sm bg-background"
        />
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            {user.storeName || user.name || "متجر جديد"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-md border border-primary/20">
              {user.platform === 'salla' ? 'متجر سلة' : user.platform === 'zid' ? 'متجر زد' : user.platform}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              معرف المتجر: {user.platformStoreId}
            </span>
          </div>
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
