import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/social/PostCard";
import { 
  MapPin, 
  Link, 
  Calendar, 
  Users, 
  UserPlus, 
  MessageCircle, 
  Phone, 
  GraduationCap,
  Briefcase,
  Building,
  Award,
  Clock,
  Download,
  UserCheck,
  UserX,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/Context/AuthContext";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, onValue, off, update, set } from 'firebase/database';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "accepted" | "friends">("none");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  const isOwnProfile = currentUser?.id === parseInt(id || "0");

  // دالة علشان نعمل room ID فريد للصداقات
  const generateFriendshipId = (userId1: number, userId2: number) => {
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  };

  // 🔥 الاستماع لحالة الصداقة من Firebase
  useEffect(() => {
    if (!currentUser || !id) return;

    const friendshipId = generateFriendshipId(currentUser.id, parseInt(id));
    const friendshipRef = ref(db, `friendships/${friendshipId}`);
    
    const unsubscribe = onValue(friendshipRef, (snapshot) => {
      if (snapshot.exists()) {
        const friendshipData = snapshot.val();
        setFriendStatus(friendshipData.status || 'none');
      } else {
        setFriendStatus('none');
      }
    });

    return () => {
      off(friendshipRef);
    };
  }, [currentUser, id]);

  useEffect(() => {
    if (!id) return;
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get(`/user/${id}`);
        console.log("Profile Data:", profileRes.data);

        if (profileRes.data.data) {
          setProfile(profileRes.data.data);
        } else {
          setProfile(null);
        }
        
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  // 🔥 إرسال طلب صداقة مع Firebase
  const sendFriendRequest = async () => {
    if (!id || !currentUser || !profile) return;
    
    try {
      const friendshipId = generateFriendshipId(currentUser.id, parseInt(id));
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      const friendRequestData = {
        user1_id: currentUser.id,
        user1_name: currentUser.user_name,
        user1_image: currentUser.profile_image,
        user2_id: parseInt(id),
        user2_name: profile.user_name,
        user2_image: profile.profile_image,
        status: 'pending',
        requested_by: currentUser.id,
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await set(friendshipRef, friendRequestData);

      // نرسل إشعار للـ backend علشان التوثيق
      await api.post(`/friend-requests/${id}`);
      
      toast.success("Friend request sent successfully!");

    } catch (error: any) {
      console.error("Failed to send friend request:", error);
      const errorMessage = error.response?.data?.message || "Failed to send friend request";
      toast.error(errorMessage);
    }
  };

  // 🔥 قبول طلب صداقة
  const acceptFriendRequest = async () => {
    if (!id || !currentUser) return;
    
    try {
      const friendshipId = generateFriendshipId(currentUser.id, parseInt(id));
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      await update(friendshipRef, {
        status: 'friends',
        updated_at: Date.now(),
        accepted_at: Date.now()
      });

      // نرسل للـ backend علشان التوثيق
      await api.put(`/friend-requests/${id}/accept`);

      toast.success("Friend request accepted!");

    } catch (error: any) {
      console.error("Failed to accept friend request:", error);
      try {
        await api.post(`/friend-requests/${id}/accept`);
        toast.success("Friend request accepted!");
      } catch (secondError) {
        toast.error("Failed to accept friend request");
      }
    }
  };

  // 🔥 رفض طلب صداقة
  const rejectFriendRequest = async () => {
    if (!id || !currentUser) return;
    
    try {
      const friendshipId = generateFriendshipId(currentUser.id, parseInt(id));
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      await update(friendshipRef, {
        status: 'rejected',
        updated_at: Date.now(),
        rejected_at: Date.now()
      });

      // نرسل للـ backend علشان التوثيق
      await api.put(`/friend-requests/${id}/reject`);

      toast.success("Friend request rejected");

    } catch (error: any) {
      console.error("Failed to reject friend request:", error);
      try {
        await api.post(`/friend-requests/${id}/reject`);
        toast.success("Friend request rejected");
      } catch (secondError) {
        toast.error("Failed to reject friend request");
      }
    }
  };

  // 🔥 إلغاء طلب الصداقة
  const cancelFriendRequest = async () => {
    if (!id || !currentUser) return;
    
    try {
      const friendshipId = generateFriendshipId(currentUser.id, parseInt(id));
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      // نحذف طلب الصداقة
      await set(friendshipRef, null);

      toast.success("Friend request cancelled");

    } catch (error: any) {
      console.error("Failed to cancel friend request:", error);
      toast.error("Failed to cancel friend request");
    }
  };

  // 🔥 إزالة صديق
  const removeFriend = async () => {
    if (!id || !currentUser) return;
    
    try {
      const friendshipId = generateFriendshipId(currentUser.id, parseInt(id));
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      // نحذف الصداقة
      await set(friendshipRef, null);

      // نرسل للـ backend علشان التوثيق
      await api.delete(`/friends/${id}`);

      toast.success("Friend removed successfully");

    } catch (error: any) {
      console.error("Failed to remove friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  // دالة فتح الشات مع المستخدم
  const handleSendMessage = () => {
    if (!profile) return;
    navigate(`/messages?user_id=${profile.id}`);
  };

  // نظام المشاركة مع الأصدقاء
  const fetchFriends = async () => {
    try {
      const res = await api.get("/friends");
      if (res.data && res.data.data) {
        setFriends(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleShareWithFriends = async () => {
    try {
      await Promise.all(
        selectedFriends.map(friendId => 
          api.post(`/friend-requests/${friendId}/share`, {
            message: `Check out ${profile.user_name}'s profile!`,
            profile_url: window.location.href
          })
        )
      );

      setShowShareDialog(false);
      setSelectedFriends([]);
      toast.success("Profile shared successfully with friends!");
    } catch (error) {
      console.error("Error sharing profile:", error);
      try {
        await Promise.all(
          selectedFriends.map(friendId => 
            api.post(`/friend-requests/${friendId}`, {
              message: `Check out ${profile.user_name}'s profile! ${window.location.href}`
            })
          )
        );
        setShowShareDialog(false);
        setSelectedFriends([]);
        toast.success("Profile shared successfully with friends!");
      } catch (secondError) {
        toast.error("Error sharing profile");
      }
    }
  };

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

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
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span className="font-medium">{label}:</span>
        <span>{value}</span>
      </div>
    );
  };

  // 🔥 دالة علشان نعرف مين اللي أرسل طلب الصداقة
  const getRequestSender = () => {
    if (!currentUser || !id) return null;
    
    const friendshipId = generateFriendshipId(currentUser.id, parseInt(id));
    const friendshipRef = ref(db, `friendships/${friendshipId}`);
    
    let sender = null;
    onValue(friendshipRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        sender = data.requested_by;
      }
    }, { onlyOnce: true });
    
    return sender;
  };

  const renderFriendButton = () => {
    if (isOwnProfile) {
      return (
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              setShowShareDialog(true);
              fetchFriends();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        </div>
      );
    }

    switch (friendStatus) {
      case "none":
        return (
          <div className="flex gap-3">
            <Button 
              onClick={sendFriendRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friend
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        );
      
      case "pending":
        const requestedBy = getRequestSender();
        const isSentByMe = requestedBy === currentUser?.id;
        
        if (isSentByMe) {
          return (
            <div className="flex gap-3">
              <Button 
                disabled
                className="bg-yellow-600 text-white px-6 py-2 rounded-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Request Sent
              </Button>
              <Button 
                onClick={cancelFriendRequest}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded-full"
              >
                <UserX className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          );
        } else {
          return (
            <div className="flex gap-3">
              <Button 
                onClick={acceptFriendRequest}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Accept Request
              </Button>
              <Button 
                onClick={rejectFriendRequest}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded-full"
              >
                <UserX className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={handleSendMessage}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          );
        }

      case "friends":
        return (
          <div className="flex gap-3">
            <Button 
              disabled
              className="bg-green-600 text-white px-6 py-2 rounded-full"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Friends
            </Button>
            <Button 
              onClick={removeFriend}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded-full"
            >
              <UserX className="w-4 h-4 mr-2" />
              Remove
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="flex gap-3">
            <Button 
              onClick={sendFriendRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friend
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        );
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </MainLayout>
  );
  
  if (!profile) return (
    <MainLayout>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">User not found</h2>
        <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
      </div>
    </MainLayout>
  );

  let tools = [];
  try {
    tools = JSON.parse(profile.tools || "[]");
  } catch {
    tools = [];
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Cover & Profile Section */}
        <Card className="rounded-2xl shadow-xl border-0 overflow-hidden mb-8">
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
              {profile.cover_image ? (
                <img
                  src={profile.cover_image}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
              )}
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Profile Avatar */}
            <div className="absolute -bottom-16 left-8">
              <Avatar className="w-32 h-32 ring-4 ring-white shadow-2xl">
                <AvatarImage src={profile.profile_image} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {profile.user_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {friendStatus === "friends" && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Friend
                    </span>
                  )}
                  {friendStatus === "pending" && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Request Pending
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-lg mb-6">@{profile.user_name}</p>
                
                {/* المعلومات الشخصية */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  {renderOptionalField(profile.email, "Email", <Link className="w-4 h-4" />)}
                  {renderOptionalField(profile.phone, "Phone", <Phone className="w-4 h-4" />)}
                  {renderOptionalField(profile.birth_date, "Birth Date", <Calendar className="w-4 h-4" />)}
                  {renderOptionalField(
                    new Date(profile.created_at).toLocaleDateString(), 
                    "Joined", 
                    <Calendar className="w-4 h-4" />
                  )}
                  {renderOptionalField(profile.address, "Address", <MapPin className="w-4 h-4" />)}
                </div>

                {/* الوصف الشخصي */}
                {profile.description && (
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                      {profile.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {renderFriendButton()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* باقي الكود بدون تغيير */}
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
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {profile.posts?.length ? (
              profile.posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  author={{
                    id: post.user.id,
                    name: `${post.user.first_name} ${post.user.last_name}`,
                    avatar: post.user.profile_image,
                    timeAgo: post.created_at,
                  }}
                  content={post.content}
                  image={post.image}
                  shares={post.shares || 0}
                  comments={post.comments || []}
                  gallery={post.gallery || []}
                  likes={post.likes_count || post.likes || 0}

                />
              ))
            ) : (
              <Card className="text-center py-16 rounded-2xl shadow-sm border">
                <CardContent>
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Share your first post!" : `${profile.user_name} hasn't posted anything yet.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">About {profile.first_name}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Professional Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Education & Qualifications
                      </h4>
                      
                      {/* التعليم الأساسي */}
                      {(profile.university || profile.graduation_year || profile.graduation_grade) && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-2">University Education</h5>
                          <div className="space-y-1 text-gray-600">
                            {profile.university && <p><strong>University:</strong> {profile.university}</p>}
                            {profile.graduation_year && <p><strong>Graduation Year:</strong> {profile.graduation_year}</p>}
                            {profile.graduation_grade && (
                              <p><strong>Grade:</strong> {getGradeText(profile.graduation_grade)}</p>
                            )}
                            {profile.postgraduate_degree && (
                              <p><strong>Postgraduate:</strong> {profile.postgraduate_degree}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* شهادة التخرج */}
                      {profile.graduation_certificate_image && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Graduation Certificate</h5>
                          <a 
                            href={profile.graduation_certificate_image} 
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
                      {profile.experience_years && (
                        <div className="mb-3">
                          <p className="text-gray-600">
                            <strong>{profile.experience_years} years</strong> of professional experience
                            {profile.experience && ` in ${profile.experience}`}
                          </p>
                        </div>
                      )}

                      {/* العمل السابق */}
                      {profile.where_did_you_work && (
                        <div className="mb-3">
                          <p className="text-gray-600">
                            <strong>Previous Work:</strong> {profile.where_did_you_work}
                          </p>
                        </div>
                      )}

                      {/* مساعد جامعي */}
                      {profile.is_work_assistant_university && profile.assistant_university && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-green-800 font-medium">
                            University Assistant at {profile.assistant_university}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* العيادة */}
                    {profile.has_clinic && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                          <Building className="w-5 h-5" />
                          Clinic Information
                        </h4>
                        <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                          {profile.clinic_name && (
                            <p className="text-gray-700">
                              <strong>Clinic Name:</strong> {profile.clinic_name}
                            </p>
                          )}
                          {profile.clinic_address && (
                            <p className="text-gray-700">
                              <strong>Address:</strong> {profile.clinic_address}
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
                      {profile.fields?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.fields.map((field: any) => (
                            <span 
                              key={field.id}
                              className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200"
                            >
                              {field.name}
                            </span>
                          ))}
                        </div>
                      ) : profile.specialization ? (
                        <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                          {profile.specialization}
                        </span>
                      ) : (
                        <p className="text-gray-600">No specializations listed</p>
                      )}
                    </div>

                    {/* المهارات */}
                    {profile.skills?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 text-lg">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill: string, index: number) => (
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
                    {profile.available_times && profile.available_times.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Available Times
                        </h4>
                        <div className="space-y-2">
                          {profile.available_times.map((time: any, index: number) => (
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
                      {profile.course_certificates_image?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {profile.course_certificates_image.map((cert: any) => (
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
                      {profile.cv ? (
                        <a 
                          href={profile.cv} 
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

        {/* Share Dialog - نفس الكود السابق */}
        {showShareDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Profile with Friends
              </h3>
              
              <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFriends.includes(friend.id)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={friend.profile_image} />
                      <AvatarFallback>{friend.user_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium">{friend.user_name}</span>
                    {selectedFriends.includes(friend.id) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleShareWithFriends}
                  disabled={selectedFriends.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Share with {selectedFriends.length} friend(s)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}