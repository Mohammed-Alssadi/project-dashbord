import { SallaConnectButton } from "@/features/auth/components/SallaConnectButton"
import { ZidConnectButton } from "@/features/auth/components/ZidConnectButton"
import { Layers } from "lucide-react"

export function LoginForm() {
  return (
    <div className="w-full max-w-[420px] bg-transparent font-sans relative">
      <div className="text-center pt-2 pb-8 relative z-10 space-y-2">
        <div className="mx-auto flex items-center justify-center gap-2 mb-2">
          <div className="relative size-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-[1px] rounded-xl" />
            <Layers className="size-5 text-white relative z-10" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 drop-shadow-sm">
            لينك
          </span>
        </div>
        <div className="text-3xl font-black text-foreground tracking-tight m-0">
          مرحباً بك في المنصة
        </div>
        <p className="text-muted-foreground text-sm font-medium mt-4 pt-4">
          اختر منصتك لتسجيل الدخول بضغطة زر واحدة
        </p>
      </div>

      <div className="space-y-5 px-2 relative z-10 mb-6 mt-4">
        <div className="flex flex-col gap-4">
          <SallaConnectButton />
          <ZidConnectButton />
        </div>
      </div>
    </div>
  )
}

