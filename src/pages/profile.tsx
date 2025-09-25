import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/social/PostCard";
import { useState } from "react";

import { MapPin, Link, Calendar, Users, Camera } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import FriendComponent from "@/components/feed/frindereaquest"
import { useContext } from "react";
import api from '@/lib/api'
import ImageUploader from "@/components/ImageUploader";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/Context/AuthContext";


// const formattedDate = new Date(user.created_at).toLocaleDateString();


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
      setCoverImage(newCoverImage); // تحديث الغلاف فورًا
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

let tools = null;
try {
  tools = JSON.parse(user.tools);
} catch (error) {
  console.error('Error parsing tools:', error);
  tools = null;
}


  return (
    <MainLayout>
     

    <div className="max-w-10xl mx-34 p-6">
      {/* Cover Photo & Profile Info */}

      <Card className="glass shadow-glass border-glass-border mb-6">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary to-blue-600 rounded-t-lg relative overflow-hidden">
              <img
      src={coverImage}  // استخدم coverImage هنا بدلاً من user?.cover_image
      alt="Cover"
      className="w-full h-full object-cover opacity-80"
    />
      <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => navigate("/profile/edit")} // تغيير هنا
                            className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm border-white/20"
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
          <div className="absolute -bottom-16 left-6">
            <Avatar className="w-32 h-32 ring-4 ring-background">
{user ? (
  <AvatarImage src={user.profile_image} />
) : (
  <AvatarFallback className="text-2xl">JD</AvatarFallback>
)}
            </Avatar>
          </div>
        </div>
        
        <CardContent className="pt-20 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{user?.first_name}</h1>
              <p className="text-muted-foreground mb-4">@{user?.user_name}</p>
              <p className="text-sm mb-4 max-w-md">
                UI/UX Designer & Frontend Developer passionate about creating beautiful, 
                user-centered digital experiences. Coffee enthusiast ☕
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  cairo
                </div>
                <div className="flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {user.created_at}
                </div>
              </div>
              
              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <span className="font-bold">{user.friends_count}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
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
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="glass border-glass-border">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6">
          {user.posts.map((post, index) => (
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
  likes={post.likes || 0}
  shares={post.shares || 0}
  comments={post.comments || []}
  gallery={post.gallery || []} // ← مهم إضافة هذا
            />
          ))}
        </TabsContent>
        
     <TabsContent value="about">
  <Card className="glass shadow-glass border-glass-border">
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4">About {user.user_name}</h3>
      <div className="space-y-4">
        
        {/* Work */}
        <div>
          <h4 className="font-medium mb-2">Work</h4>
          <p className="text-muted-foreground">
            {user.is_work_assistant_university ? "University Assistant at " + user.assistant_university : "No current work assistant position"}
          </p>
        </div>
        
        {/* Education */}
        <div>
          <h4 className="font-medium mb-2">Education</h4>
          <p className="text-muted-foreground">
            {user.graduation_grade} Graduate from {user.university} with a Master's degree in {user.specialization} ({user.graduation_year})
          </p>
        </div>
        
        {/* Clinic */}
        <div>
          <h4 className="font-medium mb-2">Clinic</h4>
          <p className="text-muted-foreground">
            Clinic Name: {user.clinic_name} located at {user.clinic_address}
          </p>
        </div>
        
        {/* Experience */}
        <div>
          <h4 className="font-medium mb-2">Experience</h4>
          <p className="text-muted-foreground">
            {user.experience_years} years of experience in dentistry.
          </p>
        </div>
        
        {/* Available Times */}
        <div>
          <h4 className="font-medium mb-2">Available Times</h4>
          <p className="text-muted-foreground">
            Available on: {user.available_times}
          </p>
        </div>
        
        {/* Specializations */}
        <div>
          <h4 className="font-medium mb-2">Specializations</h4>
          <ul className="list-disc ml-5 text-muted-foreground">
  <li>{user.specialization}</li>
</ul>

        </div>
        
        {/* Tools */}
        <div>
          <h4 className="font-medium mb-2">Tools</h4>
     {tools && tools.length > 0 ? (
  <ul className="list-disc ml-5 text-muted-foreground">
    {tools.map((tool, index) => (
      <li key={index}>{tool}</li>
    ))}
  </ul>
) : null}

        </div>

        {/* Certifications */}
        <div>
          <h4 className="font-medium mb-2">Certifications</h4>
          <div className="grid grid-cols-2 gap-4">
            {user.course_certificates_image.map(cert => (
              <img
                key={cert.id}
                src={cert.fullUrl}
                alt={cert.name}
                className="w-full rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
     <div className="flex flex-col items-center space-y-4">
  <h2 className="text-xl font-semibold text-gray-800">Download CV</h2>
  <a href={user.cv} download>
    <button className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300">
      Download CV
    </button>
  </a>
</div>

      </div>
    </CardContent>
  </Card>
</TabsContent>

        
      
        
 <TabsContent value="friends">
  <Card className="glass shadow-glass border-glass-border">
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4">Friends</h3>
      {loading ? (
        <p>Loading friends...</p>
      ) : user?.friends?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {user.friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-3 bg-black text-white rounded-lg hover:bg-accent/80 transition-smooth"
            >
              <Avatar>
                <AvatarImage src={friend.profile_image} />
                <AvatarFallback>{friend.user_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{friend.user_name}</p>
                <p className="text-xs text-muted-foreground">
                  @{friend.user_name.replace(/\s+/g, '').toLowerCase()}
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