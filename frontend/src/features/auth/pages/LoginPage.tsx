import { LoginForm } from "../components/LoginForm"
import { Layers } from "lucide-react"
import { Link } from "react-router-dom"

export function LoginPage() {
  return (
    <div className="h-screen w-full flex flex-col md:flex-row-reverse bg-background font-sans selection:bg-accent selection:text-accent-foreground overflow-hidden">
      {/* Branding / Image Side */}
      <div className="hidden md:flex md:w-[45%] lg:w-1/2 bg-slate-50 relative overflow-hidden flex-col items-center justify-center p-8 text-slate-900 border-l border-slate-200/50">
        {/* Premium Light Blend Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-slate-50 to-purple-50 opacity-100 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_100%_120%,rgba(168,85,247,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-400/20 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          {/* Premium Logo */}
          <div className="relative size-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-10 overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-[2px] rounded-3xl" />
            <Layers className="size-12 text-white relative z-10" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight text-slate-900 drop-shadow-sm">
            لوحة تحكم متجرك الاحترافية
          </h2>
          <p className="text-lg md:text-xl text-slate-600 font-medium mb-12 max-w-md leading-relaxed">
            اندمج مباشرة مع سلة أو زد، وأدِر مبيعاتك وطلباتك بكل سهولة عبر منصة واحدة متكاملة.
          </p>

          <div className="flex items-center justify-center gap-8 md:gap-12 w-full mt-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-emerald-400 drop-shadow-sm">+100</p>
              <p className="text-sm text-slate-500 font-bold mt-1">ميزة متكاملة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900 drop-shadow-sm">100%</p>
              <p className="text-sm text-slate-500 font-bold mt-1">تحكم معزول وآمن</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 drop-shadow-sm">0</p>
              <p className="text-sm text-slate-500 font-bold mt-1">تعقيد تقني</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col relative bg-white overflow-y-auto z-0">
        {/* Subtle but Visible Background Glows for Form Side */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-[150px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-400/10 blur-[150px] pointer-events-none -z-10" />
        {/* Back to Home Link (Mobile) */}
        <div className="md:hidden absolute top-6 right-6 flex items-center gap-2 z-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative size-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-purple-600 flex items-center justify-center shadow-md overflow-hidden">
              <div className="absolute inset-0 bg-white/20 blur-[1px] rounded-lg" />
              <Layers className="size-4 text-white relative z-10" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              لينك
            </span>
          </Link>
        </div>

        {/* Content Wrapper to center the form but allow footer at the bottom */}
        <div className="flex flex-col min-h-full p-4 md:p-8">
          <div className="flex-1 flex justify-center items-center z-10 mt-16 md:mt-0 py-8">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="mt-auto pt-6 w-full px-4 flex justify-center items-center text-xs text-muted-foreground font-medium max-w-[420px] mx-auto z-10">
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">الشروط</a>
              <a href="#" className="hover:text-foreground transition-colors">الخصوصية</a>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
