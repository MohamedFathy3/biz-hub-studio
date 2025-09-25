import api from "./api";

interface RegisterData {
  email: string;
  password: string;
  user_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  graduation_year: number;
  university: string;
  graduation_grade: string;
  postgraduate_degree: string;
  specialization: string;
  experience_years: number;
  assistant_university: string;
  is_work_assistant_university: number;
  tools: string;
  available_times: string;
  active: number;
  has_clinic: number;
  clinic_name: string;
  clinic_address: string;
  fields: number[];
  profile_image: number;
  cover_image: number;
  graduation_certificate_image: number;
  course_certificates_image: number[];
}

interface LoginData {
  email: string;
  password: string;
}

// 🔹 Register API
export const register = async (data: RegisterData) => {
  const res = await api.post("/application-form", data);
  return res.data;
};

// 🔹 Login API
export const login = async (data: LoginData) => {
  const res = await api.post("/login", data);

  if (res.data.token) {
    // نخزن التوكن في الكوكيز
    document.cookie = `token=${res.data.token}; path=/;`;
  }

  return res.data;
};
