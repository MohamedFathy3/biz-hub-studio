import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/social/PostCard";
import { useState, useEffect, useContext } from "react";
import { MapPin, Link, Calendar, Users, Camera, Phone, GraduationCap, Briefcase, Building, Award, Clock, Download, Star, Megaphone } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import FriendComponent from "@/components/feed/frindereaquest"
import api from '@/lib/api'
import ImageUploader from "@/components/ImageUploader";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";

export default function Profile() {
    const { user: currentUser, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [coverImage, setCoverImage] = useState(currentUser?.cover_image);
    const [showUploader, setShowUploader] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // 🔥 Use posts directly from AuthContext
    const posts = currentUser?.posts || [];

    // 🔥 Separate regular posts from sponsored posts
    const regularPosts = posts.filter(post => !post.is_ad_request);
    const sponsoredPosts = posts.filter(post => post.is_ad_request);

    // 🔥 Update profile user when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setCoverImage(currentUser.cover_image);
        }
    }, [currentUser]);

    const handleUploadSuccess = async (imageId: number) => {
        if (!currentUser?.id) return alert("User data not found.");

        setIsUpdating(true);
        try {
            const res = await api.put(`/user/${currentUser.id}`, { cover_image_id: imageId });
            const newCoverImage = res.data?.doctor?.cover_image;
            if (newCoverImage) {
                setCoverImage(newCoverImage);
                alert("Image updated successfully!");
            } else {
                alert("Image not updated");
            }
        } catch (error: any) {
            alert(error?.response?.data?.message || "Failed to update image");
        } finally {
            setShowUploader(false);
            setIsUpdating(false);
        }
    };

    let tools = [];
    try {
        tools = JSON.parse(currentUser?.tools || "[]");
    } catch (error) {
        console.error('Error parsing tools:', error);
        tools = [];
    }

    // Function to convert graduation_grade to readable text
    const getGradeText = (grade: string) => {
        const gradeMap: { [key: string]: string } = {
            'excellent': 'Excellent',
            'very_good': 'Very Good',
            'good': 'Good',
            'pass': 'Pass'
        };
        return gradeMap[grade] || grade;
    };

    // Function to display optional fields
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

    if (!currentUser) return (
        <MainLayout>
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600">User not found</p>
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
                                Edit Profile
                            </Button>

                            {showUploader && (
                                <div className="absolute inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <ImageUploader label="Choose Cover Image" onUploadSuccess={handleUploadSuccess} />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="mt-4"
                                            onClick={() => setShowUploader(false)}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Profile Avatar */}
                        <div className="absolute -bottom-16 left-8">
                            <Avatar className="w-32 h-32 ring-4 ring-white shadow-2xl">
                                <AvatarImage src={currentUser.profile_image} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                                    {currentUser.user_name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    
                    <CardContent className="pt-20 pb-8 px-8">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {currentUser.first_name} {currentUser.last_name}
                                </h1>
                                <p className="text-gray-600 text-lg mb-6">@{currentUser.user_name}</p>
                                
                                {/* Personal Description */}
                                {currentUser.description ? (
                                    <p className="text-gray-700 mb-6 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                                        {currentUser.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600 mb-6 max-w-md">
                                        UI/UX Designer & Frontend Developer passionate about creating beautiful, 
                                        user-centered digital experiences. Coffee enthusiast ☕
                                    </p>
                                )}
                                
                                {/* Personal Information */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                                    {renderOptionalField(currentUser.address, "Location", <MapPin className="w-4 h-4" />)}
                                    {renderOptionalField(currentUser.email, "Email", <Link className="w-4 h-4" />)}
                                    {renderOptionalField(currentUser.phone, "Phone", <Phone className="w-4 h-4" />)}
                                    {renderOptionalField(currentUser.birth_date, "Birth Date", <Calendar className="w-4 h-4" />)}
                                    {renderOptionalField(
                                        currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : null, 
                                        "Joined", 
                                        <Calendar className="w-4 h-4" />
                                    )}
                                </div>
                                
                                {/* 🔥 Advanced Statistics */}
                                <div className="flex gap-6 mt-4 text-sm">
                                    <div className="text-center">
                                        <span className="font-semibold text-gray-900 block text-lg">{posts.length}</span>
                                        <span className="text-gray-600">Total Posts</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="font-semibold text-green-600 block text-lg">{regularPosts.length}</span>
                                        <span className="text-gray-600">Regular Posts</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="font-semibold text-[#039fb3] block text-lg">{sponsoredPosts.length}</span>
                                        <span className="text-gray-600">Sponsored Posts</span>
                                    </div>
                                  
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                             
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
                            Posts ({posts.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="about" 
                            className="rounded-xl px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                        >
                            About
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Posts Tab */}
                    <TabsContent value="posts" className="space-y-6">
                        {/* 🔥 Sponsored Posts Section */}
                        {sponsoredPosts.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                                    <div className="bg-[#039fb3] text-white p-2 rounded-lg">
                                        <Megaphone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Sponsored Content</h3>
                                        <p className="text-gray-600">Promoted posts and advertisements</p>
                                    </div>
                                    <div className="ml-auto bg-[#039fb3] text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {sponsoredPosts.length} Posts
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {sponsoredPosts.map((post) => (
                                        <div key={post.id} className="relative">
                                          
                                            <PostCard
                                                postId={post.id} 
                                                author={{
                                                    id: currentUser.id,
                                                    name: currentUser.user_name || "Unknown",
                                                    avatar: currentUser.profile_image || "",
                                                    timeAgo: currentUser.created_at || "Just now",
                                                }}
                                                content={post.content}
                                                image={post.image}
                                                likes={post.likes_count || 0}
                                                shares={post.shares || 0}
                                                comments={post.comments || []}
                                                gallery={post.gallery || []}
                                                is_ad_request={post.is_ad_request}
                                                is_ad_approved={post.is_ad_approved}
                                                ad_approved_at={post.ad_approved_at}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 🔥 Regular Posts Section */}
                        {regularPosts.length > 0 ? (
                            <div>
                                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border">
                                    <div className="bg-gray-600 text-white p-2 rounded-lg">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Regular Posts</h3>
                                        <p className="text-gray-600">Your personal updates and shares</p>
                                    </div>
                                    <div className="ml-auto bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {regularPosts.length} Posts
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {regularPosts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            postId={post.id} 
                                            author={{
                                                id: currentUser.id,
                                                name: currentUser.user_name || "Unknown",
                                                avatar: currentUser.profile_image || "",
                                                timeAgo: currentUser.created_at || "Just now",
                                            }}
                                            content={post.content}
                                            image={post.image}
                                            likes={post.likes_count || 0}
                                            shares={post.shares || 0}
                                            comments={post.comments || []}
                                            gallery={post.gallery || []}
                                            is_ad_request={post.is_ad_request}
                                            is_ad_approved={post.is_ad_approved}
                                            ad_approved_at={post.ad_approved_at}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : sponsoredPosts.length === 0 ? (
                            // 🔥 No posts at all
                            <Card className="text-center py-16 rounded-2xl shadow-sm border">
                                <CardContent>
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
                                    <p className="text-gray-600 mb-6">Start sharing your thoughts and experiences with the community</p>
                                    <div className="flex gap-3 justify-center">
                                        <Button 
                                            onClick={() => navigate('/dashboard')}
                                            style={{ backgroundColor: '#039fb3' }}
                                            className="flex items-center gap-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Create Your First Post
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => navigate('/dashboard?tab=sponsored')}
                                            className="flex items-center gap-2"
                                        >
                                            <Star className="w-4 h-4" />
                                            Create Sponsored Post
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}
                    </TabsContent>
                    
                    {/* About Tab */}
                    <TabsContent value="about">
                        <Card className="rounded-2xl shadow-sm border">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">About {currentUser.user_name}</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    {/* Professional Information */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                <GraduationCap className="w-5 h-5" />
                                                Education & Qualifications
                                            </h4>
                                            
                                            {/* University Education */}
                                            {(currentUser.university || currentUser.graduation_year || currentUser.graduation_grade) && (
                                                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                                    <h5 className="font-medium text-gray-700 mb-2">University Education</h5>
                                                    <div className="space-y-1 text-gray-600">
                                                        {currentUser.university && <p><strong>University:</strong> {currentUser.university}</p>}
                                                        {currentUser.graduation_year && <p><strong>Graduation Year:</strong> {currentUser.graduation_year}</p>}
                                                        {currentUser.graduation_grade && (
                                                            <p><strong>Grade:</strong> {getGradeText(currentUser.graduation_grade)}</p>
                                                        )}
                                                        {currentUser.postgraduate_degree && (
                                                            <p><strong>Postgraduate:</strong> {currentUser.postgraduate_degree}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Graduation Certificate */}
                                            {currentUser.graduation_certificate_image && (
                                                <div className="mb-4">
                                                    <h5 className="font-medium text-gray-700 mb-2">Graduation Certificate</h5>
                                                    <a 
                                                        href={currentUser.graduation_certificate_image} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                    >
                                                        View Certificate
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Work Experience */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                <Briefcase className="w-5 h-5" />
                                                Work Experience
                                            </h4>
                                            
                                            {/* Years of Experience */}
                                            {currentUser.experience_years && (
                                                <div className="mb-3">
                                                    <p className="text-gray-600">
                                                        <strong>{currentUser.experience_years} years</strong> of professional experience
                                                        {currentUser.experience && ` in ${currentUser.experience}`}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Previous Work */}
                                            {currentUser.where_did_you_work && (
                                                <div className="mb-3">
                                                    <p className="text-gray-600">
                                                        <strong>Previous Work:</strong> {currentUser.where_did_you_work}
                                                    </p>
                                                </div>
                                            )}

                                            {/* University Assistant */}
                                            {currentUser.is_work_assistant_university && currentUser.assistant_university && (
                                                <div className="p-3 bg-green-50 rounded-lg">
                                                    <p className="text-green-800 font-medium">
                                                        University Assistant at {currentUser.assistant_university}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Clinic Information */}
                                        {currentUser.has_clinic && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                    <Building className="w-5 h-5" />
                                                    Clinic Information
                                                </h4>
                                                <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                                                    {currentUser.clinic_name && (
                                                        <p className="text-gray-700">
                                                            <strong>Clinic Name:</strong> {currentUser.clinic_name}
                                                        </p>
                                                    )}
                                                    {currentUser.clinic_address && (
                                                        <p className="text-gray-700">
                                                            <strong>Address:</strong> {currentUser.clinic_address}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Information */}
                                    <div className="space-y-6">
                                        {/* Specializations */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                                <Award className="w-5 h-5" />
                                                Specializations
                                            </h4>
                                            {currentUser.fields?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {currentUser.fields.map((field: any) => (
                                                        <span 
                                                            key={field.id}
                                                            className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200"
                                                        >
                                                            {field.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : currentUser.specialization ? (
                                                <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                                                    {currentUser.specialization}
                                                </span>
                                            ) : (
                                                <p className="text-gray-600">No specializations listed</p>
                                            )}
                                        </div>

                                        {/* Skills */}
                                        {currentUser.skills?.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3 text-lg">Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {currentUser.skills.map((skill: string, index: number) => (
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

                                        {/* Tools & Equipment */}
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

                                        {/* Available Times */}
                                        {currentUser.available_times && typeof currentUser.available_times === 'string' && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center gap-2">
                                                    <Clock className="w-5 h-5" />
                                                    Available Times
                                                </h4>
                                                <div className="bg-yellow-50 p-3 rounded-lg">
                                                    <p className="text-gray-700">{currentUser.available_times}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Certifications */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3 text-lg">Certifications</h4>
                                            {currentUser.course_certificates_image?.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {currentUser.course_certificates_image.map((cert: any) => (
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

                                        {/* Curriculum Vitae */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3 text-lg">Curriculum Vitae</h4>
                                            {currentUser.cv ? (
                                                <a 
                                                    href={currentUser.cv} 
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
                </Tabs>
            </div>
        </MainLayout>
    );
}