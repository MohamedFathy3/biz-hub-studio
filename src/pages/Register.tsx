import { useState, useEffect } from "react";
import { register } from "@/lib/auth";
import FileUploader from "@/components/ImageUploader"; 
import { useParams, useNavigate } from "react-router-dom";
import universitiesData from '@/hooks/universities';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [tools, setTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [dots, setDots] = useState<Array<{x: number, y: number, size: number, speed: number}>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [availableTimes, setAvailableTimes] = useState<Array<{
    day: string;
    from: string;
    to: string;
  }>>([]);

  // الأيام المتاحة
  const daysOfWeek = [
    "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ];

  // Available fields/specialties for selection
  const availableFields = [
    { id: 1, name: "General Dentistry" },
    { id: 2, name: "Orthodontics" },
    { id: 3, name: "Pediatric Dentistry" },
    { id: 4, name: "Oral Surgery" },
    { id: 5, name: "Periodontics" },
    { id: 6, name: "Endodontics" },
    { id: 7, name: "Prosthodontics" },
    { id: 8, name: "Cosmetic Dentistry" }
  ];
  
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    user_name: "",
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: "",
    graduation_year: new Date().getFullYear(),
    university: "",
    graduation_grade: "",
    postgraduate_degree: "",
    specialization: "",
    experience_years: 0,
    description: '',
    where_did_you_work: '',
    address: '',
    assistant_university: "",
    is_work_assistant_university: false,
    tools: "[]",
    skills: "[]",
    available_times: "[]",
    has_clinic: false,
    clinic_name: "",
    clinic_address: "",
    fields: [] as number[],
    profile_image: null as number | null,
    cover_image: null as number | null,
    cv: null as number | null,
    graduation_certificate_image: null as number | null,
    course_certificates_image: [] as number[],
  });

  // Initialize form fields to prevent null values
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      description: prev.description || '',
      where_did_you_work: prev.where_did_you_work || '',
      address: prev.address || '',
      skills: prev.skills || '[]',
      tools: prev.tools || '[]',
      available_times: prev.available_times || '[]',
      specialization: prev.specialization || '',
      assistant_university: prev.assistant_university || '',
      clinic_name: prev.clinic_name || '',
      clinic_address: prev.clinic_address || '',
      // Initialize arrays properly
      fields: prev.fields || [],
      course_certificates_image: prev.course_certificates_image || [],
    }));
  }, []);

  // Initialize moving dots with light blue color
  useEffect(() => {
    const newDots = [];
    for (let i = 0; i < 15; i++) {
      newDots.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5
      });
    }
    setDots(newDots);
  }, []);

  useEffect(() => {
    console.log("🔄 Form state updated:", form);
  }, [form]);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => 
        prevDots.map(dot => ({
          ...dot,
          x: (dot.x + dot.speed) % 100,
          y: (dot.y + dot.speed * 0.5) % 100
        }))
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    console.log(`📝 Field changed: ${name} = ${value}`);
    
    let processedValue: any = value;
    
    if (type === "number") {
      processedValue = parseInt(value) || 0;
    } else if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setForm({ 
      ...form, 
      [name]: processedValue 
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle field selection
  const toggleField = (fieldId: number) => {
    console.log(`🎯 Toggled field: ${fieldId}`);
    setForm(prev => {
      const currentFields = [...prev.fields];
      const fieldIndex = currentFields.indexOf(fieldId);
      
      if (fieldIndex > -1) {
        currentFields.splice(fieldIndex, 1);
      } else {
        currentFields.push(fieldId);
      }
      
      return { ...prev, fields: currentFields };
    });
  };

  const handleSingleImageUpload = (fieldName: string, imageId: number) => {
    console.log(`✅ Uploaded ${fieldName} with ID:`, imageId);
    setForm(prev => ({ 
      ...prev, 
      [fieldName]: imageId 
    }));
  };

  // Handle multiple course certificates upload
  const handleCourseCertificateUpload = (imageId: number) => {
    console.log(`✅ Uploaded course certificate with ID:`, imageId);
    setForm(prev => ({
      ...prev,
      course_certificates_image: [...prev.course_certificates_image, imageId]
    }));
  };

  // Remove course certificate
  const removeCourseCertificate = (index: number) => {
    setForm(prev => ({
      ...prev,
      course_certificates_image: prev.course_certificates_image.filter((_, i) => i !== index)
    }));
  };

  const addTimeSlot = () => {
    const daySelect = document.getElementById('daySelect') as HTMLSelectElement;
    const fromSelect = document.getElementById('fromSelect') as HTMLSelectElement;
    const toSelect = document.getElementById('toSelect') as HTMLSelectElement;
    
    const day = daySelect?.value;
    const from = fromSelect?.value;
    const to = toSelect?.value;
    
    console.log(`⏰ Adding time slot: ${day} from ${from} to ${to}`);
    
    if (!day || !from || !to) {
      alert('Please fill all fields');
      return;
    }
    
    if (from >= to) {
      alert('End time must be after start time');
      return;
    }
    
    const newSlot = { day, from, to };
     const updatedSlots = [...availableTimes, newSlot];
  setAvailableTimes(updatedSlots);
  setForm(prev => ({
    ...prev,
    available_times: JSON.stringify(updatedSlots) // تأكد من stringify
  }));
    
  
  };

  // دالة حذف time slot
  const removeTimeSlot = (index: number) => {
    console.log(`🗑️ Removing time slot at index: ${index}`);
    const updatedSlots = availableTimes.filter((_, i) => i !== index);
    setAvailableTimes(updatedSlots);
    setForm(prev => ({
      ...prev,
      available_times: JSON.stringify(updatedSlots)
    }));
  };

const addTool = () => {
  if (newTool.trim() !== "") {
    console.log(`🛠️ Adding tool: ${newTool}`);
    const updatedTools = [...tools, newTool.trim()];
    setTools(updatedTools);
    setForm({ ...form, tools: JSON.stringify(updatedTools) }); // تأكد من stringify
    setNewTool("");
  }
};

const addSkill = () => {
  if (newSkill.trim() !== "") {
    console.log(`💪 Adding skill: ${newSkill}`);
    const updatedSkills = [...skills, newSkill.trim()];
    setSkills(updatedSkills);
    setForm({ ...form, skills: JSON.stringify(updatedSkills) }); // تأكد من stringify
    setNewSkill("");
  }
};

  const removeTool = (index: number) => {
    console.log(`🗑️ Removing tool at index: ${index}`);
    const updatedTools = tools.filter((_, i) => i !== index);
    setTools(updatedTools);
    setForm({ ...form, tools: JSON.stringify(updatedTools) });
  };

  const removeSkill = (index: number) => {
    console.log(`🗑️ Removing skill at index: ${index}`);
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    setForm({ ...form, skills: JSON.stringify(updatedSkills) });
  };

  // Form validation - كل الحقول required
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    switch(step) {
      case 1:
        if (!form.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
        if (!form.password) newErrors.password = "Password is required";
        else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!form.user_name) newErrors.user_name = "Username is required";
        if (!form.first_name) newErrors.first_name = "First name is required";
        if (!form.last_name) newErrors.last_name = "Last name is required";
        if (!form.phone) newErrors.phone = "Phone number is required";
        if (!form.address) newErrors.address = "Address is required";
        if (!form.birth_date) newErrors.birth_date = "Birth date is required";
        break;
        
      case 2:
        if (!form.graduation_year) newErrors.graduation_year = "Graduation year is required";
        if (!form.university) newErrors.university = "University is required";
        if (!form.graduation_grade) newErrors.graduation_grade = "Graduation grade is required";
        if (!form.postgraduate_degree) newErrors.postgraduate_degree = "Postgraduate degree is required";
        if (form.fields.length === 0) newErrors.fields = "Please select at least one field";
        break;
        
      case 3:
        if (!form.experience_years && form.experience_years !== 0) newErrors.experience_years = "Experience years is required";
        if (!form.description || form.description.trim() === '') newErrors.description = "Professional description is required";
        if (!form.where_did_you_work || form.where_did_you_work.trim() === '') newErrors.where_did_you_work = "Work history is required";
        if (!form.address || form.address.trim() === '') newErrors.address = "Address is required";
        if (skills.length === 0) newErrors.skills = "Please add at least one skill";
        // if (tools.length === 0) newErrors.tools = "Please add at least one tool";
        
        // إذا كان مساعد جامعي، يجب تعبئة الجامعة
        if (form.is_work_assistant_university && !form.assistant_university) {
          newErrors.assistant_university = "University name is required for teaching assistants";
        }
        
        // إذا كان عنده عيادة، يجب تعبئة بيانات العيادة
        if (form.has_clinic) {
          if (!form.clinic_name) newErrors.clinic_name = "Clinic name is required";
          if (!form.clinic_address) newErrors.clinic_address = "Clinic address is required";
        }
        break;
        
      case 4:
        if (!form.profile_image) newErrors.profile_image = "Profile image is required";
        if (!form.cover_image) newErrors.cover_image = "Cover image is required";
        if (!form.graduation_certificate_image) newErrors.graduation_certificate_image = "Graduation certificate is required";
        if (!form.cv) newErrors.cv = "CV is required";
        if (form.course_certificates_image.length === 0) newErrors.course_certificates_image = "At least one course certificate is required";
        break;
    }
    
    console.log(`❌ Validation errors for step ${step}:`, newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log("🎯 SUBMIT BUTTON CLICKED");
  console.log("📋 FINAL FORM DATA:", form);
  
  if (!validateStep(currentStep)) {
    console.log("❌ Validation failed, stopping submission");
    return;
  }
  
  try {
    // حول الـ skills لـ array والـ available_times لـ JSON string
    const parsedSkills = typeof form.skills === 'string' ? JSON.parse(form.skills) : form.skills;
    const availableTimesString = typeof form.available_times === 'string' ? form.available_times : JSON.stringify(form.available_times);

    // Create a clean data object with proper formatting
    const submitData: any = {
      email: form.email,
      password: form.password,
      user_name: form.user_name,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      birth_date: form.birth_date,
      graduation_year: form.graduation_year,
      university: form.university,
      graduation_grade: form.graduation_grade,
      postgraduate_degree: form.postgraduate_degree,
      specialization: form.specialization || '',
      experience_years: form.experience_years,
      description: form.description || '',
      where_did_you_work: form.where_did_you_work || '',
      address: form.address || '',
      assistant_university: form.assistant_university || '',
      is_work_assistant_university: form.is_work_assistant_university ? 1 : 0,
      tools: typeof form.tools === 'string' ? form.tools : JSON.stringify(form.tools), // JSON string
      skills: parsedSkills, // Array
      available_times: availableTimesString, // JSON string
      has_clinic: form.has_clinic ? 1 : 0,
      clinic_name: form.clinic_name || '',
      clinic_address: form.clinic_address || '',
      profile_image: form.profile_image,
      cover_image: form.cover_image,
      cv: form.cv,
      graduation_certificate_image: form.graduation_certificate_image,
      fields: form.fields,
      course_certificates_image: form.course_certificates_image,
    };

    console.log("🔍 التحقق من الحقول قبل الإرسال:");
    console.log("skills:", submitData.skills, "Type:", typeof submitData.skills, "Is Array:", Array.isArray(submitData.skills));
    console.log("tools:", submitData.tools, "Type:", typeof submitData.tools);
    console.log("available_times:", submitData.available_times, "Type:", typeof submitData.available_times);

    console.log("🚀 FINAL DATA TO SEND:", submitData);

    const res = await register(submitData);
    console.log("✅ Registration successful:", res);
    alert("🎉 Registration successful!");
    navigate("/login");
    
  } catch (err: any) {
    console.error("❌ Registration failed:", err);
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message ||
                        "Something went wrong";
    alert(`Registration error: ${errorMessage}`);
  }
};

  const nextStep = () => {
    console.log(`➡️ Moving from step ${currentStep} to ${currentStep + 1}`);
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("❌ Cannot proceed to next step due to validation errors");
    }
  };

  const prevStep = () => {
    console.log(`⬅️ Moving from step ${currentStep} to ${currentStep - 1}`);
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Animated background with light blue pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-[#039fb3]"/>
        </svg>
      </div>

      {/* Moving dots background */}
      <div className="absolute inset-0">
        {dots.map((dot, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-[#039fb3] opacity-10"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
            }}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl relative z-10 border border-gray-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Biz Hub Studio Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#039fb3] mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">Join our platform in just a few simple steps</p>
        </div>
        
        {/* Enhanced Progress bar */}
        <div className="flex justify-between mb-10 relative">
          <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 rounded-full -z-10">
            <div 
              className="h-full bg-[#039fb3] rounded-full transition-all duration-500"
              style={{ width: `${(currentStep - 1) * 33.33}%` }}
            ></div>
          </div>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                  step <= currentStep 
                    ? 'bg-[#039fb3] text-white border-transparent shadow-lg' 
                    : 'bg-gray-100 text-gray-400 border-gray-300'
                }`}
              >
                {step}
              </div>
              <span className="text-sm mt-3 font-medium text-gray-700">
                {step === 1 && "Basic Info"}
                {step === 2 && "Education"}
                {step === 3 && "Experience"}
                {step === 4 && "Documents"}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-[#039fb3] border-l-4 border-[#039fb3] pl-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "email", label: "Email Address", type: "email", required: true },
                  { name: "password", label: "Password", type: "password", required: true },
                  { name: "user_name", label: "Username", type: "text", required: true },
                  { name: "first_name", label: "First Name", type: "text", required: true },
                  { name: "last_name", label: "Last Name", type: "text", required: true },
                  { name: "phone", label: "Phone Number", type: "text", required: true },
                  { name: "address", label: "Address", type: "text", required: true },
                  { name: "birth_date", label: "Birth Date", type: "date", required: true }
                ].map((field) => (
                  <div key={field.name} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 placeholder-gray-400 transition-all`}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      required={field.required}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Education Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-[#039fb3] border-l-4 border-[#039fb3] pl-4">Education Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { 
                    name: "graduation_year", 
                    label: "Graduation Year", 
                    type: "number", 
                    required: true
                  },
                ].map((field) => (
                  <div key={field.name} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 placeholder-gray-400 transition-all`}
                      required
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
                
                {/* University Dropdown */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="university"
                    value={form.university}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border ${errors.university ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 transition-all`}
                    required
                  >
                    <option value="">Select University</option>
                    {universitiesData.map((university) => (
                      <option key={university.name} value={university.name}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                  {errors.university && (
                    <p className="text-red-500 text-sm mt-1">{errors.university}</p>
                  )}
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="graduation_grade"
                    value={form.graduation_grade}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border ${errors.graduation_grade ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 transition-all`}
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="excellent">Excellent</option>
                    <option value="very_good">Very Good</option>
                    <option value="good">Good</option>
                  </select>
                  {errors.graduation_grade && (
                    <p className="text-red-500 text-sm mt-1">{errors.graduation_grade}</p>
                  )}
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postgraduate Degree <span className="text-red-500">*</span>
                  </label>
                 <select
  name="postgraduate_degree"
  value={form.postgraduate_degree}
  onChange={handleChange}
  className={`w-full bg-gray-50 border ${errors.postgraduate_degree ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 transition-all`}
  required
>
  <option value="">Select Degree</option>
  <option value="gp">G.P</option>
  <option value="phd">PhD</option>
  <option value="diploma">Diploma</option>
</select>
                  {errors.postgraduate_degree && (
                    <p className="text-red-500 text-sm mt-1">{errors.postgraduate_degree}</p>
                  )}
                </div>

                {/* <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 transition-all"
                    placeholder="Enter your specialization"
                  />
                </div> */}
                
                {/* Fields Selection */}
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fields/Specialties <span className="text-red-500">*</span>
                  </label>
                  {errors.fields && (
                    <p className="text-red-500 text-sm mb-2">{errors.fields}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableFields.map(field => (
                      <div 
                        key={field.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          form.fields.includes(field.id) 
                            ? 'border-[#039fb3] bg-blue-50' 
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                        }`}
                        onClick={() => toggleField(field.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={form.fields.includes(field.id)}
                            onChange={() => {}}
                            className="mr-2 text-[#039fb3]"
                          />
                          <span className="text-sm text-gray-700">{field.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Professional Experience */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-[#039fb3] border-l-4 border-[#039fb3] pl-4">Professional Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "experience_years", label: "Years of Experience", type: "number", required: true },
                  { name: "description", label: "Professional Description", type: "text", required: true },
                  { name: "where_did_you_work", label: "Work History", type: "text", required: true },
                  { name: "address", label: "Address", type: "text", required: true },
                ].map((field) => (
                  <div key={field.name} className={`group ${field.name === 'description' || field.name === 'where_did_you_work' ? 'md:col-span-2' : ''}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 placeholder-gray-400 transition-all`}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      required
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
                
                {/* University Assistant */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you work as a university assistant? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="is_work_assistant_university"
                    value={form.is_work_assistant_university ? "1" : "0"}
                    onChange={(e) => setForm({...form, is_work_assistant_university: e.target.value === "1"})}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 transition-all"
                    required
                  >
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>

                {/* Clinic */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have a clinic? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="has_clinic"
                    value={form.has_clinic ? "1" : "0"}
                    onChange={(e) => setForm({...form, has_clinic: e.target.value === "1"})}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 transition-all"
                    required
                  >
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>

                {/* Show university field if assistant is yes */}
                {form.is_work_assistant_university && (
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher Assistant At University <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="assistant_university"
                      value={form.assistant_university}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors.assistant_university ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 transition-all`}
                      placeholder="Enter university name"
                      required
                    />
                    {errors.assistant_university && (
                      <p className="text-red-500 text-sm mt-1">{errors.assistant_university}</p>
                    )}
                  </div>
                )}

                {/* Show clinic fields if clinic is yes */}
                {form.has_clinic && (
                  <>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinic Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="clinic_name"
                        value={form.clinic_name}
                        onChange={handleChange}
                        className={`w-full bg-gray-50 border ${errors.clinic_name ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] text-gray-800 transition-all`}
                        placeholder="Enter clinic name"
                        required
                      />
                      {errors.clinic_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.clinic_name}</p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinic Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="clinic_address"
                        value={form.clinic_address}
                        onChange={handleChange}
                        className={`w-full bg-gray-50 border ${errors.clinic_address ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] text-gray-800 transition-all`}
                        placeholder="Enter clinic address"
                        required
                      />
                      {errors.clinic_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.clinic_address}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Available Times - Only show if university assistant is yes */}
                {form.is_work_assistant_university && (
                  <div className="md:col-span-2 group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Times
                    </label>
                    
                    {/* Add New Time Slot */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-300 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                          <select
                            className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039fb3] text-gray-800"
                            id="daySelect"
                          >
                            <option value="">Select Day</option>
                            {daysOfWeek.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                          <select
                            className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039fb3] text-gray-800"
                            id="fromSelect"
                          >
                            <option value="">Select Time</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return [`${hour}:00`, `${hour}:30`];
                            }).flat().map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                          <select
                            className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039fb3] text-gray-800"
                            id="toSelect"
                          >
                            <option value="">Select Time</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return [`${hour}:00`, `${hour}:30`];
                            }).flat().map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addTimeSlot}
                        className="bg-[#039fb3] text-white px-6 py-2 rounded-lg hover:bg-[#0288a1] transition-all flex items-center space-x-2"
                      >
                        <span>+</span>
                        <span>Add Time Slot</span>
                      </button>
                    </div>

                    {/* Display Added Time Slots */}
                    <div className="space-y-3">
                      {availableTimes.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-4">
                            <span className="bg-[#039fb3] text-white px-3 py-1 rounded-full text-sm font-medium">
                              {slot.day}
                            </span>
                            <span className="text-gray-700">
                              {slot.from} - {slot.to}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            × Remove
                          </button>
                        </div>
                      ))}
                      
                      {availableTimes.length === 0 && (
                        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          No time slots added yet
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tools Section */}
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tools You Have <span className="text-red-500">*</span>
                  </label>
                  {errors.tools && (
                    <p className="text-red-500 text-sm mb-2">{errors.tools}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tools.map((tool, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center border border-blue-200">
                        {tool}
                        <button 
                          type="button" 
                          onClick={() => removeTool(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                 <div className="flex gap-2">
  <input
    type="text"
    value={newTool}
    onChange={(e) => setNewTool(e.target.value)}
    placeholder="Add a tool"
    className="flex-1 bg-gray-50 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 placeholder-gray-400 transition-all"
    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
  />
  <button 
    type="button" 
    onClick={addTool}
    className="bg-[#039fb3] text-white px-6 py-3 rounded-xl hover:bg-[#0288a1] transition-all flex items-center space-x-2"
  >
    <span>+</span>
    <span>Add</span>
  </button>
</div>
                </div>

                {/* Skills Section */}
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  {errors.skills && (
                    <p className="text-red-500 text-sm mb-2">{errors.skills}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill, index) => (
                      <div key={index} className="bg-green-100 text-green-800 px-3 py-2 rounded-lg flex items-center border border-green-200">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-green-600 hover:text-green-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 bg-gray-50 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] text-gray-800 placeholder-gray-400 transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button 
                      type="button" 
                      onClick={addSkill}
                      className="bg-[#039fb3] text-white px-6 py-3 rounded-xl hover:bg-[#0288a1] transition-all flex items-center space-x-2"
                    >
                      <span>+</span>
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Attachments and Images */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-[#039fb3] border-l-4 border-[#039fb3] pl-4">Documents & Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image <span className="text-red-500">*</span>
                  </label>
                  <FileUploader 
                    onUploadSuccess={(id) => handleSingleImageUpload("profile_image", id)}
                    accept="image/*"
                    multiple={false}
                    preview={true}
                    uniqueId="profile-upload"
                  />
                  {form.profile_image && (
                    <p className="text-green-600 text-sm mt-1">✅ Profile image uploaded (ID: {form.profile_image})</p>
                  )}
                  {errors.profile_image && (
                    <p className="text-red-500 text-sm mt-1">{errors.profile_image}</p>
                  )}
                </div>

                {/* Cover Image */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image <span className="text-red-500">*</span>
                  </label>
                  <FileUploader 
                    onUploadSuccess={(id) => handleSingleImageUpload("cover_image", id)}
                    accept="image/*"
                    multiple={false}
                    preview={true}
                    uniqueId="cover-upload"
                  />
                  {form.cover_image && (
                    <p className="text-green-600 text-sm mt-1">✅ Cover image uploaded (ID: {form.cover_image})</p>
                  )}
                  {errors.cover_image && (
                    <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>
                  )}
                </div>

                {/* Graduation Certificate */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Certificate <span className="text-red-500">*</span>
                  </label>
                  <FileUploader 
                    onUploadSuccess={(id) => handleSingleImageUpload("graduation_certificate_image", id)}
                    accept="image/*"
                    multiple={false}
                    preview={true}
                    uniqueId="graduation-certificate-upload"
                  />
                  {form.graduation_certificate_image && (
                    <p className="text-green-600 text-sm mt-1">✅ Certificate uploaded (ID: {form.graduation_certificate_image})</p>
                  )}
                  {errors.graduation_certificate_image && (
                    <p className="text-red-500 text-sm mt-1">{errors.graduation_certificate_image}</p>
                  )}
                </div>

                {/* CV */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV (PDF/DOC/DOCX) <span className="text-red-500">*</span>
                  </label>
                  <FileUploader 
                    onUploadSuccess={(id) => handleSingleImageUpload("cv", id)}
                    accept=".pdf,.doc,.docx"
                    multiple={false}
                    preview={false}
                    uniqueId="cv-upload"
                  />
                  {form.cv && (
                    <p className="text-green-600 text-sm mt-1">✅ CV uploaded (ID: {form.cv})</p>
                  )}
                  {errors.cv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cv}</p>
                  )}
                </div>

                {/* Course Certificates */}
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Certificates (Multiple) <span className="text-red-500">*</span>
                  </label>
                  {errors.course_certificates_image && (
                    <p className="text-red-500 text-sm mb-2">{errors.course_certificates_image}</p>
                  )}
                  <FileUploader 
                    onUploadSuccess={handleCourseCertificateUpload}
                    accept="image/*"
                    multiple={true}
                    preview={true}
                    uniqueId="course-certificates-upload"
                  />
                  <div className="mt-3 space-y-2">
                    {form.course_certificates_image.map((imageId, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                        <span className="text-gray-700 text-sm">✅ Certificate #{index + 1} (ID: {imageId})</span>
                        <button 
                          type="button" 
                          onClick={() => removeCourseCertificate(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 border border-gray-300 hover:border-gray-400 transition-all flex items-center space-x-2"
              >
                <span>←</span>
                <span>Previous</span>
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-[#039fb3] text-white px-8 py-3 rounded-xl hover:bg-[#0288a1] transition-all shadow-lg hover:shadow-xl ml-auto flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="submit"
                className="bg-[#039fb3] text-white px-8 py-3 rounded-xl hover:bg-[#0288a1] transition-all shadow-lg hover:shadow-xl ml-auto flex items-center space-x-2"
              >
                <span>Complete Registration</span>
                <span>🎉</span>
              </button>
            )}
          </div>
        </form>

        {/* رابط تسجيل الدخول */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="text-[#039fb3] hover:text-[#0288a1] font-semibold underline transition-colors"
            >
              Login here
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}