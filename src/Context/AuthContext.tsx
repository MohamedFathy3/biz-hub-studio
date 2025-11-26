// Context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";  

type Field = {
  id: number;
  name: string;
};

type LoginCredentials = {
  email_or_phone: string;
  password: string;
};

type Certificate = {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  authorId: number | null;
  previewUrl: string;
  fullUrl: string;
  createdAt: string;
};

type User = {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  graduation_year: string;
  university: string;
  graduation_grade: string;
  postgraduate_degree: string;
  specialization: string;
  experience_years: number;
  profile_image: string;
  cover_image: string;
  graduation_certificate_image: string;
  course_certificates_image: Certificate[];
  is_work_assistant_university: number;
  assistant_university: string;
  available_times: string;
  tools: string;
  active: number;
  has_clinic: number;
  clinic_name: string;
  clinic_address: string;
  fields: Field[];
  posts: any[];
  created_at: string;
  specializations: [id:number, name:string ]; 
  updated_at: string;
  friends: { id: number; user_name: string; profile_image: string }[];
  friends_count:number;
  cv:string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUserPosts: (newPost: any) => void; // 🔥 الجديدة
  refreshUser: () => Promise<void>; // 🔥 الجديدة
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUserPosts: () => {}, // 🔥 الجديدة
  refreshUser: async () => {}, // 🔥 الجديدة
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const token = Cookies.get("token");
    console.log("🔐 Token from cookies:", token);
    
    if (!token) {
      console.log("❌ No token found");
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      console.log("🔄 Checking auth...");
      const res = await api.get("/user/check-auth");
      console.log("✅ Auth check response:", res.data);
      
      setUser({
        ...res.data.message.doctor,
        friends_count: res.data.message.friends_count,
        friends: res.data.message.friends,
      });
      console.log("✅ User set successfully");
    } catch (error) {
      console.error("❌ Auth check error:", error);
      Cookies.remove("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log("🔐 Attempting login with:", credentials);
      const res = await api.post("/user/login", {
        email_or_phone: credentials.email_or_phone,
        password: credentials.password 
      });
      console.log("✅ Login response:", res.data);
      
      const token = res.data.token;
      console.log("🔑 Token received:", token);
      
      Cookies.set("token", token);
      console.log("🍪 Token set in cookies");
      
      await checkAuth();
      console.log("🔄 After checkAuth - should redirect now");
      navigate("/");
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    navigate("/login");
  };

  // 🔥 الجديدة: دالة علشان نضيف post جديد
  const updateUserPosts = (newPost: any) => {
    if (user) {
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        return {
          ...prevUser,
          posts: [newPost, ...prevUser.posts] // نضيف البوست الجديد في الأول
        };
      });
    }
  };

  // 🔥 الجديدة: دالة علشان نعمل refresh للبيانات
  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateUserPosts, // 🔥 نضيفها هنا
      refreshUser // 🔥 نضيفها هنا
    }}>
      {children}
    </AuthContext.Provider>
  );
};