// Mock Auth Service for Merchant SSO / Login flow

export const authService = {
  // إنشاء حساب جديد لتاجر (Mock)
  registerMerchant: async (email: string, _password: string) => {
    console.log("Mock Register:", email);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return { email, id: "mock-user-id" };
  },

  // تسجيل دخول تاجر (Mock)
  loginMerchant: async (email: string, _password: string) => {
    console.log("Mock Login:", email);
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem("mock_session", "true");
    window.dispatchEvent(new Event("storage"));
    return { email, id: "mock-user-id" };
  },

  // تسجيل خروج التاجر (Mock)
  logoutMerchant: async () => {
    console.log("Mock Logout");
    localStorage.removeItem("mock_session");
    window.dispatchEvent(new Event("storage"));
  },

  // جلب بيانات المستخدم الحالي إن وجدت (Mock)
  getCurrentUser: async () => {
    const session = localStorage.getItem("mock_session");
    if (!session) return null;
    return { email: "merchant@demo.com", id: "mock-user-id" };
  }
};
