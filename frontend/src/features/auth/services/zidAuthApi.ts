import { apiClient } from "@/services/apiClient";

export const getZidOAuthUrl = async (): Promise<{ oauthUrl: string }> => {
  const response = await apiClient.get<{ success: boolean; oauthUrl: string }>("/auth/zid/redirect");
  return response.data;
};
