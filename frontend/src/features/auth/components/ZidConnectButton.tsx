import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowLeft, Loader2 } from "lucide-react"
import { useZidOAuth } from "../hooks/useZidOAuth"

export function ZidConnectButton() {
  const { connectZid, connecting } = useZidOAuth()

  return (
    <Button
      onClick={connectZid}
      disabled={connecting}
      className="w-full h-14 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-between px-5 transition-all duration-300 cursor-pointer border-0 shadow-sm hover:shadow-purple-600/20 font-sans"
    >
      <div className="flex items-center gap-3">
        {connecting ? (
          <Loader2 className="size-6 animate-spin shrink-0" />
        ) : (
          <ShoppingBag className="size-6 shrink-0" />
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="font-bold text-base tracking-wide">
            {connecting ? "جاري الاتصال..." : "ربط متجر زد"}
          </span>
        </div>
      </div>
      <ArrowLeft className="size-4 text-white/80" />
    </Button>
  )
}
