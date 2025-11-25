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
  description: string;
  where_did_you_work: string;
  address: string;
  assistant_university: string;
  is_work_assistant_university: number;
  tools: string;
  skills: string;
  available_times: string;
  active: number;
  has_clinic: number;
  clinic_name: string;
  clinic_address: string;
  fields: number[];
  profile_image: number;
  cover_image: number;
  cv: number;
  graduation_certificate_image: number;
  course_certificates_image: number[];
}

interface LoginData {
  email: string;
  password: string;
}

export const register = async (formData: any) => {
  try {
    console.log("📤 Original form data:", formData);

    // بناء الـ payload بشكل صحيح مع كل الحقول المطلوبة
    const payload = {
      email: formData.email,
      password: formData.password,
      user_name: formData.user_name,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      birth_date: formData.birth_date || "",
      graduation_year: Number(formData.graduation_year) || new Date().getFullYear(),
      university: formData.university || "",
      graduation_grade: formData.graduation_grade || "",
      postgraduate_degree: formData.postgraduate_degree || "",
      specialization: formData.specialization || "",
      experience_years: Number(formData.experience_years) || 0,
      description: formData.description || "",
      where_did_you_work: formData.where_did_you_work || "",
      address: formData.address || "",
      assistant_university: formData.assistant_university || "",
      is_work_assistant_university: Number(formData.is_work_assistant_university) || 0,
      tools: formData.tools || "[]",
      skills: formData.skills || "[]",
      available_times: formData.available_times || "[]",
      has_clinic: Number(formData.has_clinic) || 0,
      clinic_name: formData.clinic_name || "",
      clinic_address: formData.clinic_address || "",
      
      // ✅ أرسلها كـ array
      fields: formData.fields || [],
      
      // الحقول المرتبطة بالصور
      profile_image: formData.profile_image || null,
      cover_image: formData.cover_image || null,
      cv: formData.cv || null,
      graduation_certificate_image: formData.graduation_certificate_image || null,
      
      course_certificates_image: formData.course_certificates_image || [],
    };

    console.log("📦 Final payload for API:", payload);

    const response = await api.post("/application-form", payload);
    console.log("✅ Registration successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    console.error("Error details:", error.response?.data);
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    const res = await api.post("/login", data);

    if (res.data.token) {
      // نخزن التوكن في الكوكيز
      document.cookie = `token=${res.data.token}; path=/;`;
    }

    return res.data;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    throw error;
  }
};