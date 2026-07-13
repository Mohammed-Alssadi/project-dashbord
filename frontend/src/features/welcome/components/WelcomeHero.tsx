import { Button } from "@/components/ui/button"
import { ArrowLeft, User, LogOut, Layers } from "lucide-react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"
import { authService } from "@/features/auth/services/authService"
import { LiveCounters } from "./LiveCounters"

export function WelcomeHero() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logout()
    navigate("/")
  }

  return (
    <div className="relative w-full bg-slate-50 text-slate-900 overflow-hidden font-sans pt-6 border-b border-border/40">
      {/* Premium Light Blend Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-slate-50 to-purple-50 opacity-100 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_100%_120%,rgba(168,85,247,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-6 mt-4 h-20 flex items-center justify-between bg-white/70 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-xl shadow-slate-200/50">
        {/* Premium Logo */}
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-[2px] rounded-xl" />
            <Layers className="size-6 text-white relative z-10" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 drop-shadow-sm">
            لينك
          </span>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <RouterLink
                to="/dashboard"
                title="لوحة التحكم"
                className="size-10 rounded-xl flex items-center justify-center border border-slate-200/60 bg-white/50 hover:bg-white text-slate-700 transition-all duration-300 hover:shadow-md"
              >
                <User className="size-5" />
              </RouterLink>
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="size-10 rounded-xl flex items-center justify-center border border-slate-200/60 bg-white/50 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 transition-all duration-300 cursor-pointer hover:shadow-md"
              >
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <Button
              variant="default"
              asChild
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 text-sm cursor-pointer rounded-xl px-6 h-10 font-bold border-0 transition-all hover:scale-105"
            >
              <RouterLink to="/login">تسجيل الدخول</RouterLink>
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Right Content (Text) */}
        <div className="flex-1 flex flex-col items-start text-right space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            المنصة الأولى لإدارة المتاجر المتكاملة
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 drop-shadow-sm">
            أدِر متجرك على سلة أو زد بأسلوب{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-purple-600 block mt-2">
              أكثر احترافية وسهولة
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-medium">
            نظام متكامل يربط متجرك مباشرة لتتحكم بالمنتجات، الطلبات، والعملاء من مكان واحد. لا حاجة لمزيد من التعقيد، منصة "لينك" توفر لك أدوات الإدارة المثلى لنمو أرباحك.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Button size="lg" asChild className="w-full sm:w-auto px-10 h-14 rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 text-lg font-bold cursor-pointer border-0 group">
              <RouterLink to="/login" className="flex items-center justify-center gap-3">
                <span>ابدأ مجاناً الآن</span>
                <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1.5" />
              </RouterLink>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 h-14 rounded-2xl border-slate-300 bg-white/50 hover:bg-white text-slate-800 transition-all duration-300 text-lg font-bold cursor-pointer backdrop-blur-md">
              اكتشف المميزات
            </Button>
          </div>
        </div>

        {/* Left Content (Live Counters) */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-200/40 to-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
          <LiveCounters />
        </div>

      </main>
    </div>
  )
}
