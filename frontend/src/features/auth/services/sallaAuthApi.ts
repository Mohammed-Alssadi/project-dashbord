import { apiClient } from "@/services/apiClient";

/**
 * دالة طلب رابط تفويض OAuth سلة من خادم الباك إند
 * @returns {Promise<{ oauthUrl: string }>} - الرابط المولد لتوجيه العميل إليه
 */
export const getSallaOAuthUrl = async (): Promise<{ oauthUrl: string }> => {
  const response = await apiClient.get<{ success: boolean; oauthUrl: string }>("/auth/salla/redirect");
  return response.data;
};
