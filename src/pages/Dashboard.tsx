// pages/Dashboard.tsx
'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePost } from "@/components/social/CreatePost";
import { PostCard } from "@/components/social/PostCard";
import FriendComponent from "@/components/feed/frindereaquest";
import HomeSidebar from "@/components/social/HomeSidebar";
import { useEffect, useState, useCallback, useContext } from "react";
import api from '@/lib/api';
import { RefreshCw } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import toast from 'react-hot-toast';

interface Author {
  id: number;
  name: string;
  avatar?: string;
  timeAgo?: string;
}

interface Post {
  user: { 
    id: number; 
    user_name: string; 
    profile_image: string; 
    created_at: string; 
  };
  id: number;
  content: string;
  image?: string;
  video?: string;
  likes?: number;
  shares?: number;
  comments?: any[];
  author?: Author;
  gallery: any[];
  is_ad_request?: boolean;
  is_ad_approved?: boolean;
  ad_approved_at?: string;
  likes_count?: number;
}

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: authUser, updateUserPosts, refreshUser } = useContext(AuthContext); // 🔥 نضيف الدوال الجديدة

  // Function to fetch posts from API only
  const fetchPosts = useCallback(async () => {
    try {
      console.log("🔄 Starting to fetch posts from API...");
      setLoading(true);
      const res = await api.post("/post/index-public");
      console.log("📦 Posts API Response:", res.data);
      
      if (res.data && res.data.data) {
        console.log(`✅ Found ${res.data.data.length} posts from API`);
        
        // Format API posts safely
        const safeApiPosts = res.data.data.map((post: any) => ({
          ...post,
          content: String(post.content || ""),
          user: {
            ...post.user,
            user_name: String(post.user?.user_name || "Unknown User"),
            profile_image: String(post.user?.profile_image || "")
          },
          comments: Array.isArray(post.comments) ? post.comments : [],
          gallery: Array.isArray(post.gallery) ? post.gallery : [],
          likes_count: Number(post.likes_count || post.likes || 0)
        }));
        
        setPosts(safeApiPosts);
      } else {
        console.warn("⚠️ No posts data found in API response");
        setPosts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching posts from API:", err);
      toast.error("Error loading posts");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    console.log("🚀 Initial posts fetch started");
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = async (newPost: Post) => {
    console.log("🎉 New post created:", newPost);
    
    try {
      // Add to local state immediately for better UX
      const postWithUser = {
        ...newPost,
        id: newPost.id || Date.now(),
        timestamp: Date.now(),
        user: {
          id: authUser?.id || 0,
          user_name: authUser?.user_name || "Unknown",
          profile_image: authUser?.profile_image || "",
          created_at: authUser?.created_at || "Just now"
        },
        likes_count: 0,
        comments: [],
        gallery: []
      };

      setPosts(prev => [postWithUser, ...prev]);
      
      toast.success("Post created successfully!");
      
      // 🔥 نحدث الـ user posts في الـ AuthContext
      if (authUser) {
        updateUserPosts(postWithUser);
      }
      
      // 🔥 نعمل refresh للبيانات علشان نتأكد من السينك
      setTimeout(() => {
        refreshUser();
      }, 1000);
      
    } catch (error) {
      console.error("Error adding post:", error);
      // Fallback: just add to local state
      setPosts(prev => [newPost, ...prev]);
      toast.success("Post created!");
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  };

  // 🔥 Validate posts before rendering
  const validatedPosts = posts.map(post => ({
    ...post,
    content: String(post.content || ''),
    user: {
      ...post.user,
      user_name: String(post.user?.user_name || "Unknown User"),
      profile_image: String(post.user?.profile_image || "/default-avatar.png")
    },
    comments: Array.isArray(post.comments) ? post.comments : [],
    gallery: Array.isArray(post.gallery) ? post.gallery : [],
    likes_count: Number(post.likes_count || post.likes || 0)
  }));

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-4 xl:px-1 py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            
            {/* Left Sidebar */}
            <div className="lg:w-64 xl:w-72 flex-shrink-0 order-2 lg:order-1">
              <div className="sticky top-20 space-y-4 mr-10">
                <HomeSidebar />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">
              <div className="space-y-4 lg:space-y-6">
                
                {/* Header with Refresh Button */}
          

               
                {/* Create Post */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                  <CreatePost onPostCreated={handlePostCreated} />
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039fb3] mb-4"></div>
                    <span className="text-gray-600 font-medium text-lg">Loading posts...</span>
                  </div>
                )}

                {/* Posts List */}
                <div className="space-y-4">
                  {validatedPosts.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="text-7xl mb-6">📝</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">No posts yet</h3>
                      <p className="text-gray-500 text-lg max-w-md mx-auto">
                        Be the first to share something with the community!
                      </p>
                    </div>
                  ) : (
                    validatedPosts.map((post) => (
                      <div 
                        key={post.id} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
                      >
                        <PostCard
                          postId={post.id}
                          author={{
                            id: post.user.id,
                            name: String(post.user.user_name),
                            avatar: String(post.user.profile_image || "/default-avatar.png"),
                            timeAgo: "Just now",
                          }}
                          content={String(post.content)}
                          image={post.image}
                          video={post.video}
                          shares={post.shares || 0}
                          comments={post.comments}
                          gallery={post.gallery}
                          is_ad_request={post.is_ad_request}
                          is_ad_approved={post.is_ad_approved}
                          ad_approved_at={post.ad_approved_at}
                          likes={post.likes_count || post.likes || 0}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="md:hidden lg:w-64 xl:w-72 flex-shrink-0 order-3 lg:hidden">
              <div className="sticky top-20 space-y-4">
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