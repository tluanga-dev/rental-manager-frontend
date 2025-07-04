import axios, { AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

// API Response wrapper
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add correlation ID for request tracking
    config.headers['X-Request-ID'] = crypto.randomUUID();
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Transform response to match our API wrapper format
    if (response.data && typeof response.data === 'object') {
      if (!response.data.hasOwnProperty('success')) {
        return {
          ...response,
          data: {
            success: true,
            data: response.data,
          } as ApiResponse
        };
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data;
          useAuthStore.getState().refreshAuth(access_token);
          
          processQueue(null, access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Handle other error responses
    if (error.response?.status === 403) {
      // Handle forbidden access
      console.error('Access forbidden - insufficient permissions');
    }

    if (error.response?.status && error.response.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }

    // Transform error response to match our API format
    // FastAPI uses 'detail' for validation errors, while some APIs use 'message'
    const errorMessage = error.response?.data && typeof error.response.data === 'object'
      ? (error.response.data as any).detail || (error.response.data as any).message || (error as any).message || 'An error occurred'
      : (error as any).message || 'An error occurred';
    
    const errorErrors = error.response?.data && typeof error.response.data === 'object' && 'errors' in error.response.data
      ? (error.response.data as any).errors
      : undefined;

    const errorData: ApiResponse = {
      success: false,
      data: null,
      message: errorMessage,
      errors: errorErrors
    };

    // Preserve original error response while also providing transformed version
    const preservedError = {
      ...error,
      response: {
        ...error.response,
        data: {
          ...error.response?.data, // Preserve original data (including detail field)
          ...errorData // Add our transformed data
        }
      }
    };

    return Promise.reject(preservedError);
  }
);

// API helper functions
export const apiClient = {
  get: <T = any>(url: string, config = {}) => 
    api.get<ApiResponse<T>>(url, config),
    
  post: <T = any>(url: string, data = {}, config = {}) => 
    api.post<ApiResponse<T>>(url, data, config),
    
  put: <T = any>(url: string, data = {}, config = {}) => 
    api.put<ApiResponse<T>>(url, data, config),
    
  patch: <T = any>(url: string, data = {}, config = {}) => 
    api.patch<ApiResponse<T>>(url, data, config),
    
  delete: <T = any>(url: string, config = {}) => 
    api.delete<ApiResponse<T>>(url, config),
};

export default api;

// Type definitions for axios config extension
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}