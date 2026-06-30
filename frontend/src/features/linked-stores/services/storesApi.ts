import { apiClient } from "../../../services/apiClient";

export interface LinkedStoreData {
  id: string;
  userId: number;
  platform: "salla" | "zid";
  platformStoreId: string;
  createdAt: string;
  updatedAt: string;
}

// دالة جلب المتاجر المتصلة
export const fetchLinkedStores = async () => {
  const response = await apiClient.get<{ success: boolean; data: LinkedStoreData[] }>("/stores");
  return response.data;
};
console.log(fetchLinkedStores())

// دالة إلغاء ربط متجر متصل
export const removeLinkedStore = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/stores/${id}`);
  return response.data;
};
