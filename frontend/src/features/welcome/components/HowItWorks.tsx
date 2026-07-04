import { Link, CloudSync, LayoutDashboard } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "اربط متجرك بضغطة",
      description: "سجل الدخول باستخدام حسابك في سلة أو زد، وسنقوم بتوصيل متجرك بأمان عبر الـ API الرسمي للمنصة.",
      icon: Link,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-200"
    },
    {
      id: 2,
      title: "مزامنة البيانات فورياً",
      description: "سيتم سحب جميع منتجاتك، طلباتك، وعملائك إلى منصة لينك في ثوانٍ معدودة لتكون جاهزة للإدارة.",
      icon: CloudSync,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
      border: "border-purple-200"
    },
    {
      id: 3,
      title: "ابدأ الإدارة والنمو",
      description: "تحكم بكل تفاصيل متجرك من شاشة واحدة، تابع تحليلات المبيعات ونفذ طلباتك بمرونة وسهولة غير مسبوقة.",
      icon: LayoutDashboard,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-200"
    }
  ];

  return (
    <section className="relative w-full bg-slate-50/30 py-24 border-t border-border/40 overflow-hidden z-0">
      {/* Subtle but Visible Background Glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-emerald-500 to-purple-600">
            كيف تعمل منصة لينك؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-emerald-100 via-purple-100 to-blue-100 -z-10" />

          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center p-6 bg-background rounded-3xl border border-border/40 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className={`size-24 rounded-3xl ${step.bg} ${step.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                <step.icon className={`size-10 ${step.color}`} />
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm mb-4 shadow-md">
                {step.id}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
