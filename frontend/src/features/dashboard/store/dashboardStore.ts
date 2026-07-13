import { create } from 'zustand';
import { dashboardService, type DashboardStats } from '../services/dashboardService';
import { useAuthStore } from '@/features/auth/store/authStore';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    // Wait for user to be fetched if it's currently fetching (due to parallel loaders)
    const authState = useAuthStore.getState();
    if (authState.fetchingPromise) {
      await authState.fetchingPromise;
    }

    const { user } = useAuthStore.getState();
    const platform = user?.platform;
    if (!platform) return;

    set({ isLoading: true, error: null });
    
    try {
      const stats = await dashboardService.fetchStats(platform as 'zid' | 'salla');
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'فشل جلب إحصائيات لوحة التحكم',
        isLoading: false 
      });
    }
  }
}));
