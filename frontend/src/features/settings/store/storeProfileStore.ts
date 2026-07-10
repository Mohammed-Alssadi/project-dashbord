import { create } from 'zustand';
import { storeProfileApi } from '../services/storeProfileApi';
import type { StoreProfile } from '../types/storeProfile.types';
import { toast } from 'sonner';

interface StoreProfileState {
  profile: StoreProfile | null;
  loading: boolean;
  error: string | null;

  fetchProfile: (force?: boolean) => Promise<void>;
}

export const useStoreProfileStore = create<StoreProfileState>((set, get) => ({
  profile: null,
  loading: true,
  error: null,

  fetchProfile: async (force = false) => {
    // إذا كانت البيانات محملة مسبقاً ولسنا نقوم بإعادة تحميل إجباري، لا نرسل طلب شبكة
    if (get().profile && !force && !get().loading) {
      return;
    }

    try {
      set({ loading: true, error: null });
      const response = await storeProfileApi.getStoreProfile(force);
      if (response.success) {
        set({ profile: response.data, loading: false });
      } else {
        set({ error: 'فشل في جلب بيانات المتجر', loading: false });
        toast.error('فشل في جلب بيانات المتجر');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم';
      set({ error: errMsg, loading: false });
      toast.error(errMsg);
    }
  }
}));
