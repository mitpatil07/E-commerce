import axios from "axios";

// ✅ Use correct API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.whatyouwear.store/api";
// const API_BASE_URL = 'https://13.127.0.77/api';

// ✅ Create axios instance
const API = axios.create({
  baseURL: API_BASE_URL, // ✅ clean base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ include cookies if using JWT/CSRF
});


// Request interceptor to add JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        console.log('🔄 Refreshing access token...');

        // ✅ Use same base URL for token refresh
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/accounts/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        console.log('✅ Token refreshed successfully');

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return API(originalRequest);

      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
