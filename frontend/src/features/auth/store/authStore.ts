import { create } from 'zustand';
import { authService, type AuthUser } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  initialized: boolean;
  fetchingPromise: Promise<void> | null;

  fetchUser: (force?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isLoggedIn: false,
  initialized: false,
  fetchingPromise: null,

  fetchUser: async (force = false) => {
    const { initialized, fetchingPromise } = get();

    // إذا تم التهيئة مسبقاً وليس جلباً إجبارياً، لا داعي للطلب
    if (initialized && !force) {
      return;
    }

    // إذا كان هناك طلب قيد التنفيذ حالياً، نرجع نفس الـ Promise لعدم التكرار
    if (fetchingPromise) {
      return fetchingPromise;
    }

    const promise = (async () => {
      try {
        const user = await authService.getMe();
        set({
          user,
          isLoggedIn: !!user,
          loading: false,
          initialized: true,
          fetchingPromise: null,
        });
      } catch {
        set({
          user: null,
          isLoggedIn: false,
          loading: false,
          initialized: true,
          fetchingPromise: null,
        });
      }
    })();

    set({ loading: true, fetchingPromise: promise });
    return promise;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isLoggedIn: false,
        loading: false,
        initialized: true,
        fetchingPromise: null,
      });
    }
  },
}));

// الاستماع لحدث auth_change القادم من الـ authService
if (typeof window !== 'undefined') {
  window.addEventListener('auth_change', () => {
    // إجبار المتجر على إعادة جلب البيانات لتحديث حالته تفاعلياً
    useAuthStore.getState().fetchUser(true);
  });
}
