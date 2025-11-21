'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Users,
  Send
} from "lucide-react";

interface VideoPost {
  id: number;
  user: {
    id: number;
    user_name: string;
    profile_image: string;
    created_at: string;
    updated_at: string;
  };
  content: string;
  image?: string;
  video: string;
  gallery: any[];
  comments: any[];
  is_ad_request: boolean;
  is_ad_approved: boolean | null;
  ad_approved_at: string | null;
  likes_count?: number;
  has_liked?: boolean;
}

interface Friend {
  id: number;
  user_name: string;
  profile_image: string;
}

const VideoReelsPage = () => {
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  // New states for comments and sharing
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch video posts
  const fetchVideoPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/posts/with-video");
      
      if (res.data && res.data.data) {
        console.log("🎥 Found video posts:", res.data.data.length);
        const postsWithLikes = await Promise.all(
          res.data.data.map(async (post: VideoPost) => {
            try {
              const likeRes = await api.get(`/posts/${post.id}/like-status`);
              return {
                ...post,
                likes_count: likeRes.data?.likesCount || post.comments?.filter(c => c.reaction === 'like').length || 0,
                has_liked: likeRes.data?.hasLiked || false
              };
            } catch (error) {
              return {
                ...post,
                likes_count: post.comments?.filter(c => c.reaction === 'like').length || 0,
                has_liked: false
              };
            }
          })
        );
        setVideoPosts(postsWithLikes);
        setHasMore(res.data.data.length > 0);
      }
    } catch (err) {
      console.error("❌ Error fetching video posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch friends list
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

  useEffect(() => {
    fetchVideoPosts();
    fetchFriends();
  }, [fetchVideoPosts]);

  // Handle video play/pause
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play().catch(console.error);
      } else {
        currentVideo.pause();
      }
    }
  }, [currentIndex, isPlaying]);

  // Auto-play when video is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target as HTMLVideoElement;
            video.play().catch(console.error);
            setIsPlaying(true);
          } else {
            const video = entry.target as HTMLVideoElement;
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videoPosts]);

  // Handle scroll for navigation
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY > 0) {
      // Scroll down - next video
      setCurrentIndex(prev => Math.min(prev + 1, videoPosts.length - 1));
    } else {
      // Scroll up - previous video
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  }, [videoPosts.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setCurrentIndex(prev => Math.min(prev + 1, videoPosts.length - 1));
    } else if (e.key === 'ArrowUp') {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPlaying(prev => !prev);
    } else if (e.key === 'm') {
      setIsMuted(prev => !prev);
    }
  }, [videoPosts.length]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  // Reset video when changing index
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.currentTime = 0;
        video.pause();
      }
    });
  }, [currentIndex]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextVideo = () => {
    setCurrentIndex(prev => Math.min(prev + 1, videoPosts.length - 1));
  };

  const prevVideo = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  // Handle Like function
  const handleLike = async (postId: number) => {
    try {
      const currentPost = videoPosts[currentIndex];
      const newHasLiked = !currentPost.has_liked;
      const newLikesCount = newHasLiked 
        ? (currentPost.likes_count || 0) + 1 
        : Math.max(0, (currentPost.likes_count || 0) - 1);

      // Optimistic update
      setVideoPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, has_liked: newHasLiked, likes_count: newLikesCount }
          : post
      ));

      // API call
      await api.post(`/posts/${postId}/like`);

    } catch (error) {
      console.error("Error liking post:", error);
      // Revert optimistic update on error
      setVideoPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, has_liked: !newHasLiked, likes_count: currentPost.likes_count }
          : post
      ));
    }
  };

  // Handle Add Comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const currentPostId = videoPosts[currentIndex]?.id;

      await api.post("/create-comment", {
        post_id: currentPostId,
        content: newComment,
        reaction: null
      });

      setNewComment("");
      // Refresh comments
      const updatedPosts = await fetchVideoPosts();
      
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle Share with Friends
  const handleShareWithFriends = async () => {
    try {
      const currentPostId = videoPosts[currentIndex]?.id;
      
      // Send friend requests to selected friends with the post
      await Promise.all(
        selectedFriends.map(friendId => 
          api.post(`/friend-requests/${friendId}`, {
            post_id: currentPostId
          })
        )
      );

      setShowShareDialog(false);
      setSelectedFriends([]);
      alert("Post shared successfully with selected friends!");
      
    } catch (error) {
      console.error("Error sharing post:", error);
      alert("Error sharing post. Please try again.");
    }
  };

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const currentPost = videoPosts[currentIndex];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </MainLayout>
    );
  }

  if (videoPosts.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen bg-black text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🎥</div>
            <h2 className="text-2xl font-bold mb-2">No videos found</h2>
            <p className="text-gray-400">There are no video posts available.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div 
        ref={containerRef}
        className="relative h-screen bg-black overflow-hidden"
      >
        {/* Main Video Container */}
        <div className="relative h-full flex items-center justify-center">
          {videoPosts.map((post, index) => (
            <div
              key={post.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Video Player */}
              <video
                ref={el => videoRefs.current[index] = el}
                src={post.video}
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
                onClick={togglePlay}
              />

              {/* Video Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20">
                
                {/* Top Bar - Hidden as requested */}
               
                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex justify-between items-end">
                    
                    {/* Post Info - Left Side */}
                    <div className="flex-1 max-w-2xl">
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={post.user.profile_image}
                          alt={post.user.user_name}
                          className="w-10 h-10 rounded-full border-2 border-white"
                        />
                        <span className="text-white font-semibold">
                          {post.user.user_name}
                        </span>
                      </div>

                      {/* Post Content */}
                      <p className="text-white text-sm mb-4 line-clamp-2">
                        {post.content}
                      </p>

                      {/* Music/Sound */}
                      <div className="flex items-center gap-2 text-white text-sm">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                        <span>Original Sound</span>
                      </div>
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="flex flex-col items-center gap-6 ml-4">
                      
                      {/* Like Button */}
                      <div className="flex flex-col items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-12 h-12 rounded-full hover:bg-white/30 ${
                            post.has_liked 
                              ? 'bg-red-500/20 text-red-500' 
                              : 'bg-white/20 text-white'
                          }`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`w-6 h-6 ${post.has_liked ? 'fill-current' : ''}`} />
                        </Button>
                        <span className="text-white text-xs mt-1">
                          {post.likes_count || 0}
                        </span>
                      </div>

                      {/* Comment Button */}
                      <div className="flex flex-col items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-12 h-12 bg-white/20 rounded-full hover:bg-white/30 text-white"
                          onClick={() => setShowComments(true)}
                        >
                          <MessageCircle className="w-6 h-6" />
                        </Button>
                        <span className="text-white text-xs mt-1">
                          {post.comments?.filter(c => !c.reaction).length || 0}
                        </span>
                      </div>

                      {/* Share Button */}
                      <div className="flex flex-col items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-12 h-12 bg-white/20 rounded-full hover:bg-white/30 text-white"
                          onClick={() => setShowShareDialog(true)}
                        >
                          <Share2 className="w-6 h-6" />
                        </Button>
                        <span className="text-white text-xs mt-1">Share</span>
                      </div>

                      {/* User Avatar */}
                      <div className="mt-4">
                        <img
                          src={post.user.profile_image}
                          alt={post.user.user_name}
                          className="w-12 h-12 rounded-full border-2 border-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Play/Pause Center Button */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-20 h-20 bg-black/50 rounded-full hover:bg-black/70"
                      onClick={togglePlay}
                    >
                      <Play className="w-10 h-10 text-white fill-white" />
                    </Button>
                  </div>
                )}

                {/* Navigation Arrows */}
                {currentIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full hover:bg-black/70"
                    onClick={prevVideo}
                  >
                    <ChevronUp className="w-8 h-8 text-white" />
                  </Button>
                )}

                {currentIndex < videoPosts.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full hover:bg-black/70"
                    onClick={nextVideo}
                  >
                    <ChevronDown className="w-8 h-8 text-white" />
                  </Button>
                )}

                {/* Progress Indicator */}
                <div className="absolute top-4 left-4 right-4 flex gap-1">
                  {videoPosts.map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                        idx === currentIndex 
                          ? 'bg-white' 
                          : idx < currentIndex 
                            ? 'bg-white' 
                            : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Mute Button - Moved to bottom left */}
                <div className="absolute bottom-24 left-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 bg-black/50 rounded-full hover:bg-black/70 text-white"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comments Dialog */}
        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Comments</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {currentPost?.comments?.filter(comment => !comment.reaction).map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.user.profile_image}
                    alt={comment.user.user_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.user.user_name}</span>
                      <span className="text-gray-400 text-xs">{comment.created_at}</span>
                    </div>
                    <p className="text-sm text-white">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-gray-800 border-gray-700 text-white"
              />
              <Button 
                onClick={handleAddComment} 
                disabled={commentLoading || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Share with Friends
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {friends.map(friend => (
                <div
                  key={friend.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFriends.includes(friend.id)
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => toggleFriendSelection(friend.id)}
                >
                  <img
                    src={friend.profile_image}
                    alt={friend.user_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="flex-1 font-medium">{friend.user_name}</span>
                  {selectedFriends.includes(friend.id) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
                className="flex-1 border-gray-600 text-white hover:bg-gray-700"
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
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default VideoReelsPage;