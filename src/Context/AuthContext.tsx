import React, { createContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";  

type Field = {
  id: number;
  name: string;
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
  tools: string; // ممكن تعمل تحويلها لـ string[] بعدين لو حبيت
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // بدل useRouter

  const checkAuth = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const res = await api.get("/user/check-auth");
setUser({
  ...res.data.message.doctor,
  friends_count: res.data.message.friends_count,
  friends: res.data.message.friends,
});    } catch (error) {
      Cookies.remove("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/user/login", { email, password });
      const token = res.data.token; // تأكد من اسم المفتاح
      Cookies.set("token", token);
      await checkAuth();
      navigate("/"); // تحويل للصفحة الرئيسية أو dashboard
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
