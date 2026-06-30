// zidIntegrationApi.ts
// ملف خدمات الربط مع منصة زد (Zid Integration API Service)
// يتم كتابة دوال الاستدعاء الحقيقي هنا لاحقاً عند تفعيل عملية الربط الفعلي

export const getZidOAuthUrl = async (): Promise<{ oauthUrl: string }> => {
  // سيتم استدعاء الباك إند لجلب رابط OAuth الخاص بزد لاحقاً
  // مثال: return (await apiClient.get("/auth/connect/zid")).data;
  return { oauthUrl: "" };
};
