import { useState, useEffect } from "react";
import { register } from "@/lib/auth";
import FileUploader from "@/components/ImageUploader"; 
import { useParams, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [tools, setTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");
  const [dots, setDots] = useState<Array<{x: number, y: number, size: number, speed: number}>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    assistant_university: "",
    is_work_assistant_university: 0,
    tools: "[]",
    available_times: "",
    active: 1,
    has_clinic: 0,
    clinic_name: "",
    clinic_address: "",
    fields: [] as number[],
    profile_image: null as number | null,
    cover_image: null as number | null,
    cv: null as number | null,
    graduation_certificate_image: null as number | null,
    course_certificates_image: [] as number[],
  });

  // Initialize moving dots
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({ 
      ...form, 
      [name]: type === "number" ? parseInt(value) : value 
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
    setForm(prev => {
      const currentFields = [...prev.fields];
      const fieldIndex = currentFields.indexOf(fieldId);
      
      if (fieldIndex > -1) {
        // Remove field if already selected
        currentFields.splice(fieldIndex, 1);
      } else {
        // Add field if not selected
        currentFields.push(fieldId);
      }
      
      return { ...prev, fields: currentFields };
    });
  };

  // Handle single image upload (profile, cover, graduation certificate, CV)
  const handleSingleImageUpload = (fieldName: string, imageId: number) => {
    console.log(`Uploaded ${fieldName} with ID:`, imageId);
    setForm(prev => ({ ...prev, [fieldName]: imageId }));
  };

  // Handle multiple course certificates upload
  const handleCourseCertificateUpload = (imageId: number) => {
    console.log(`Uploaded course certificate with ID:`, imageId);
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

  const addTool = () => {
    if (newTool.trim() !== "") {
      const updatedTools = [...tools, newTool.trim()];
      setTools(updatedTools);
      setForm({ ...form, tools: JSON.stringify(updatedTools) });
      setNewTool("");
    }
  };

  const removeTool = (index: number) => {
    const updatedTools = tools.filter((_, i) => i !== index);
    setTools(updatedTools);
    setForm({ ...form, tools: JSON.stringify(updatedTools) });
  };

  // Form validation
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
        break;
        
      case 2:
        if (!form.graduation_year) newErrors.graduation_year = "Graduation year is required";
        if (!form.university) newErrors.university = "University is required";
        if (form.fields.length === 0) newErrors.fields = "Please select at least one field";
        break;
        
      case 3:
        if (!form.experience_years && form.experience_years !== 0) newErrors.experience_years = "Experience years is required";
        break;
        
      case 4:
        if (!form.profile_image) newErrors.profile_image = "Profile image is required";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    try {
      console.log("Submitting form data:", form);
      const res = await register(form);
      alert("Registration successful! 🎉");
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      alert(`Registration error: ${err.response?.data?.message || "Something went wrong"}`);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Animated background with subtle blue pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-blue-400"/>
        </svg>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl relative z-10 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">Join our platform in just a few simple steps</p>
        </div>
        
        {/* Enhanced Progress bar */}
        <div className="flex justify-between mb-10 relative">
          <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 rounded-full -z-10">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep - 1) * 33.33}%` }}
            ></div>
          </div>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                  step <= currentStep 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-transparent shadow-lg' 
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
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "email", label: "Email Address", type: "email", required: true },
                  { name: "password", label: "Password", type: "password", required: true },
                  { name: "user_name", label: "Username", type: "text", required: true },
                  { name: "first_name", label: "First Name", type: "text", required: true },
                  { name: "last_name", label: "Last Name", type: "text", required: true },
                  { name: "phone", label: "Phone Number", type: "number", required: true },
                  { name: "birth_date", label: "Birth Date", type: "date", required: false }
                ].map((field) => (
                  <div key={field.name} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition-all`}
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
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">Education Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "graduation_year", label: "Graduation Year", type: "number", required: true },
                  { name: "university", label: "University", type: "text", required: true },
                  { name: "specialization", label: "Specialization", type: "text" }
                ].map((field) => (
                  <div key={field.name} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition-all`}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Grade
                  </label>
                  <select
                    name="graduation_grade"
                    value={form.graduation_grade}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 transition-all"
                  >
                    <option value="" className="bg-white">Select Grade</option>
                    <option value="excellent" className="bg-white">Excellent</option>
                    <option value="very_good" className="bg-white">Very Good</option>
                    <option value="good" className="bg-white">Good</option>
                  </select>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postgraduate Degree
                  </label>
                  <select
                    name="postgraduate_degree"
                    value={form.postgraduate_degree}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 transition-all"
                  >
                    <option value="" className="bg-white">Select Degree</option>
                    <option value="master" className="bg-white">Master</option>
                    <option value="phd" className="bg-white">PhD</option>
                  </select>
                </div>
                
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
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                        }`}
                        onClick={() => toggleField(field.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={form.fields.includes(field.id)}
                            onChange={() => {}}
                            className="mr-2 text-blue-500"
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
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">Professional Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "experience_years", label: "Years of Experience", type: "number", required: true },
                  { name: "assistant_university", label: "Assistant University", type: "text" },
                  { name: "available_times", label: "Available Times", type: "text", fullWidth: true }
                ].map((field) => (
                  <div key={field.name} className={`group ${field.fullWidth ? 'md:col-span-2' : ''}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition-all`}
                      placeholder={field.name === 'available_times' ? "e.g., Saturday 9-12, Monday 2-5" : ""}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-300">
                  <input
                    type="checkbox"
                    name="is_work_assistant_university"
                    checked={form.is_work_assistant_university === 1}
                    onChange={(e) => setForm({...form, is_work_assistant_university: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 text-blue-500 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-gray-700">Do you work as a university assistant?</label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-300">
                  <input
                    type="checkbox"
                    name="has_clinic"
                    checked={form.has_clinic === 1}
                    onChange={(e) => setForm({...form, has_clinic: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 text-blue-500 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-gray-700">Do you have a clinic?</label>
                </div>
                
                {form.has_clinic === 1 && (
                  <>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                      <input
                        type="text"
                        name="clinic_name"
                        value={form.clinic_name}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 transition-all"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
                      <input
                        type="text"
                        name="clinic_address"
                        value={form.clinic_address}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 transition-all"
                      />
                    </div>
                  </>
                )}
                
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tools & Skills
                  </label>
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
                      placeholder="Add a tool or skill"
                      className="flex-1 bg-gray-50 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 placeholder-gray-400 transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                    />
                    <button 
                      type="button" 
                      onClick={addTool}
                      className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center space-x-2"
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
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">Documents & Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Single Image Uploads */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image <span className="text-red-500">*</span>
                  </label>
                  <FileUploader 
                    label=""
                    onUploadSuccess={(id) => handleSingleImageUpload('profile_image', Number(id))}
                    accept="image/*"
                  />
                  {form.profile_image && (
                    <p className="text-green-600 text-sm mt-1">✓ Image uploaded successfully (ID: {form.profile_image})</p>
                  )}
                  {errors.profile_image && (
                    <p className="text-red-500 text-sm mt-1">{errors.profile_image}</p>
                  )}
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <FileUploader 
                    label=""
                    onUploadSuccess={(id) => handleSingleImageUpload('cover_image', Number(id))}
                    accept="image/*"
                  />
                  {form.cover_image && (
                    <p className="text-green-600 text-sm mt-1">✓ Image uploaded successfully (ID: {form.cover_image})</p>
                  )}
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Certificate
                  </label>
                  <FileUploader 
                    label=""
                    onUploadSuccess={(id) => handleSingleImageUpload('graduation_certificate_image', Number(id))}
                    accept="image/*"
                  />
                  {form.graduation_certificate_image && (
                    <p className="text-green-600 text-sm mt-1">✓ Certificate uploaded successfully (ID: {form.graduation_certificate_image})</p>
                  )}
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV (PDF/DOC/DOCX)
                  </label>
                  <FileUploader 
                    label=""
                    onUploadSuccess={(id) => handleSingleImageUpload('cv', Number(id))}
                    accept=".pdf,.doc,.docx"
                    preview={false}
                  />
                  {form.cv && (
                    <p className="text-green-600 text-sm mt-1">✓ CV uploaded successfully (ID: {form.cv})</p>
                  )}
                </div>
                
                {/* Multiple Course Certificates */}
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Certificates (Multiple)
                  </label>
                  <FileUploader 
                    label=""
                    onUploadSuccess={(id) => handleCourseCertificateUpload(Number(id))}
                    accept="image/*"
                    multiple={true}
                  />
                  <div className="mt-3 space-y-2">
                    {form.course_certificates_image.map((imageId, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-300">
                        <span className="text-gray-700 text-sm">✓ Certificate #{index + 1} (ID: {imageId})</span>
                        <button 
                          type="button" 
                          onClick={() => removeCourseCertificate(index)}
                          className="text-red-500 hover:text-red-700 transition-colors text-sm"
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
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl ml-auto flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl ml-auto flex items-center space-x-2"
              >
                <span>Complete Registration</span>
                <span>🎉</span>
              </button>
            )}
          </div>
        </form>
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