import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/services/apiClient";

export const useZidOAuth = () => {
  const [connecting, setConnecting] = useState(false);

  const connectZid = async () => {
    try {
      setConnecting(true);
      const res = await apiClient.get('/auth/zid/redirect');
      
      if (res.data.success && res.data.oauthUrl) {
        window.location.href = res.data.oauthUrl;
      } else {
        toast.error(res.data.message || 'حدث خطأ أثناء تهيئة الربط مع زد');
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
