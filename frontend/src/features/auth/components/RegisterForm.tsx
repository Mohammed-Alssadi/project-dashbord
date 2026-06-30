import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Lock, Mail, Loader2, Layers } from "lucide-react"

interface RegisterFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    
    if (!email || !password || !confirmPassword) return
    
    if (password.length < 6) {
      setLocalError("يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل")
      return
    }
    
    if (password !== confirmPassword) {
      setLocalError("كلمات المرور غير متطابقة")
      return
    }

    onSubmit(email, password)
  }

  const displayError = localError || error

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
          إنشاء حساب جديد
        </div>
        <p className="text-muted-foreground text-xs font-medium">
          ابدأ إدارة متجرك وتجربة التحليلات الذكية في ثوانٍ
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
            <span className="font-bold text-[13px] whitespace-nowrap">التسجيل بسلة</span>
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full bg-[#7861FF] text-white hover:bg-[#6850eb] hover:text-white border-none h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all px-2"
          >
            <span className="bg-white text-[#7861FF] px-1.5 py-0.5 rounded-sm text-[10px] font-black leading-none">ز</span>
            <span className="font-bold text-[13px] whitespace-nowrap">التسجيل بزد</span>
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium">
          سجل مباشرة باستخدام حساب متجرك
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
          {displayError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center leading-relaxed">
              {displayError}
            </div>
          )}

          {/* Email field */}
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

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground/80 block">كلمة المرور (6 أحرف أو أكثر)</label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLocalError(null)
                }}
                required
                disabled={loading}
                className="pr-10 pl-4 h-11 rounded-xl border-border/80 focus-visible:ring-primary/20 bg-card/50 text-right shadow-sm text-sm"
                dir="ltr"
              />
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground/80 block">تأكيد كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setLocalError(null)
                }}
                required
                disabled={loading}
                className="pr-10 pl-4 h-11 rounded-xl border-border/80 focus-visible:ring-primary/20 bg-card/50 text-right shadow-sm text-sm"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-6 pt-5 relative z-10">
          <Button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full h-11 rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span>جاري إنشاء الحساب...</span>
              </>
            ) : (
              "إنشاء الحساب"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground font-medium mt-1">
            لديك حساب بالفعل؟{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-bold transition-all"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
