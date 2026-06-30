import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Lock, Mail, Loader2, Layers } from "lucide-react"

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    onSubmit(email, password)
  }

  return (
    <div className="w-full max-w-[420px] bg-transparent font-sans relative">
      <div className="text-center pt-2 pb-4 relative z-10 space-y-2">
        <div className="mx-auto flex items-center justify-center gap-2 mb-2">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="size-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            DashAI
          </span>
        </div>
        <div className="text-2xl font-black text-foreground tracking-tight m-0">
          مرحباً بعودتك
        </div>
        <p className="text-muted-foreground text-xs font-medium">
          سجل دخولك للوصول إلى حسابك
        </p>
      </div>

      <div className="space-y-3 px-2 relative z-10 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full bg-[#5EE2B0] text-primary-foreground hover:bg-[#4bc99c] hover:text-primary-foreground border-none h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all px-2"
          >
            <span className="bg-white text-[#5EE2B0] px-1.5 py-0.5 rounded-sm text-[10px] font-black leading-none">س</span>
            <span className="font-bold text-[13px] whitespace-nowrap">الدخول بسلة</span>
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full bg-[#7861FF] text-white hover:bg-[#6850eb] hover:text-white border-none h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all px-2"
          >
            <span className="bg-white text-[#7861FF] px-1.5 py-0.5 rounded-sm text-[10px] font-black leading-none">ز</span>
            <span className="font-bold text-[13px] whitespace-nowrap">الدخول بزد</span>
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium">
          سجل دخولك مباشرة باستخدام حساب متجرك
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-background px-3 text-muted-foreground font-medium">أو بالبريد الإلكتروني</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-2">
        <div className="space-y-4 relative z-10">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground/80 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="pr-10 pl-4 h-11 rounded-xl border-border/80 focus-visible:ring-primary/20 bg-card/50 text-right shadow-sm text-sm"
                dir="ltr"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-foreground/80 block">كلمة المرور</label>
              <a href="#" className="text-[11px] text-primary hover:underline font-semibold">
                نسيت كلمة المرور؟
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10 pl-4 h-11 rounded-xl border-border/80 focus-visible:ring-primary/20 bg-card/50 text-right shadow-sm text-sm"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input 
              type="checkbox"
              id="remember" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border/80 text-primary focus:ring-primary/20 bg-card/50 size-3.5 cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="text-[11px] font-medium leading-none cursor-pointer text-muted-foreground"
            >
              تذكرني
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-6 pt-5 relative z-10">
          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-11 rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground font-medium mt-1">
            ليس لديك حساب؟{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-bold transition-all"
            >
              إنشاء حساب
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

