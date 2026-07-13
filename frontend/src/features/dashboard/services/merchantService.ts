import { apiClient } from '@/services/apiClient';

export type RawMerchantProfile = Record<string, any>;

export const merchantService = {
  /**
   * جلب بروفايل التاجر (المستخدم) ككائن خام من المنصة مباشرة
   */
  async getMerchantProfile(): Promise<RawMerchantProfile> {
    const response = await apiClient.get<{ success: boolean; data: RawMerchantProfile }>('/api/merchant/profile');
    return response.data.data;
  },
};
