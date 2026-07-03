import { SallaConnectButton } from "@/features/auth/components/SallaConnectButton"
import { ZidConnectButton } from "@/features/auth/components/ZidConnectButton"
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
        <div className="text-3xl font-black text-foreground tracking-tight m-0">
          مرحباً بك في المنصة
        </div>
        <p className="text-muted-foreground text-sm font-medium mt-1">
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

