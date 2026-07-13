import { create } from 'zustand';
import { merchantService, type RawMerchantProfile } from '../services/merchantService';

interface MerchantProfileState {
  profile: RawMerchantProfile | null;
  loading: boolean;
  error: string | null;
  fetchingPromise: Promise<void> | null;

  fetchProfile: (force?: boolean) => Promise<void>;
}

export const useMerchantProfileStore = create<MerchantProfileState>((set, get) => ({
  profile: null,
  loading: true,
  error: null,
  fetchingPromise: null,

  fetchProfile: async (force = false) => {
    const { profile, fetchingPromise } = get();

    // إذا كان البروفايل موجوداً ولم نطلب جلباً إجبارياً
    if (profile && !force) {
      set({ loading: false });
      return;
    }

    if (fetchingPromise) {
      return fetchingPromise;
    }

    const promise = (async () => {
      try {
        const data = await merchantService.getMerchantProfile();
        set({ profile: data, error: null, fetchingPromise: null, loading: false });
      } catch (err: any) {
        set({
          error: err.message || 'فشل في جلب بيانات التاجر',
          fetchingPromise: null,
          loading: false,
        });
      }
    })();

    set({ loading: true, fetchingPromise: promise, error: null });
    return promise;
  },
}));
