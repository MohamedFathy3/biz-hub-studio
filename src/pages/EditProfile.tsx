import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import api from '@/lib/api';
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft, Upload, FileText, Image, X } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function EditProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // بيانات المستخدم للتعديل
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        user_name: "",
        first_name: "",
        last_name: "",
        phone: "",
        birth_date: "",
        graduation_year: "",
        university: "",
        description: "",
        graduation_grade: "",
        postgraduate_degree: "",
        specialization: "",
        experience_years: "",
        assistant_university: "",
        is_work_assistant_university: false,
        tools: "",
        available_times: "",
        active: true,
        has_clinic: false,
        clinic_name: "",
        clinic_address: "",
        fields: [] as number[],
        // الحقول الجديدة للصور والملفات
        profile_image: null as number | null,
        cover_image: null as number | null,
        graduation_certificate_image: null as number | null,
        course_certificates_image: [] as number[],
        cv_file: null as number | null,
    });

    // قائمة التخصصات المتاحة
    const availableFields = [
        { id: 1, name: "General Dentistry" },
        { id: 2, name: "Orthodontics" },
        { id: 3, name: "Pediatric Dentistry" },
        { id: 4, name: "Oral Surgery" },
        { id: 5, name: "Periodontics" },
        { id: 6, name: "Endodontics" },
        { id: 7, name: "Prosthodontics" }
    ];

    // جلب بيانات المستخدم الحالية
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                let userData;
                if (id) {
                    const response = await api.get(`/user/${id}`);
                    userData = response.data.message?.doctor || response.data;
                } else {
                    userData = currentUser;
                }

                if (userData) {
                    setFormData({
                        email: userData.email || "",
                        password: "",
                        user_name: userData.user_name || "",
                        first_name: userData.first_name || "",
                        last_name: userData.last_name || "",
                        phone: userData.phone || "",
                        birth_date: userData.birth_date || "",
                        graduation_year: userData.graduation_year?.toString() || "",
                        university: userData.university || "",
                        description: userData.description || "",
                        graduation_grade: userData.graduation_grade || "",
                        postgraduate_degree: userData.postgraduate_degree || "",
                        specialization: userData.specialization || "",
                        experience_years: userData.experience_years?.toString() || "",
                        assistant_university: userData.assistant_university || "",
                        is_work_assistant_university: Boolean(userData.is_work_assistant_university),
                        tools: userData.tools ? 
                            (typeof userData.tools === 'string' ? 
                                JSON.parse(userData.tools).join(", ") : 
                                userData.tools.join(", ")) 
                            : "",
                        available_times: userData.available_times || "",
                        active: Boolean(userData.active),
                        has_clinic: Boolean(userData.has_clinic),
                        clinic_name: userData.clinic_name || "",
                        clinic_address: userData.clinic_address || "",
                        fields: userData.fields?.map((f: any) => f.id) || [],
                        // الحقول الجديدة
                        profile_image: userData.profile_image || null,
                        cover_image: userData.cover_image || null,
                        graduation_certificate_image: userData.graduation_certificate_image || null,
                        course_certificates_image: userData.course_certificates_image || [],
                        cv_file: userData.cv_file || null,
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                alert("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id, currentUser]);

    // معالجة تغيير الحقول
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
const handleImageUpload = (field: keyof typeof formData, id: string | number) => {
  setFormData((prev) => ({
    ...prev,
    [field]: Number(id), // لو الـ backend بيتعامل بأرقام IDs
  }));
};

const removeFile = (field: keyof typeof formData) => {
  setFormData((prev) => ({
    ...prev,
    [field]: undefined,
  }));
};
    // معالجة التبديلات
    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    // معالجة التخصصات
    const handleFieldToggle = (fieldId: number) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.includes(fieldId)
                ? prev.fields.filter(id => id !== fieldId)
                : [...prev.fields, fieldId]
        }));
    };

    // معالجة رفع الصور والملفات


  

    const handleCvUpload = (id: number) => {
        setFormData(prev => ({
            ...prev,
            cv_file: id
        }));
    };

  ;
  const handleMultipleImagesUpload = (id: number) => {
        setFormData(prev => ({
            ...prev,
            course_certificates_image: [...prev.course_certificates_image, id]
        }));
    };
  
