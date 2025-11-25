'use client';

import { useState, useEffect, useContext } from "react";
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, X, ChevronLeft, ChevronRight, BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import api from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import toast from "react-hot-toast";

interface Author {
  id: number;
  name: string;
  avatar?: string;
  timeAgo?: string;
}

interface User {
  id: number;
  user_name: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: number;
  post_id: number;
  user: User;
  content: string;
  reaction: string | null;
  created_at: string;
}

interface GalleryItem {
  id: number;
  name: string;
  fullUrl: string;
}

interface PostCardProps {
  author: Author;
  content: string;
  image?: string;
  video?: string;
  likes?: number;
  shares?: number;
  comments?: Comment[];
  gallery?: GalleryItem[];
  postId: number;
  currentUserId?: number;
  is_ad_request?: boolean;
  is_ad_approved?: boolean;
  ad_approved_at?: string;
}

export const PostCard = ({
  author,
  content,
  image,
  video,
  likes = 0,
  shares = 0,
  comments = [],
  gallery = [],
  postId,
  currentUserId,
  is_ad_request = false,
  is_ad_approved = false,
  ad_approved_at,
}: PostCardProps) => {
  console.log(`🎬 PostCard ${postId} rendered with:`, {
    hasVideo: !!video,
    videoUrl: video,
    hasImage: !!image,
    imageUrl: image,
    galleryCount: gallery?.length || 0,
    isAd: is_ad_request,
    isAdApproved: is_ad_approved,
    contentLength: content?.length
  });

  const [commentList, setCommentList] = useState<Comment[]>(comments);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  
  // Image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Like state
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);

  // Auth context
  const { user: authUser } = useContext(AuthContext);
  const user_id = currentUserId || authUser?.id;

  // Auto-refresh comments every 3 seconds when open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showComments) {
      fetchComments();
      
      interval = setInterval(() => {
        fetchComments();
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showComments, postId]);

  // Fetch comments
  const fetchComments = async () => {
    try {
      console.log(`📝 Fetching comments for post ${postId}`);
      const response = await api.get(`/posts/${postId}/comments`);
      if (response.data && response.data.data) {
        console.log(`✅ Found ${response.data.data.length} comments for post ${postId}`);
        setCommentList(response.data.data);
      }
    } catch (error) {
      console.error(`❌ Error fetching comments for post ${postId}:`, error);
    }
  };

  // Save like state to localStorage
  const saveLikeStateToStorage = (postId: number, hasLiked: boolean) => {
    try {
      const likes = JSON.parse(localStorage.getItem('postLikes') || '{}');
      likes[postId] = hasLiked;
      localStorage.setItem('postLikes', JSON.stringify(likes));
    } catch (error) {
      console.error('Error saving like state to storage:', error);
    }
  };

  // Get like state from localStorage
  const getLikeStateFromStorage = (postId: number): boolean => {
    try {
      const likes = JSON.parse(localStorage.getItem('postLikes') || '{}');
      return !!likes[postId];
    } catch (error) {
      console.error('Error getting like state from storage:', error);
      return false;
    }
  };

  // Load like state on initial load
  useEffect(() => {
    if (user_id) {
      const storedLikeState = getLikeStateFromStorage(postId);
      setHasUserLiked(storedLikeState);
      checkLikeStatus();
    }
  }, [postId, user_id]);

  // Check like status from server
  const checkLikeStatus = async () => {
    if (!user_id) return;
    
    try {
      const response = await api.get(`/posts/${postId}/like-status`);
      if (response.data && response.data.hasLiked !== undefined) {
        const serverLikeStatus = response.data.hasLiked;
        const serverLikesCount = response.data.likesCount || likes;
        
        saveLikeStateToStorage(postId, serverLikeStatus);
        setHasUserLiked(serverLikeStatus);
        setLikesCount(serverLikesCount);
      }
    } catch (error) {
      console.log("Like status API not available, using stored state");
      const userLike = commentList.find(comment => 
        comment.user.id === user_id && comment.reaction === 'like'
      );
      if (userLike) {
        setHasUserLiked(true);
      }
    }
  };

  // Like/unlike function
  const handleLikeToggle = async () => {
    if (!user_id) {
      toast.error("Please login to like posts");
      return;
    }

    const newLikeStatus = !hasUserLiked;
    const newLikesCount = newLikeStatus ? likesCount + 1 : Math.max(0, likesCount - 1);
    
    saveLikeStateToStorage(postId, newLikeStatus);
    setHasUserLiked(newLikeStatus);
    setLikesCount(newLikesCount);
    setLikeLoading(true);

    try {
      const response = await api.post(`/posts/${postId}/like`);
      
      if (response.data) {
        const serverLikeStatus = response.data.liked;
        const serverLikesCount = response.data.likes_count;
        
        saveLikeStateToStorage(postId, serverLikeStatus);
        setHasUserLiked(serverLikeStatus);
        setLikesCount(serverLikesCount);
        updateCommentListAfterLike(serverLikeStatus);
        
        if (serverLikeStatus) {
          toast.success("Liked post");
        } else {
          toast.success("Unliked post");
        }
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      saveLikeStateToStorage(postId, !newLikeStatus);
      setHasUserLiked(!newLikeStatus);
      setLikesCount(newLikeStatus ? newLikesCount - 1 : newLikesCount + 1);
      
      try {
        await handleLikeFallback();
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        toast.error("Error liking post");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  // Fallback for old system
  const handleLikeFallback = async () => {
    try {
      const requestData = {
        post_id: postId,
        content: null,
        reaction: 'like'
      };

      const response = await api.post("/create-comment", requestData);
      
      if (response.data && response.data.data) {
        const newAction = response.data.data;
        
        const existingLikeIndex = commentList.findIndex(comment => 
          comment.user.id === user_id && comment.reaction === 'like'
        );
        
        if (existingLikeIndex >= 0) {
          setCommentList(prev => prev.filter((_, index) => index !== existingLikeIndex));
          setHasUserLiked(false);
          setLikesCount(prev => Math.max(0, prev - 1));
          saveLikeStateToStorage(postId, false);
          toast.success("Unliked post");
        } else {
          setCommentList(prev => [newAction, ...prev]);
          setHasUserLiked(true);
          setLikesCount(prev => prev + 1);
          saveLikeStateToStorage(postId, true);
          toast.success("Liked post");
        }
      }
    } catch (fallbackError) {
      console.error("Fallback like error:", fallbackError);
      throw fallbackError;
    }
  };

  // Update comment list after like
  const updateCommentListAfterLike = (liked: boolean) => {
    if (liked && user_id) {
      const likeComment: Comment = {
        id: Date.now(),
        post_id: postId,
        user: {
          id: user_id,
          user_name: authUser?.user_name || "User",
          profile_image: authUser?.profile_image || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        content: "",
        reaction: 'like',
        created_at: new Date().toISOString()
      };
      setCommentList(prev => [likeComment, ...prev]);
    } else {
      setCommentList(prev => prev.filter(comment => 
        !(comment.user.id === user_id && comment.reaction === 'like')
      ));
    }
  };

  // Check if image is default
  const isDefaultImage = (imgUrl: string) => {
    const isDefault = imgUrl?.includes('default-logo.png') || imgUrl?.includes('default-image');
    return isDefault;
  };

  // Check if video is default
  const isDefaultVideo = (videoUrl: string) => {
    const isDefault = videoUrl?.includes('default-logo.png') || videoUrl?.includes('default-video');
    return isDefault;
  };

  // Open image modal
  const openImageModal = (index: number = 0) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  // Close modal
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageIndex(0);
  };

  // Next image
  const nextImage = () => {
    const images = gallery.length > 0 ? gallery : (image && !isDefaultImage(image) ? [{ id: 1, name: "Post Image", fullUrl: image }] : []);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Previous image
  const prevImage = () => {
    const images = gallery.length > 0 ? gallery : (image && !isDefaultImage(image) ? [{ id: 1, name: "Post Image", fullUrl: image }] : []);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard in modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeImageModal();
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoadingComment(true);
      
      const requestData = {
        post_id: postId,
        content: newComment,
        reaction: null
      };

      const response = await api.post("/create-comment", requestData);
      
      if (response.data && response.data.data) {
        const newCommentData = response.data.data;
        setCommentList(prev => [newCommentData, ...prev]);
        setNewComment("");
        toast.success("Comment added");
        
        setTimeout(() => {
          fetchComments();
        }, 500);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    } finally {
      setLoadingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddComment();
  };

  // Calculate real comments count (without likes)
  const realCommentsCount = commentList.filter(comment => 
    comment.content && comment.content.trim() !== '' && comment.reaction !== 'like'
  ).length;

  // Render gallery
  const renderGallery = () => {
    const imageCount = gallery.length;

    if (imageCount === 1) {
      return (
        <div className="mb-4 cursor-pointer" onClick={() => openImageModal(0)}>
          <img
            src={gallery[0].fullUrl}
            alt={gallery[0].name}
            className="w-full max-h-[500px] object-cover rounded-lg transition-transform hover:opacity-95"
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mb-4 grid grid-cols-2 gap-1">
          {gallery.map((img, index) => (
            <div key={img.id} className="cursor-pointer" onClick={() => openImageModal(index)}>
              <img
                src={img.fullUrl}
                alt={img.name}
                className="w-full h-64 object-cover rounded-lg transition-transform hover:opacity-95"
              />
            </div>
          ))}
        </div>
      );
    }

    if (imageCount >= 3) {
      return (
        <div className="mb-4 grid grid-cols-2 gap-1">
          {gallery.slice(0, 4).map((img, index) => (
            <div key={img.id} className="relative cursor-pointer" onClick={() => openImageModal(index)}>
              <img
                src={img.fullUrl}
                alt={img.name}
                className="w-full h-48 object-cover rounded-lg transition-transform hover:opacity-95"
              />
              {index === 3 && imageCount > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+{imageCount - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // Render video
  const renderVideo = () => {
    if (!video || isDefaultVideo(video)) return null;

    return (
      <div className="mb-4">
        <video 
          controls 
          className="w-full max-h-[500px] rounded-lg bg-black"
          poster={image && !isDefaultImage(image) ? image : undefined}
        >
          <source src={video} type="video/mp4" />
          <source src={video} type="video/webm" />
          <source src={video} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const allImages = gallery.length > 0 ? gallery : (image && !isDefaultImage(image) ? [{ id: 1, name: "Post Image", fullUrl: image }] : []);

  // Facebook-like design - Clean and minimal
  return (
    <>
      <Card className={`mb-4 border rounded-lg shadow-sm ${is_ad_request ? 'border-[#039fb3] border-2 bg-gradient-to-r from-blue-50 to-white' : 'border-gray-300 bg-white'}`}>
        <CardContent className="p-4">
          {/* Ad Badge for Promoted Posts */}
          {is_ad_request && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#039fb3] text-white rounded-md">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Sponsored • Promoted Post</span>
              {is_ad_approved && (
                <BadgeCheck className="w-4 h-4 ml-auto" />
              )}
            </div>
          )}

          {/* Header - Facebook Style */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`relative ${is_ad_request ? 'ring-2 ring-[#039fb3] ring-offset-1' : ''}`}>
                <UserAvatar
                  src={author.avatar}
                  fallback={author.name.split(" ").map(n => n[0]).join("")}
                  size="md"
                />
                {is_ad_request && (
                  <div className="absolute -top-1 -right-1 bg-[#039fb3] text-white rounded-full p-0.5">
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                )}
              </div>
              <div>
                <h4 className={`font-semibold text-sm ${is_ad_request ? 'text-[#039fb3]' : 'text-gray-900'}`}>
                  {author.name}
                  {is_ad_request && (
                    <span className="ml-2 text-xs bg-[#039fb3] text-white px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-500">{author.timeAgo}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-1">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          {!showComments && (
            <>
              <p className={`mb-3 text-sm leading-relaxed ${is_ad_request ? 'text-gray-800 font-medium' : 'text-gray-900'}`}>
                {content}
              </p>

              {/* Video */}
              {renderVideo()}

              {/* Gallery or Single Image */}
              {gallery && gallery.length > 0 ? (
                renderGallery()
              ) : image && !isDefaultImage(image) ? (
                <div className="cursor-pointer mb-3" onClick={() => openImageModal(0)}>
                  <img 
                    src={image} 
                    alt="Post" 
                    className="w-full max-h-[500px] object-cover rounded-lg" 
                  />
                </div>
              ) : null}
            </>
          )}

          {/* Stats Bar - Facebook Style */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 px-1">
            <div className="flex items-center gap-4">
              <span>{likesCount} likes</span>
              <span>{realCommentsCount} comments</span>
              <span>{shares} shares</span>
            </div>
            {is_ad_request && (
              <span className="text-[#039fb3] font-medium">Sponsored</span>
            )}
          </div>

          {/* Action Buttons - Facebook Style */}
          <div className="flex border-t border-gray-200 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                hasUserLiked 
                  ? 'text-[#039fb3] hover:text-[#0288a1]' 
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
              }`}
              disabled={likeLoading}
            >
              <Heart className={`w-4 h-4 ${hasUserLiked ? 'fill-current text-[#039fb3]' : ''}`} />
              Like
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Comment
            </Button>

           
          </div>

          {/* Comments Section - Facebook Style */}
          {showComments && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              {/* Comments List */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                {commentList
                  .filter(action => action.content && action.content.trim() !== '')
                  .map((action) => (
                    <div key={action.id} className="flex items-start gap-2">
                      <UserAvatar
                        src={action.user.profile_image}
                        fallback={action.user.user_name.charAt(0)}
                        size="sm"
                      />
                      <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{action.user.user_name}</span>
                        </div>
                        <p className="text-sm text-gray-700">{action.content}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">Like</span>
                          <span className="text-xs text-gray-500">Reply</span>
                          <span className="text-xs text-gray-500">
                            {new Date(action.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Add Comment - Facebook Style */}
              <div className="flex items-center gap-2">
                <UserAvatar
                  src={authUser?.profile_image}
                  fallback={authUser?.user_name?.charAt(0) || "U"}
                  size="sm"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#039fb3]"
                    disabled={loadingComment}
                  />
                  <Button 
                    onClick={handleAddComment} 
                    disabled={loadingComment || !newComment.trim()}
                    className="bg-[#039fb3] hover:bg-[#0288a1] text-white px-4 rounded-full text-sm"
                  >
                    {loadingComment ? "..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black border-0" onKeyDown={handleKeyDown}>
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-75 hover:bg-black"
              onClick={closeImageModal}
            >
              <X className="w-6 h-6" />
            </Button>

            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-75 hover:bg-black"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-75 hover:bg-black"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}

            {allImages.length > 0 && (
              <img
                src={allImages[currentImageIndex].fullUrl}
                alt={allImages[currentImageIndex].name}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};