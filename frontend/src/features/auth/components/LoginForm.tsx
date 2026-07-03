import { SallaConnectButton } from "@/features/integration/salla/components/SallaConnectButton"
import { ZidConnectButton } from "@/features/integration/zid/components/ZidConnectButton"
import { Layers } from "lucide-react"

export function LoginForm() {
  return (
    <div className="w-full max-w-[420px] bg-transparent font-sans relative">
      <div className="text-center pt-2 pb-8 relative z-10 space-y-2">
        <div className="mx-auto flex items-center justify-center gap-2 mb-2">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="size-5 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            DashAI
          </span>
        </div>
        <div className="text-2xl font-black text-foreground tracking-tight m-0">
          مرحباً بك في المنصة
        </div>
        <p className="text-muted-foreground text-xs font-medium">
          اختر منصتك لتسجيل الدخول بضغطة زر واحدة
        </p>
      </div>

      <div className="space-y-4 px-2 relative z-10 mb-6">
        <div className="flex flex-col gap-4">
          <SallaConnectButton />
          <ZidConnectButton />
        </div>
        
        <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium pt-4">
          سيتم إنشاء حسابك تلقائياً في حال لم تكن مسجلاً مسبقاً.
        </p>
      </div>
    </div>
  )
}

