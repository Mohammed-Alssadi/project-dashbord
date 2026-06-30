import axios from "axios"

// API base URL targeting Express backend
const baseApiUrl = import.meta.env.VITE_API_BASE_URL || ""

export const axiosClient = axios.create({
  baseURL: baseApiUrl,
})

// Attach Authorization header if token exists in localStorage
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.warn("Error reading authorization token from localStorage:", error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
