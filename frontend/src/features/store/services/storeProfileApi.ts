import { apiClient } from '@/services/apiClient';
import type { StoreProfileResponse } from '../types/storeProfile.types';

export const storeProfileApi = {
  /**
   * جلب بيانات المتجر الحية عبر الـ BFF (Backend For Frontend)
   */
  getStoreProfile: async (force?: boolean): Promise<StoreProfileResponse> => {
    const query = force ? '?force=true' : '';
    const response = await apiClient.get<StoreProfileResponse>(`/api/store/store-profile${query}`);
    return response.data;
  }
};