const handleSingleImageUpload = (
  field: "profile_image" | "cover_image" | "graduation_certificate_image" | "cv_file",
  id: number
) => {
  setFormData((prev) => ({
    ...prev,
    [field]: id,
  }));
};


    // إرسال البيانات
 // إرسال البيانات
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        // تحضير البيانات للإرسال - استخراج الأرقام فقط من الروابط
        const submitData: any = {
            email: formData.email,
            user_name: formData.user_name,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            birth_date: formData.birth_date,
            graduation_year: parseInt(formData.graduation_year) || 0,
            university: formData.university,
            description: formData.description,
            graduation_grade: formData.graduation_grade,
            postgraduate_degree: formData.postgraduate_degree,
            specialization: formData.specialization,
            experience_years: parseInt(formData.experience_years) || 0,
            assistant_university: formData.assistant_university,
            is_work_assistant_university: formData.is_work_assistant_university ? 1 : 0,
            tools: JSON.stringify(formData.tools.split(",").map(tool => tool.trim()).filter(tool => tool)),
            available_times: formData.available_times,
            active: formData.active ? 1 : 0,
            has_clinic: formData.has_clinic ? 1 : 0,
            clinic_name: formData.clinic_name,
            clinic_address: formData.clinic_address,
            fields: formData.fields,
        };

        // معالجة حقول الصور - استخراج الأرقام فقط
        const extractIdFromUrl = (url: any): number | null => {
            if (!url) return null;
            if (typeof url === 'number') return url;
            if (typeof url === 'string') {
                // إذا كان الرابط يحتوي على ID، استخراجه
                const match = url.match(/\/(\d+)$/);
                return match ? parseInt(match[1]) : null;
            }
            return null;
        };

        // إضافة حقول الصور بعد المعالجة
        submitData.profile_image = extractIdFromUrl(formData.profile_image);
        submitData.cover_image = extractIdFromUrl(formData.cover_image);
        submitData.graduation_certificate_image = extractIdFromUrl(formData.graduation_certificate_image);
        submitData.cv_file = extractIdFromUrl(formData.cv_file);

        // معالجة مصفوفة شهادات الكورسات
        submitData.course_certificates_image = Array.isArray(formData.course_certificates_image) 
            ? formData.course_certificates_image.map(url => extractIdFromUrl(url)).filter(id => id !== null)
            : [];

        // إضافة الباسورد فقط إذا كان غير فارغ
        if (formData.password) {
            submitData.password = formData.password;
        }

        console.log("Sending data:", submitData); // للتصحيح

        const userId = id || currentUser?.id;
        const response = await api.put(`/user/${userId}`, submitData);
        
        if (response.data.result === "Success") {
            alert("Profile updated successfully!");
            navigate(-1);
        } else {
            alert("Failed to update profile: " + (response.data.message || "Unknown error"));
        }
    } catch (error: any) {
        console.error("Error updating profile:", error);
        console.error("Error details:", error.response?.data);
        alert(error?.response?.data?.message || "Failed to update profile. Check console for details.");
    } finally {
        setSaving(false);
    }
};
    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </MainLayout>
        );
    }
const handleMultipleImageUpload = (id: number) => {
  setFormData(prev => ({
    ...prev,
    course_certificates_image: [...prev.course_certificates_image, id],
  }));
};


