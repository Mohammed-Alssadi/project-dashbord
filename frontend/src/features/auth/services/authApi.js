// API client calls for authentication logic (Salla/Zid SSO and JWT handling)
// To connect to Backend /api/auth endpoints later

export const authApi = {
  login: async (email, password) => {
    console.log("authApi.login", email);
    return { token: "mock-jwt-token" };
  },
  register: async (email, password) => {
    console.log("authApi.register", email);
    return { success: true };
  }
};
