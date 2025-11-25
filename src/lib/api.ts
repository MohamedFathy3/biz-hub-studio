// src/lib/api.ts
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, // مهم جداً للـ cookies
});

// 🔧 متغير لتتبع حالة CSRF
let csrfTokenRetrieved = false;

// 🟢 دالة محسنة للحصول على CSRF token
export const getCsrfToken = async (force: boolean = false): Promise<void> => {
  if (csrfTokenRetrieved && !force) {
    console.log("🛡️ CSRF Token already retrieved, skipping...");
    return;
  }

  console.log("🛡️ Getting CSRF Token...");
  try {
    const response = await axios.get("/sanctum/csrf-cookie", {
      withCredentials: true,
      baseURL: "", // استخدام نفس الـ origin
    });
    
    console.log("🛡️ CSRF Token Response:", {
      status: response.status,
      headers: response.headers,
      cookies: document.cookie
    });
    
    csrfTokenRetrieved = true;
    console.log("🛡️ CSRF Token obtained successfully");
    
    // طباعة الـ cookies للتأكد
    const cookies = document.cookie.split(';');
    const xsrfToken = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    console.log("🍪 XSRF-TOKEN Cookie:", xsrfToken);
    
  } catch (error) {
    console.error("❌ Failed to get CSRF token:", error);
    csrfTokenRetrieved = false;
    throw error;
  }
};

// 🟢 Interceptor محسن للطلبات
api.interceptors.request.use(async (config) => {
  const token = Cookies.get("token");
  const method = config.method?.toUpperCase();

  console.log("🔍 API Request Details:", {
    url: config.url,
    method: method,
    hasToken: !!token,
    baseURL: config.baseURL,
  });

  // 🟢 الحصول على CSRF token قبل الطلبات التي تغير البيانات
  if (method && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    console.log("🔄 CSRF Token required for", method, "request");
    await getCsrfToken();
    
    // إضافة X-XSRF-TOKEN header إذا كان موجود في الـ cookies
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    if (xsrfToken) {
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
      console.log("✅ X-XSRF-TOKEN header added");
    }
  }

  // 🟢 إضافة Authorization header إذا كان التوكن موجود
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header added");
  }

  console.log("📋 Final Request Headers:", config.headers);

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ Success Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    console.log("📡 Response Status:", error.response?.status, error.response?.statusText);

    // 🔄 معالجة خطأ 419 (CSRF Token Mismatch)
    if (error.response?.status === 419) {
      console.log("🔄 419 CSRF Token Mismatch - Retrying with new token...");
      
      // إعادة تعيين حالة CSRF
      csrfTokenRetrieved = false;
      
      try {
        // الحصول على CSRF token جديد
        await getCsrfToken(true);
        
        // إعادة الطلب الأصلي
        if (originalRequest) {
          console.log("🔄 Retrying original request with new CSRF token");
          return api(originalRequest);
        }
      } catch (retryError) {
        console.error("❌ Failed to retry request after 419:", retryError);
      }
    }

    // 🚨 معالجة خطأ 401 (Unauthorized)
    if (error.response?.status === 401) {
      console.log("🔐 401 Unauthorized - Removing token and redirecting to login");
      Cookies.remove("token");
      window.location.href = "/login";
    }

    console.error("🚨 API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    return Promise.reject(error);
  }
);

// 🟢 دالة لتهيئة التطبيق بـ CSRF token
export const initializeApp = async (): Promise<void> => {
  console.log("🚀 Initializing app with CSRF token...");
  await getCsrfToken();
  console.log("🚀 App initialized successfully");
};

export default api;