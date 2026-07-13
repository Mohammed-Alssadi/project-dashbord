import { useState } from "react";
import { toast } from "sonner";
import { getZidOAuthUrl } from "../services/zidAuthApi";

export const useZidOAuth = () => {
  const [connecting, setConnecting] = useState(false);

  const connectZid = async () => {
    try {
      setConnecting(true);
      const data = await getZidOAuthUrl();
      
      if (data.oauthUrl) {
        toast.loading("جاري الربظ لصفحة زد الرسمية للمصادقة...");
        window.location.href = data.oauthUrl;
      } else {
        toast.error('حدث خطأ أثناء تهيئة الربط مع زد');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('تعذر الاتصال بالخادم');
    } finally {
      setConnecting(false);
    }
  };

  return { connectZid, connecting };
};
