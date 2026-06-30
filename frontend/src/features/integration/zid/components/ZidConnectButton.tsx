import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowLeft, Loader2 } from "lucide-react"
import { useZidOAuth } from "../hooks/useZidOAuth"

export function ZidConnectButton() {
  const { connectZid, connecting } = useZidOAuth()

  return (
    <div className="space-y-2">
      <Button
        onClick={connectZid}
        disabled={connecting}
        className="w-full h-12 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-between px-4 transition-colors duration-200 cursor-pointer border-0 font-sans"
      >
        <div className="flex items-center gap-2.5">
          {connecting ? (
            <Loader2 className="size-4.5 animate-spin shrink-0" />
          ) : (
            <ShoppingBag className="size-4.5 shrink-0" />
          )}
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold text-sm">
              {connecting ? "جاري الاتصال..." : "ربط متجر زد"}
            </span>
            <span className="text-white/70 text-[10px] mt-1">
              وضع المعاينة
            </span>
          </div>
        </div>
        <ArrowLeft className="size-4 text-white/80" />
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        ملاحظة: لربط متجر <span className="font-bold">ثاني</span>، يرجى تسجيل الخروج من منصة زد أولاً في متصفحك.
      </p>
    </div>
  )
}
