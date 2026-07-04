import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const plans = [
    {
      id: "free",
      name: "الأساسية",
      price: "مجاناً",
      period: "دائماً",
      description: "مثالية للمتاجر الناشئة لتجربة الإدارة المتكاملة",
      features: [
        "إدارة ما يصل إلى 100 طلب شهرياً",
        "مزامنة المنتجات الأساسية",
        "تقارير مبيعات مبسطة",
        "دعم فني عبر البريد الإلكتروني"
      ],
      buttonText: "ابدأ مجاناً",
      popular: false,
      color: "border-border/60",
      buttonVariant: "outline"
    },
    {
      id: "pro",
      name: "الاحترافية",
      price: "99",
      currency: "ر.س",
      period: "شهرياً",
      description: "للمتاجر المتنامية التي تحتاج ميزات متقدمة وسرعة أعلى",
      features: [
        "إدارة طلبات غير محدودة",
        "مزامنة فورية (Real-time)",
        "تقارير مبيعات وتحليلات متقدمة",
        "تصدير البيانات",
        "دعم فني ذو أولوية"
      ],
      buttonText: "اشترك الآن",
      popular: true,
      color: "border-primary shadow-lg shadow-primary/10",
      buttonVariant: "default"
    },
    {
      id: "enterprise",
      name: "المتقدمة",
      price: "990",
      currency: "ر.س",
      period: "سنوياً",
      description: "وفر 16% مع الاشتراك السنوي للمتاجر الكبيرة",
      features: [
        "كافة ميزات الباقة الاحترافية",
        "مدير حساب مخصص",
        "تقارير مخصصة",
        "تكامل مع أنظمة المحاسبة",
        "دعم فني 24/7"
      ],
      buttonText: "اشترك سنوياً",
      popular: false,
      color: "border-purple-200",
      buttonVariant: "outline"
    }
  ];

  return (
    <section className="relative w-full bg-slate-50/50 py-24 border-t border-border/40 overflow-hidden z-0">
      {/* Subtle but Visible Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-emerald-500 to-purple-600">
            خطط أسعار تناسب حجم متجرك
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative flex flex-col bg-white p-8 rounded-3xl border ${plan.color} transition-all duration-300 hover:shadow-xl ${plan.popular ? 'md:-translate-y-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold shadow-sm">
                  الأكثر طلباً
                </div>
              )}
              <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mt-2 font-medium">{plan.description}</p>
              
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-5xl font-black">{plan.price}</span>
                {plan.currency && <span className="text-lg font-bold text-muted-foreground">{plan.currency}</span>}
                <span className="text-sm font-medium text-muted-foreground mr-1">/ {plan.period}</span>
              </div>

              <Button 
                variant={plan.buttonVariant as any} 
                className={`w-full h-12 rounded-xl text-base font-bold mb-8 ${plan.popular ? 'shadow-md shadow-primary/20' : ''}`}
              >
                {plan.buttonText}
              </Button>

              <div className="space-y-4 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
