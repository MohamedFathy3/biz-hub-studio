import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/social/PostCard";
import { useState } from "react";

import { MapPin, Link, Calendar, Users, Camera, Phone, GraduationCap, Briefcase, Building, Award, Clock, Download } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import FriendComponent from "@/components/feed/frindereaquest"
import { useContext } from "react";
import api from '@/lib/api'
import ImageUploader from "@/components/ImageUploader";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/Context/AuthContext";

export default function Profile() {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [coverImage, setCoverImage] = useState(user?.cover_image);
    const [showUploader, setShowUploader] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUploadSuccess = async (imageId: number) => {
        if (!user?.id) return alert("لم يتم العثور على بيانات المستخدم.");

        setIsUpdating(true);
        try {
            const res = await api.put(`/user/${user.id}`, { cover_image_id: imageId });
            const newCoverImage = res.data?.doctor?.cover_image;
            if (newCoverImage) {
                setCoverImage(newCoverImage);
                alert("تم تحديث الصورة بنجاح!");
            } else {
                alert("لم يتم تحديث الصورة");
            }
        } catch (error: any) {
            alert(error?.response?.data?.message || "فشل في تحديث الصورة");
        } finally {
            setShowUploader(false);
            setIsUpdating(false);
        }
    };

    let tools = [];
    try {
        tools = JSON.parse(user?.tools || "[]");
    } catch (error) {
        console.error('Error parsing tools:', error);
        tools = [];
    }

    // دالة لتحويل graduation_grade إلى نص مقروء
    const getGradeText = (grade: string) => {
        const gradeMap: { [key: string]: string } = {
            'excellent': 'Excellent',
            'very_good': 'Very Good',
            'good': 'Good',
            'pass': 'Pass'
        };
        return gradeMap[grade] || grade;
    };

    // دالة لعرض البيانات الاختيارية
    const renderOptionalField = (value: any, label: string, icon?: React.ReactNode) => {
        if (!value) return null;
        
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                <span className="font-medium">{label}:</span>
                <span>{value}</span>
            </div>
        );
    };

    if (loading) return (
        <MainLayout>
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </MainLayout>
    );

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto p-6">
                {/* Cover Photo & Profile Info */}
                <Card className="rounded-2xl shadow-xl border-0 overflow-hidden mb-8">
                    <div className="relative">
                        {/* Cover Photo */}
                        <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                            <img
                                src={coverImage}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => navigate("/profile/edit")}
                                className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Edit profile
                            </Button>

                            {showUploader && (
                                <div className="absolute inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <ImageUploader label="اختر صورة الغلاف" onUploadSuccess={handleUploadSuccess} />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="mt-4"
                                            onClick={() => setShowUploader(false)}
                                        >
                                            إغلاق
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Profile Avatar */}
                        <div className="absolute -bottom-16 left-8">
                            <Avatar className="w-32 h-32 ring-4 ring-white shadow-2xl">
                                {user ? (
                                    <AvatarImage src={user.profile_image} />
                                ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                                        {user?.user_name?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </div>
                    </div>
                    
                    <CardContent className="pt-20 pb-8 px-8">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {user?.first_name} {user?.last_name}
                                </h1>
                                <p className="text-gray-600 text-lg mb-6">@{user?.user_name}</p>
                                
                                {/* الوصف الشخصي */}
                                {user?.description ? (
                                    <p className="text-gray-700 mb-6 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                                        {user.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600 mb-6 max-w-md">
                                        UI/UX Designer & Frontend Developer passionate about creating beautiful, 
                                        user-centered digital experiences. Coffee enthusiast ☕
                                    </p>
                                )}
                                
                                {/* المعلومات الشخصية */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                                    {renderOptionalField(user?.address, "Location", <MapPin className="w-4 h-4" />)}
                                    {renderOptionalField(user?.email, "Email", <Link className="w-4 h-4" />)}
                                    {renderOptionalField(user?.phone, "Phone", <Phone className="w-4 h-4" />)}
                                    {renderOptionalField(user?.birth_date, "Birth Date", <Calendar className="w-4 h-4" />)}
                                    {renderOptionalField(
                                        user?.created_at ? new Date(user.created_at).toLocaleDateString() : null, 
                                        "Joined", 
                                        <Calendar className="w-4 h-4" />
                                    )}
                                </div>
                                
                                <div className="flex gap-6 mt-4 text-sm">
                                    <div>
                                        <span className="font-bold">{user?.friends_count || 0}</span>
                                        <span className="text-gray-600 ml-1">Following</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {user?.id !== user?.id && (
                                    <>
                                        <Button variant="outline">
                                            <Users className="w-4 h-4 mr-2" />
                                            Add a friend
                                        </Button>
                                        <Button className="gradient-primary text-white">
                                            Message
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Tabs */}
                <Tabs defaultValue="posts" className="space-y-8">
                    <TabsList className="bg-white p-1 rounded-2xl shadow-sm border">
                        <TabsTrigger 
                            value="posts" 
                            className="rounded-xl px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                        >
                            Posts
                        </TabsTrigger>
                        <TabsTrigger 
                            value="about" 
                            className="rounded-xl px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                        >
                            About
                        </TabsTrigger>
                        <TabsTrigger 
                            value="friends" 
                            className="rounded-xl px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                        >
                            Friends
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="posts" className="space-y-6">
                        {user?.posts?.length ? (
                            user.posts.map((post: any) => (
                                <PostCard
                                    key={post.id}
                                    postId={post.id} 
                                    author={{
                                        id: post.user.id,
                                        name: post.user.user_name || "Unknown",
                                        avatar: post.user.profile_image || "",
                                        timeAgo: post.user?.created_at || "Just now",
                                    }}
                                    content={post.content}
                                    image={post.image}
                                    likes={post.likes_count || post.likes || 0}
                                    shares={post.shares || 0}
                                    comments={post.comments || []}
                                    gallery={post.gallery || []}

                                />
                            ))
                        ) : (
                            <Card className="text-center py-16 rounded-2xl shadow-sm border">
                                <CardContent>
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
                                    <p className="text-gray-600">Share your first post!</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    
                    {/* About Tab - مشابه تماماً للنسخة السابقة */}
                    <TabsContent value="about">
                        <Card className="rounded-2xl shadow-sm border">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">About {user?.user_name}</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    {/* Professional Information */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                <GraduationCap className="w-5 h-5" />
                                                Education & Qualifications
                                            </h4>
                                            
                                            {/* التعليم الأساسي */}
                                            {(user?.university || user?.graduation_year || user?.graduation_grade) && (
                                                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                                    <h5 className="font-medium text-gray-700 mb-2">University Education</h5>
                                                    <div className="space-y-1 text-gray-600">
                                                        {user?.university && <p><strong>University:</strong> {user.university}</p>}
                                                        {user?.graduation_year && <p><strong>Graduation Year:</strong> {user.graduation_year}</p>}
                                                        {user?.graduation_grade && (
                                                            <p><strong>Grade:</strong> {getGradeText(user.graduation_grade)}</p>
                                                        )}
                                                        {user?.postgraduate_degree && (
                                                            <p><strong>Postgraduate:</strong> {user.postgraduate_degree}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* شهادة التخرج */}
                                            {user?.graduation_certificate_image && (
                                                <div className="mb-4">
                                                    <h5 className="font-medium text-gray-700 mb-2">Graduation Certificate</h5>
                                                    <a 
                                                        href={user.graduation_certificate_image} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                    >
                                                        View Certificate
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* الخبرة العملية */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                <Briefcase className="w-5 h-5" />
                                                Work Experience
                                            </h4>
                                            
                                            {/* سنوات الخبرة */}
                                            {user?.experience_years && (
                                                <div className="mb-3">
                                                    <p className="text-gray-600">
                                                        <strong>{user.experience_years} years</strong> of professional experience
                                                        {user.experience && ` in ${user.experience}`}
                                                    </p>
                                                </div>
                                            )}

                                            {/* العمل السابق */}
                                            {user?.where_did_you_work && (
                                                <div className="mb-3">
                                                    <p className="text-gray-600">
                                                        <strong>Previous Work:</strong> {user.where_did_you_work}
                                                    </p>
                                                </div>
                                            )}

                                            {/* مساعد جامعي */}
                                            {user?.is_work_assistant_university && user?.assistant_university && (
                                                <div className="p-3 bg-green-50 rounded-lg">
                                                    <p className="text-green-800 font-medium">
                                                        University Assistant at {user.assistant_university}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* العيادة */}
                                        {user?.has_clinic && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                    <Building className="w-5 h-5" />
                                                    Clinic Information
                                                </h4>
                                                <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                                                    {user?.clinic_name && (
                                                        <p className="text-gray-700">
                                                            <strong>Clinic Name:</strong> {user.clinic_name}
                                                        </p>
                                                    )}
                                                    {user?.clinic_address && (
                                                        <p className="text-gray-700">
                                                            <strong>Address:</strong> {user.clinic_address}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Information */}
                                    <div className="space-y-6">
                                        {/* التخصصات */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                <Award className="w-5 h-5" />
                                                Specializations
                                            </h4>
                                            {user?.fields?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {user.fields.map((field: any) => (
                                                        <span 
                                                            key={field.id}
                                                            className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200"
                                                        >
                                                            {field.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : user?.specialization ? (
                                                <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                                                    {user.specialization}
                                                </span>
                                            ) : (
                                                <p className="text-gray-600">No specializations listed</p>
                                            )}
                                        </div>

                                        {/* المهارات */}
                                        {user?.skills?.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3 text-lg">Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.skills.map((skill: string, index: number) => (
                                                        <span 
                                                            key={index}
                                                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* الأدوات */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3 text-lg">Tools & Equipment</h4>
                                            {tools.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {tools.map((tool: string, index: number) => (
                                                        <span 
                                                            key={index}
                                                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border"
                                                        >
                                                            {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-600">No tools listed</p>
                                            )}
                                        </div>

                                        {/* الأوقات المتاحة */}
                                        {user?.available_times && user.available_times.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center gap-2">
                                                    <Clock className="w-5 h-5" />
                                                    Available Times
                                                </h4>
                                                <div className="space-y-2">
                                                    {user.available_times.map((time: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                                                            <span className="font-medium text-gray-700">{time.day}</span>
                                                            <span className="text-gray-600">
                                                                {time.from} - {time.to}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* الشهادات */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3 text-lg">Certifications</h4>
                                            {user?.course_certificates_image?.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {user.course_certificates_image.map((cert: any) => (
                                                        <div key={cert.id} className="text-center">
                                                            <img
                                                                src={cert.fullUrl}
                                                                alt={cert.name}
                                                                className="w-full h-24 object-cover rounded-lg shadow-md mb-2 hover:shadow-lg transition-shadow cursor-pointer"
                                                                onClick={() => window.open(cert.fullUrl, '_blank')}
                                                            />
                                                            <p className="text-xs text-gray-600 truncate">{cert.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-600">No certifications uploaded</p>
                                            )}
                                        </div>

                                        {/* السيرة الذاتية */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3 text-lg">Curriculum Vitae</h4>
                                            {user?.cv ? (
                                                <a 
                                                    href={user.cv} 
                                                    download 
                                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Download CV</span>
                                                </a>
                                            ) : (
                                                <p className="text-gray-600">CV not uploaded</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="friends">
                        <Card className="rounded-2xl shadow-sm border">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4">Friends</h3>
                                {loading ? (
                                    <p>Loading friends...</p>
                                ) : user?.friends?.length ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {user.friends.map((friend: any) => (
                                            <div
                                                key={friend.id}
                                                className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-smooth"
                                            >
                                                <Avatar>
                                                    <AvatarImage src={friend.profile_image} />
                                                    <AvatarFallback>{friend.user_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{friend.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        @{friend.user_name?.replace(/\s+/g, '').toLowerCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No friends found.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}