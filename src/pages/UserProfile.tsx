import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/social/PostCard";
import { MapPin, Link, Calendar, Users } from "lucide-react";

export default function UserProfile() {
  const { id } = useParams(); // ناخد id من الرابط
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
  const fetchUser = async () => {
  try {
    const res = await api.get(`/user/${id}`);
    console.log("API Response:", res.data);
    setProfile(res.data.data); // ✅ الصح
  } catch (error) {
    console.error("Failed to fetch user:", error);
  } finally {
    setLoading(false);
  }
};

    fetchUser();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>User not found.</div>;

  let tools = null;
  try {
    tools = JSON.parse(profile.tools);
  } catch {
    tools = null;
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-24 p-6">
        <Card className="glass shadow-glass border-glass-border mb-6">
          <div className="relative">
            {/* Cover */}
            <div className="h-48 bg-gradient-to-r from-primary to-blue-600 rounded-t-lg relative overflow-hidden">
              <img
                src={profile.cover_image}
                alt="Cover"
                className="w-full h-full object-cover opacity-80"
              />
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-16 left-6">
              <Avatar className="w-32 h-32 ring-4 ring-background">
                <AvatarImage src={profile.profile_image} />
                <AvatarFallback>
                  {profile.user_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="pt-20 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.first_name}</h1>
                <p className="text-muted-foreground mb-4">@{profile.user_name}</p>
                <p className="text-sm mb-4 max-w-md">
                  {profile.bio || "No bio available."}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city || "Egypt"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link className="w-4 h-4" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {profile.created_at}
                  </div>
                </div>

                <div className="flex gap-6 mt-4 text-sm">
                  <div>
                    <span className="font-bold">{profile.friends_count}</span>
                    <span className="text-muted-foreground ml-1">Friends</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
                <Button className="gradient-primary text-white">
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="glass border-glass-border">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          {/* Posts */}
          <TabsContent value="posts" className="space-y-6">
            {profile.posts?.length ? (
              profile.posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  author={{
                    id:post.user.id,
                    name: post.user.user_name,
                    avatar: post.user.profile_image,
                    timeAgo: post.user?.created_at || "Just now",
                  }}
                  content={post.content}
                  image={post.image}
                  likes={post.likes || 0}
                  shares={post.shares || 0}
                  comments={post.comments || []}
                />
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </TabsContent>

          {/* About */}
        <TabsContent value="about">
  <Card className="glass shadow-glass border-glass-border">
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4">About {profile?.user_name || "Unknown"}</h3>
      <div className="space-y-4">
        
        {/* Work */}
        <div>
          <h4 className="font-medium mb-2">Work</h4>
          <p className="text-muted-foreground">
            {profile?.is_work_assistant_university
              ? `University Assistant at ${profile?.assistant_university || "N/A"}`
              : "No current work assistant position"}
          </p>
        </div>
        
        {/* Education */}
        <div>
          <h4 className="font-medium mb-2">Education</h4>
          <p className="text-muted-foreground">
            {profile?.graduation_grade
              ? `${profile.graduation_grade} Graduate from ${profile?.university || "Unknown University"} with a ${profile?.postgraduate_degree || "Degree"} in ${profile?.specialization || "Specialization"} (${profile?.graduation_year || "N/A"})`
              : "No education details available"}
          </p>
        </div>
        
        {/* Clinic */}
        <div>
          <h4 className="font-medium mb-2">Clinic</h4>
          <p className="text-muted-foreground">
            {profile?.has_clinic
              ? `Clinic Name: ${profile?.clinic_name || "N/A"} located at ${profile?.clinic_address || "N/A"}`
              : "No clinic information available"}
          </p>
        </div>
        
        {/* Experience */}
        <div>
          <h4 className="font-medium mb-2">Experience</h4>
          <p className="text-muted-foreground">
            {profile?.experience_years
              ? `${profile.experience_years} years of experience in dentistry.`
              : "Experience not specified"}
          </p>
        </div>
        
        {/* Available Times */}
        <div>
          <h4 className="font-medium mb-2">Available Times</h4>
          <p className="text-muted-foreground">
            {profile?.available_times || "No available times provided"}
          </p>
        </div>
        
        {/* Specializations */}
        <div>
          <h4 className="font-medium mb-2">Specializations</h4>
          {profile?.specialization ? (
            <ul className="list-disc ml-5 text-muted-foreground">
              <li>{profile.specialization}</li>
            </ul>
          ) : (
            <p className="text-muted-foreground">No specializations available</p>
          )}
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
          ) : (
            <p className="text-muted-foreground">No tools listed</p>
          )}
        </div>

        {/* Certifications */}
        <div>
          <h4 className="font-medium mb-2">Certifications</h4>
          {profile?.course_certificates_image?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {profile.course_certificates_image.map(cert => (
                <img
                  key={cert.id}
                  src={cert.fullUrl}
                  alt={cert.name}
                  className="w-full rounded-lg shadow-md"
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No certifications uploaded</p>
          )}
        </div>

        {/* CV */}
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Download CV</h2>
          {profile?.cv ? (
            <a href={profile.cv} download>
              <button className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300">
                Download CV
              </button>
            </a>
          ) : (
            <p className="text-muted-foreground">CV not uploaded</p>
          )}
        </div>

      </div>
    </CardContent>
  </Card>
</TabsContent>


          {/* Friends */}
          <TabsContent value="friends">
            <Card className="glass shadow-glass border-glass-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Friends</h3>
                {profile.friends?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.friends.map((friend: any) => (
                      <div
                        key={friend.id || 'N?A'}
                        className="flex items-center gap-3 p-3 bg-black text-white rounded-lg hover:bg-accent/80 transition-smooth"
                      >
                        <Avatar>
                          <AvatarImage src={friend.profile_image || 'N?N'} />
                          <AvatarFallback>
                            {friend.user_name[0] || 'N?N'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{friend.user_name|| 'N?N'}</p>
                          <p className="text-xs text-muted-foreground">
                            @{friend.user_name.replace(/\s+/g, "").toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No friends found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
