import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, ShieldCheck, Zap, BarChart3, Layers, User, LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthState } from "@/features/auth/hooks/useAuthState"
import { authService } from "@/features/auth/services/authService"

export function WelcomeHero() {
  const { isLoggedIn } = useAuthState()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logout()
    navigate("/")
  }

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-accent selection:text-accent-foreground">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />
      
      {/* Ambient Light Blobs */}
      <div className="absolute top-[-10%] right-[10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-primary/10 blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-accent/30 blur-[80px] md:blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-border/60 backdrop-blur-md bg-background/40">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
            <Layers className="size-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            DashAI
          </span>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* أيقونة الانتقال للداشبورد */}
              <Link
                to="/dashboard"
                title="لوحة التحكم"
                className="size-9 rounded-xl flex items-center justify-center border border-border/70 bg-accent/40 hover:bg-accent hover:border-primary/30 text-foreground transition-all duration-200"
              >
                <User className="size-4" />
              </Link>

              {/* أيقونة تسجيل الخروج */}
              <button
                id="logout-icon-btn"
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="size-9 rounded-xl flex items-center justify-center border border-border/70 bg-accent/40 hover:bg-red-500/10 hover:border-red-400/40 text-muted-foreground hover:text-red-500 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            /* زر تسجيل الدخول للزوار */
            <Button
              id="nav-login-btn"
              variant="default"
              asChild
              className="shadow-md shadow-primary/10 text-sm cursor-pointer rounded-xl px-5 font-medium"
            >
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </header>


      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
        
        {/* Top Glow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent border border-border text-accent-foreground text-xs md:text-sm font-semibold mb-8 shadow-sm">
          <Sparkles className="size-4 text-primary animate-pulse" />
          <span>نظام ممتد وذكي يندمج مباشرة مع متجرك على سلة أو زد</span>
        </div>

        {/* Hero Section Title & Description */}
        <div className="max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight md:leading-normal text-foreground">
            أدِر وطوّر متجرك الإلكتروني بأسلوب{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-650 to-pink-600 bg-clip-text text-transparent font-black">
              أكثر ذكاءً وقوة
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            دون الحاجة لبناء متجر جديد، سجل دخولك عبر منصتك الحالية لتتحكم بمنتجاتك، تحلل مبيعاتك وتدير طلباتك من لوحة تحكم مجهزة بأحدث أدوات الذكاء الاصطناعي.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center">
          <Button size="lg" asChild className="w-full sm:w-auto px-8 py-6 rounded-2xl transition-all duration-300 shadow-xl shadow-primary/15 hover:shadow-primary/25 hover:-translate-y-0.5 text-base font-bold cursor-pointer border-0 group">
            <Link to="/login" className="flex items-center justify-center gap-2">
              <span>ابدأ التجربة الآن</span>
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-2xl border-border hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-all duration-300 text-base font-bold cursor-pointer">
            تعرف على المزيد
          </Button>
        </div>

        {/* Interactive Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-border/80 bg-card/60 p-8 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 backdrop-blur-sm">
            <div className="size-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">ربط مباشر وسلس</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              اتصال آمن وسريع عبر واجهات البرمجية (APIs) مع منصة زد ومختلف المنصات لمزامنة المنتجات والطلبات فورياً.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-border/80 bg-card/60 p-8 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 backdrop-blur-sm">
            <div className="size-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">ذكاء اصطناعي مخصص</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              أدوات ذكية لتوليد ووصف المنتجات، اقتراح الأسعار المثالية، وتحسين تجربة الشراء بناءً على سلوك المستهلك.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border border-border/80 bg-card/60 p-8 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 backdrop-blur-sm">
            <div className="size-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">لوحة تحليلات موحدة</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              شاشة موحدة لمراقبة المبيعات وتتبع نمو الأرباح مع تقارير متقدمة تدعم اتخاذ القرارات التجارية المصيرية.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </div>

        </section>

        {/* Footer info */}
        <footer className="mt-24 text-center text-xs text-muted-foreground border-t border-border/60 w-full pt-8">
          <p>© 2026 جميع الحقوق محفوظة لمشروع تطوير المتاجر الإلكترونية الذكية.</p>
        </footer>

      </main>
    </div>
  )
}
