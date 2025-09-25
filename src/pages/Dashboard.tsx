'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePost } from "@/components/social/CreatePost";
import { PostCard } from "@/components/social/PostCard";
import FriendComponent from "@/components/feed/frindereaquest";
import HomeSidebar from "@/components/social/HomeSidebar";
import { useEffect, useState } from "react";
import api from '@/lib/api';

interface Author {
  id:number;
  name: string;
  avatar?: string;
  timeAgo?: string;
}

interface Post {
  user: {id:number, user_name: string, profile_image: string, created_at: string }
  id: number;
  content: string;
  image?: string;
  likes?: number;
  shares?: number;
  comments?: any[];
  author?: Author;
  gallery: [];
}

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.post("/post/index"); // غير الرابط لو مختلف
      setPosts(res.data.data); // حسب شكل الـ API
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <MainLayout>
<div className="min-h-screen bg-gray-100">
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="flex gap-6">
      
    

      {/* Main Content - يأخذ المساحة المتبقية */}
      <div className="flex-1 max-w-2xl mx-auto">
        <CreatePost onPostCreated={(newPost) => setPosts(prev => [newPost, ...prev])} />
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading posts...</span>
          </div>
        )}
        
        <div className="space-y-6">
          {posts.length === 0 && !loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                author={{
                  id: post.user.id,
                  name: post.user?.user_name || "Unknown",
                  avatar: post.user?.profile_image || "",
                  timeAgo: post.user?.created_at || "Just now",
                }}
                content={post.content}
                image={post.image}
                likes={post.likes || 0}
                shares={post.shares || 0}
                comments={post.comments || []}
                gallery={post.gallery || []}
              />
            ))
          )}
        </div>
      </div>
  {/* Left Sidebar - ثابت على اليسار */}
      <div className="hidden lg:block w-70 flex-shrink-0">
        <div className="sticky top-20">
          <HomeSidebar />
        </div>
      </div>
      {/* Right Sidebar - على اليمين */}
      <div className="hidden xl:block w-80 flex-shrink-0">
        <div className="sticky top-20">
          <FriendComponent />
        </div>
      </div>

    </div>
  </div>
</div>
    </MainLayout>
  );
};

export default Dashboard;
