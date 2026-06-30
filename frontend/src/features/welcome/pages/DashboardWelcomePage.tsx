import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Sparkles, ArrowLeft, Store } from "lucide-react"

export function DashboardWelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 w-full animate-fade-in font-sans text-right" dir="rtl">
      <Card className="w-full max-w-2xl border border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
        
        <CardContent className="p-8 md:p-12 space-y-6 flex flex-col items-center text-center">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-sm border border-primary/20">
            <Sparkles className="size-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              مرحباً بك عميلنا العزيز في منصة <span className="bg-gradient-to-r from-primary to-indigo-650 bg-clip-text text-transparent">DashAI</span> 👋
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
              أهلاً بك في فضاء متجرك الذكي. DashAI هي لوحتك المتكاملة لدمج قنوات بيعك وإدارتها بالذكاء الاصطناعي دون تعقيد.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm pt-4 justify-center">
            <Button asChild className="w-full sm:w-auto px-6 h-11 rounded-xl font-bold border-0 shadow-md shadow-primary/10">
              <Link to="/dashboard/stores" className="flex items-center gap-2">
                <Store className="size-4" />
                <span>إدارة المتاجر المرتبطة</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto px-6 h-11 rounded-xl font-bold border-border">
              <Link to="/connect" className="flex items-center gap-2">
                <span>ربط متجر جديد</span>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
