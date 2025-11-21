// src/lib/api.ts
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://back.dentin.cloud/api", // backend URL
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // مهم جداً عشان Laravel يقرأ الـ cookies
});

// 🟢 قبل أي POST/PUT/DELETE: نجيب CSRF cookie
export const getCsrfToken = async () => {
  await axios.get("https://back.dentin.cloud/sanctum/csrf-cookie", {
    withCredentials: true,
  });
};

// إضافة التوكن في كل request
api.interceptors.request.use(async (config) => {
  // لو الطلب POST/PUT/DELETE، ناخد CSRF Cookie أول
  if (["post", "put", "delete"].includes(config.method || "")) {
    await getCsrfToken();
  }

  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// التعامل مع الأخطاء بشكل احترافي
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove("token"); // لو التوكن مش صالح
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
