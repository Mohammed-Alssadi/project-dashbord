import { Button } from "@/components/ui/button"
import { Store, ArrowLeft, Loader2 } from "lucide-react"
import { useSallaOAuth } from "../hooks/useSallaOAuth"

export function SallaConnectButton() {
  const { connectSalla, connecting } = useSallaOAuth()

  return (
    <Button
      onClick={connectSalla}
      disabled={connecting}
      className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-between px-5 transition-all duration-300 cursor-pointer border-0 shadow-sm hover:shadow-emerald-600/20 font-sans"
    >
      <div className="flex items-center gap-3">
        {connecting ? (
          <Loader2 className="size-6 animate-spin shrink-0" />
        ) : (
          <Store className="size-6 shrink-0" />
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="font-bold text-base tracking-wide">
            {connecting ? "جاري الاتصال..." : "ربط متجر سلة"}
          </span>
        </div>
      </div>
      <ArrowLeft className="size-4 text-white/80" />
    </Button>
  )
}