const removeCourseCertificate = (id: number) => {
  setFormData((prev) => ({
    ...prev,
    course_certificates_image: prev.course_certificates_image.filter((cid) => cid !== id),
  }));
};

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Profile
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Profile</h1>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="personal" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="personal">Personal Info</TabsTrigger>
                            <TabsTrigger value="education">Education</TabsTrigger>
                            <TabsTrigger value="professional">Professional</TabsTrigger>
                            <TabsTrigger value="documents">Documents & Media</TabsTrigger>
                        </TabsList>

                        {/* Personal Information */}
                        <TabsContent value="personal">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="user_name">Username</Label>
                                            <Input
                                                id="user_name"
                                                name="user_name"
                                                value={formData.user_name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="birth_date">Birth Date</Label>
                                            <Input
                                                id="birth_date"
                                                name="birth_date"
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="password">New Password (leave empty to keep current)</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Education Information */}
                        <TabsContent value="education">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Education Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="university">University</Label>
                                            <Input
                                                id="university"
                                                name="university"
                                                value={formData.university}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="graduation_year">Graduation Year</Label>
                                            <Input
                                                id="graduation_year"
                                                name="graduation_year"
                                                type="number"
                                                value={formData.graduation_year}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="graduation_grade">Graduation Grade</Label>
                                            <Select 
                                                value={formData.graduation_grade}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, graduation_grade: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="excellent">Excellent</SelectItem>
                                                    <SelectItem value="very_good">Very Good</SelectItem>
                                                    <SelectItem value="good">Good</SelectItem>
                                                    <SelectItem value="pass">Pass</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="postgraduate_degree">Postgraduate Degree</Label>
                                            <Input
                                                id="postgraduate_degree"
                                                name="postgraduate_degree"
                                                value={formData.postgraduate_degree}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="specialization">Specialization</Label>
                                        <Input
                                            id="specialization"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={formData.is_work_assistant_university}
                                            onCheckedChange={(checked) => handleSwitchChange("is_work_assistant_university", checked)}
                                        />
                                        <Label>Work as University Assistant</Label>
                                    </div>

                                    {formData.is_work_assistant_university && (
                                        <div>
                                            <Label htmlFor="assistant_university">Assistant University</Label>
                                            <Input
                                                id="assistant_university"
                                                name="assistant_university"
                                                value={formData.assistant_university}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Professional Information */}
                        <TabsContent value="professional">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="experience_years">Experience Years</Label>
                                            <Input
                                                id="experience_years"
                                                name="experience_years"
                                                type="number"
                                                value={formData.experience_years}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="available_times">Available Times</Label>
                                            <Input
                                                id="available_times"
                                                name="available_times"
                                                value={formData.available_times}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Saturday 9-12, Monday 2-5"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="tools">Tools</Label>
                                        <Input
                                            id="tools"
                                            name="tools"
                                            value={formData.tools}
                                            onChange={handleInputChange}
                                            placeholder="Enter tools separated by commas"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={formData.has_clinic}
                                            onCheckedChange={(checked) => handleSwitchChange("has_clinic", checked)}
                                        />
                                        <Label>Has Clinic</Label>
                                    </div>

                                    {formData.has_clinic && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="clinic_name">Clinic Name</Label>
                                                <Input
                                                    id="clinic_name"
                                                    name="clinic_name"
                                                    value={formData.clinic_name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="clinic_address">Clinic Address</Label>
                                                <Input
                                                    id="clinic_address"
                                                    name="clinic_address"
                                                    value={formData.clinic_address}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <Label>Specializations</Label>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {availableFields.map(field => (
                                                <div key={field.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`field-${field.id}`}
                                                        checked={formData.fields.includes(field.id)}
                                                        onChange={() => handleFieldToggle(field.id)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <Label htmlFor={`field-${field.id}`} className="text-sm">
                                                        {field.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={formData.active}
                                            onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                                        />
                                        <Label>Active Account</Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Documents & Media */}
                        <TabsContent value="documents">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documents & Media</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Profile Images */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>Profile Image</Label>
                                            <ImageUploader 
                                                label="Upload Profile Image"
    onUploadSuccess={(id) => handleImageUpload("profile_image", id)}
                                            />
                                            {formData.profile_image && (
                                                <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded">
                                                    <span className="text-green-600 text-sm">✓ Profile image uploaded</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => removeFile("profile_image")}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Cover Image</Label>
                                            <ImageUploader 
                                                label="Upload Cover Image"
                                                onUploadSuccess={(id) => handleImageUpload("cover_image", id)}
                                            />
                                            {formData.cover_image && (
                                                <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded">
                                                    <span className="text-green-600 text-sm">✓ Cover image uploaded</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => removeFile("cover_image")}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Certificates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>Graduation Certificate</Label>
                                            <ImageUploader 
                                                label="Upload Graduation Certificate"
                                                onUploadSuccess={(id) => handleImageUpload("graduation_certificate_image", id)}
                                            />
                                            {formData.graduation_certificate_image && (
                                                <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded">
                                                    <span className="text-green-600 text-sm">✓ Graduation certificate uploaded</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => removeFile("graduation_certificate_image")}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>CV/Resume (PDF)</Label>
                                            <div className="border border-gray-300 p-3 rounded-lg">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            const file = e.target.files[0];
                                                            const formData = new FormData();
                                                            formData.append("file", file);

                                                            try {
                                                                const res = await api.post("/media", formData, {
                                                                    headers: { "Content-Type": "multipart/form-data" },
                                                                });
                                                                if (res.data?.data?.id) {
                                                                    handleCvUpload(res.data.data.id);
                                                                }
                                                            } catch (error) {
                                                                alert("Failed to upload CV");
                                                            }
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                            {formData.cv_file && (
                                                <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-green-600" />
                                                        <span className="text-green-600 text-sm">CV uploaded successfully</span>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => removeFile("cv_file")}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Course Certificates */}
                                    <div>
                                        <Label>Course Certificates (Multiple)</Label>
                                    <ImageUploader 
  label="Upload Course Certificates"
  onUploadSuccess={(id) => handleMultipleImageUpload(Number(id))}
/>

                                        {formData.course_certificates_image.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {formData.course_certificates_image.map((imageId, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <Image className="w-4 h-4 text-green-600" />
                                                            <span className="text-green-600 text-sm">Course certificate #{index + 1}</span>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => removeCourseCertificate(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </MainLayout>
    );
}