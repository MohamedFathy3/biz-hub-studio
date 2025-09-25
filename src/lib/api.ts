// src/lib/api.ts
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // backend URL
  headers: { "Content-Type": "application/json" },
});

// إضافة التوكن في كل request
api.interceptors.request.use((config) => {
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
