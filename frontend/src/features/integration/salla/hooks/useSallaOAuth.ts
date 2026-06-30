import { useState } from "react";
import { getSallaOAuthUrl } from "../services/sallaIntegrationApi";
import { toast } from "sonner";

// useSallaOAuth.ts
// هوك إدارة ربط متجر سلة (Salla OAuth Connection Hook)
// يتحكم برحلة الربط وتوجيه العميل إلى منصة سلة الرسمية لمنح الصلاحيات

export const useSallaOAuth = () => {
  const [connecting, setConnecting] = useState(false);

  const connectSalla = async () => {
    try {
      setConnecting(true);
      
      // 1. استدعاء الـ API لجلب رابط المصادقة الحقيقي والمحمي من الباك إند
      const data = await getSallaOAuthUrl();
      
      if (data.oauthUrl) {
        toast.loading("جاري تحويلك لصفحة سلة الرسمية للمصادقة...");
        
        // 2. تحويل متصفح المستخدم مباشرة لصفحة تسجيل الدخول ومنح التفويض في سلة
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
