import { create } from 'zustand';
import { storeProfileApi } from '../services/storeProfileApi';
import type { StoreProfile } from '../types/storeProfile.types';

interface StoreProfileState {
  profile: StoreProfile | null;
  loading: boolean;
  isRefreshing: boolean; // تحديث يدوي مع وجود بيانات سابقة
  error: string | null;

  fetchProfile: (force?: boolean) => Promise<void>;
}

export const useStoreProfileStore = create<StoreProfileState>((set, get) => ({
  profile: null,
  loading: true,
  isRefreshing: false,
  error: null,

  fetchProfile: async (force = false) => {
    // إذا كانت البيانات محملة مسبقاً ولسنا نقوم بإعادة تحميل إجباري، لا نرسل طلب شبكة
    if (get().profile && !force && !get().loading) {
      return;
    }

    const hasExistingData = !!get().profile;

    try {
      if (hasExistingData && force) {
        // تحديث يدوي مع وجود بيانات — نعرض سكلتون التحديث
        set({ isRefreshing: true, error: null });
      } else {
        // تحميل أولي بدون بيانات
        set({ loading: true, error: null });
      }

      const response = await storeProfileApi.getStoreProfile(force);
      if (response.success) {
        set({ profile: response.data, loading: false, isRefreshing: false });
      } else {
        set({ error: 'فشل في جلب بيانات المتجر', loading: false, isRefreshing: false });
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم';
      set({ error: errMsg, loading: false, isRefreshing: false });
    }
  }
}));
