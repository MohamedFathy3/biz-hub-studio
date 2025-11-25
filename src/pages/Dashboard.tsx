'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePost } from "@/components/social/CreatePost";
import { PostCard } from "@/components/social/PostCard";
import FriendComponent from "@/components/feed/frindereaquest";
import HomeSidebar from "@/components/social/HomeSidebar";
import { useEffect, useState, useCallback } from "react";
import api from '@/lib/api';
import { RefreshCw } from "lucide-react";

interface Author {
  id: number;
  name: string;
  avatar?: string;
  timeAgo?: string;
}

interface Post {
  user: { id: number, user_name: string, profile_image: string, created_at: string }
  id: number;
  content: string;
  image?: string;
  video?: string;
  likes?: number;
  shares?: number;
  comments?: any[];
  author?: Author;
  gallery: [];
  is_ad_request?: boolean;
  is_ad_approved?: boolean;
  ad_approved_at?: string;
  likes_count?: number;
}

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      console.log("🔄 Starting to fetch posts...");
      const res = await api.post("/post/index-public");
      console.log("📦 Posts API Response:", res.data);
      
      if (res.data && res.data.data) {
        console.log(`✅ Found ${res.data.data.length} posts`);
        
        // Analyze each post content
        res.data.data.forEach((post: Post, index: number) => {
          console.log(`📝 Post ${index + 1}:`, {
            id: post.id,
            content: post.content,
            hasImage: !!post.image,
            imageUrl: post.image,
            hasVideo: !!post.video,
            videoUrl: post.video,
            galleryCount: post.gallery?.length || 0,
            isAd: post.is_ad_request,
            isAdApproved: post.is_ad_approved,
            commentsCount: post.comments?.length || 0
          });
          
          // Check video
          if (post.video) {
            console.log(`🎥 Post ${post.id} Video Details:`, {
              videoUrl: post.video,
              isDefaultVideo: post.video?.includes('default-logo.png') || post.video?.includes('default-video'),
              videoType: typeof post.video
            });
          }
          
          // Check images
          if (post.image) {
            console.log(`🖼️ Post ${post.id} Image Details:`, {
              imageUrl: post.image,
              isDefaultImage: post.image?.includes('default-logo.png') || post.image?.includes('default-image')
            });
          }
          
          // Check gallery
          if (post.gallery && post.gallery.length > 0) {
            console.log(`🖼️ Post ${post.id} Gallery:`, post.gallery);
          }
        });
        
        setPosts(res.data.data || []);
      } else {
        console.warn("⚠️ No posts data found in response");
        setPosts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    console.log("🚀 Initial posts fetch started");
    setLoading(true);
    fetchPosts().finally(() => {
      setLoading(false);
      console.log("🏁 Initial posts fetch completed");
    });
  }, [fetchPosts]);


    // Create new interval every 5 seconds
   


  const handlePostCreated = (newPost: Post) => {
    console.log("🎉 New post created:", newPost);
    setPosts(prev => [newPost, ...prev]);
    // Immediate refresh after adding new post
    setTimeout(() => {
      console.log("🔄 Refreshing posts after new post creation");
      fetchPosts();
    }, 1000);
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-4 xl:px-1 py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            
            {/* Left Sidebar - Hidden on mobile, smaller on desktop */}
            <div className="lg:w-64 xl:w-72 flex-shrink-0 order-2 lg:order-1">
              <div className="sticky top-20 space-y-4 mr-10" >
                <HomeSidebar />
              </div>
            </div>

            {/* Main Content - Takes most space */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">
              <div className="space-y-4 lg:space-y-6">
                
                {/* Header with Refresh Button - Hidden on mobile */}
                <div className="hidden sm:flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Newsfeed</h1>
                    <p className="text-gray-600">Latest updates from your community</p>
                  </div>
                  <button 
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#039fb3] hover:bg-[#0288a1] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Mobile Header */}
                <div className="sm:hidden bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Newsfeed</h1>
                      <p className="text-gray-600 text-sm">Latest updates</p>
                    </div>
                    <button 
                      onClick={handleManualRefresh}
                      disabled={loading}
                      className="p-2 bg-[#039fb3] hover:bg-[#0288a1] text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

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

                {/* Posts List - Full width */}
                <div className="space-y-4">
                  {posts.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="text-7xl mb-6">📝</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">No posts yet</h3>
                      <p className="text-gray-500 text-lg max-w-md mx-auto">
                        Be the first to share something with the community!
                      </p>
                    </div>
                  ) : (
                    posts.map((post) => {
                      console.log(`🎨 Rendering Post ${post.id}:`, {
                        hasVideo: !!post.video,
                        videoUrl: post.video,
                        hasImage: !!post.image,
                        isAd: post.is_ad_request,
                        isAdApproved: post.is_ad_approved
                      });

                      return (
                        <div 
                          key={post.id} 
                          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                          <PostCard
                            postId={post.id}
                            author={{
                              id: post.user.id,
                              name: post.user?.user_name || "Unknown User",
                              avatar: post.user?.profile_image || "/default-avatar.png",
                              timeAgo: "Just now",
                            }}
                            content={post.content}
                            image={post.image}
                            video={post.video}
                            shares={post.shares || 0}
                            comments={post.comments || []}
                            gallery={post.gallery || []}
                            is_ad_request={post.is_ad_request}
                            is_ad_approved={post.is_ad_approved}
                            ad_approved_at={post.ad_approved_at}
                              likes={post.likes_count || post.likes || 0}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Hidden on mobile, smaller on desktop */}
            <div className="md:hidden lg:w-64 xl:w-72 flex-shrink-0 order-3  lg:hidden">
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