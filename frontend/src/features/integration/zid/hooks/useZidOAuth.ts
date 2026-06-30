import { useState } from "react";
import { toast } from "sonner";

// هوك إدارة ربط متجر زد (Zid OAuth Hook)
// يحتوي حالياً على محاكاة لعملية الربط (Preview Mode) دون استدعاء للباك إند
export const useZidOAuth = () => {
  const [connecting, setConnecting] = useState(false);

  const connectZid = async () => {
    setConnecting(true);
    
    // محاكاة تأخير بسيط للربط قبل تفعيل الزر مجدداً
    setTimeout(() => {
      toast.info("تمت محاكاة الاتصال بمتجر زد بنجاح (وضع المعاينة).");
      setConnecting(false);
    }, 1000);
  };

  return { connectZid, connecting };
};
