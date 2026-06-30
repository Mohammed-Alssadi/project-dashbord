// Mock Supabase client to decouple frontend from Supabase cloud
// All auth and database calls are mocked here for local UI testing

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => {
      const mockSession = localStorage.getItem("mock_session");
      if (mockSession) {
        return { data: { user: { email: "merchant@demo.com", id: "mock-user-id" } }, error: null };
      }
      return { data: { user: null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Trigger callback with initial mock state
      
      // Simulate sign in/out when localStorage changes
      const handleStorageChange = () => {
        const currentSession = localStorage.getItem("mock_session");
        const currentUser = currentSession ? { email: "merchant@demo.com", id: "mock-user-id" } : null;
        callback(currentSession ? "SIGNED_IN" : "SIGNED_OUT", currentSession ? { user: currentUser } : null);
      };
      
      window.addEventListener("storage", handleStorageChange);
      
      // Return unsubscribe function
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              window.removeEventListener("storage", handleStorageChange);
            }
          }
        }
      };
    },
    signUp: async (credentials: any) => {
      console.log("Mock SignUp:", credentials);
      return { data: { user: { email: credentials.email, id: "mock-user-id" } }, error: null };
    },
    signInWithPassword: async (credentials: any) => {
      console.log("Mock SignIn:", credentials);
      localStorage.setItem("mock_session", "true");
      // Trigger a storage event to update other tabs/listeners
      window.dispatchEvent(new Event("storage"));
      return { data: { user: { email: credentials.email, id: "mock-user-id" } }, error: null };
    },
    signOut: async () => {
      console.log("Mock SignOut");
      localStorage.removeItem("mock_session");
      window.dispatchEvent(new Event("storage"));
      return { error: null };
    }
  },
  from: (table: string) => {
    console.log(`Mock DB Query on table: ${table}`);
    return {
      select: () => ({
        data: [],
        error: null
      }),
      delete: () => ({
        eq: () => ({
          error: null
        })
      })
    };
  }
};
