import { LoginForm } from "../components/LoginForm"
import { useNavigate } from "react-router-dom"
import { Layers } from "lucide-react"
import { Link } from "react-router-dom"

export function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = async () => {
    navigate("/dashboard")
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row-reverse bg-background font-sans selection:bg-accent selection:text-accent-foreground overflow-hidden">
      {/* Branding / Image Side */}
      <div className="hidden md:flex md:w-[45%] lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-8 text-primary-foreground">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10 pointer-events-none mix-blend-overlay" />
        <div className="absolute top-[-10%] right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-white/10 blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[5%] w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full bg-indigo-500/20 blur-[80px] md:blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="size-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-black/10 mb-10 border border-white/20">
            <Layers className="size-12 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight text-white">
            جداول مقاسات ذكية
          </h2>
          <p className="text-lg md:text-xl text-white/80 font-medium mb-12 max-w-md leading-relaxed">
            قلل المرتجعات وزد رضا عملائك مع جداول مقاسات احترافية متكاملة مع سلة وزد.
          </p>

          {/* Stats or trust badges (Optional based on the reference image) */}
          <div className="flex items-center justify-center gap-8 md:gap-12 w-full mt-8 pt-8 border-t border-white/10">
            <div className="text-center">
              <p className="text-3xl font-black text-white">+10K</p>
              <p className="text-sm text-white/70 font-medium mt-1">جدول مقاسات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">40%</p>
              <p className="text-sm text-white/70 font-medium mt-1">تقليل المرتجعات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">+500</p>
              <p className="text-sm text-white/70 font-medium mt-1">متجر نشط</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col relative bg-background overflow-y-auto">
        {/* Back to Home Link (Mobile) */}
        <div className="md:hidden absolute top-6 right-6 flex items-center gap-2 z-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Layers className="size-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              DashAI
            </span>
          </Link>
        </div>

        {/* Content Wrapper to center the form but allow footer at the bottom */}
        <div className="flex flex-col min-h-full p-4 md:p-8">
          <div className="flex-1 flex justify-center items-center z-10 mt-16 md:mt-0 py-8">
            <LoginForm onSubmit={handleLogin} loading={false} error={null} />
          </div>

          {/* Footer Links */}
          <div className="mt-auto pt-6 w-full px-4 flex justify-between items-center text-xs text-muted-foreground font-medium max-w-[420px] mx-auto z-10">
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">الشروط</a>
              <a href="#" className="hover:text-foreground transition-colors">الخصوصية</a>
            </div>
            <p>© 2026 DashAI</p>
          </div>
        </div>
      </div>
    </div>
  )
}
