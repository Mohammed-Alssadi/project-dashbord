import { Button } from "@/components/ui/button"
import { Store, ArrowLeft, Loader2 } from "lucide-react"
import { useSallaOAuth } from "../hooks/useSallaOAuth"

export function SallaConnectButton() {
  const { connectSalla, connecting } = useSallaOAuth()

  return (
    <Button
      onClick={connectSalla}
      disabled={connecting}
      className="w-full h-12 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-between px-4 transition-colors duration-200 cursor-pointer border-0 font-sans"
    >
      <div className="flex items-center gap-2.5">
        {connecting ? (
          <Loader2 className="size-4.5 animate-spin shrink-0" />
        ) : (
          <Store className="size-4.5 shrink-0" />
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="font-bold text-sm">
            {connecting ? "جاري الاتصال..." : "ربط متجر سلة"}
          </span>
          {/* <span className="text-white/70 text-[10px] mt-1">
            وضع المعاينة
          </span> */}
        </div>
      </div>
      <ArrowLeft className="size-4 text-white/80" />
    </Button>
  )
}
