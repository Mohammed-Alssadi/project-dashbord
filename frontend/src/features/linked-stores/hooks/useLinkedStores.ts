import { useState, useEffect } from "react";
import { fetchLinkedStores, removeLinkedStore, type LinkedStoreData } from "../services/storesApi";
import { toast } from "sonner";

export const useLinkedStores = () => {
  const [stores, setStores] = useState<LinkedStoreData[]>([]);
  const [loading, setLoading] = useState(true);

  // دالة جلب المتاجر
  const getStores = async () => {
    try {
      setLoading(true);
      const res = await fetchLinkedStores();
      if (res.success) {
        setStores(res.data);
        console.log(res.data)
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
      toast.error("فشل جلب المتاجر المتصلة من السيرفر.");
    } finally {
      setLoading(false);
    }
  };

  // دالة إلغاء الربط
  const disconnectStore = async (id: string) => {
    try {
      const res = await removeLinkedStore(id);
      if (res.success) {
        setStores((prev) => prev.filter((store) => store.id !== id));
        toast.success("تم إلغاء ربط المتجر بنجاح.");
      }
    } catch (err) {
      console.error("Error disconnecting store:", err);
      toast.error("فشل إلغاء ربط المتجر. يرجى المحاولة مرة أخرى.");
    }
  };

  useEffect(() => {
    getStores();
  }, []);

  return {
    stores,
    loading,
    disconnectStore,
    refreshStores: getStores,
  };
};
