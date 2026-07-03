import { useState } from "react";
import { getSallaOAuthUrl } from "../services/sallaAuthApi";
import { toast } from "sonner";

export const useSallaOAuth = () => {
  const [connecting, setConnecting] = useState(false);

  const connectSalla = async () => {
    try {
      setConnecting(true);
      const data = await getSallaOAuthUrl();
      
      if (data.oauthUrl) {
        toast.loading("جاري تحويلك لصفحة سلة الرسمية للمصادقة...");
        window.location.href = data.oauthUrl;
      } else {
        toast.error("فشل الحصول على رابط الربط الآمن من خادم الباك إند.");
      }
    } catch (err) {
      console.error("Salla connection error:", err);
      toast.error("فشل الاتصال بالباك إند. تأكد من تشغيل السيرفر أولاً.");
    } finally {
      setConnecting(false);
    }
  };

  return { connectSalla, connecting };
};
