'use client';

import { useState, useEffect, useContext, useCallback } from "react";
import { MoreHorizontal, Heart, MessageCircle, Share2, X, ChevronLeft, ChevronRight, BadgeCheck, Star, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import api from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthContext } from "@/Context/AuthContext";
import toast from "react-hot-toast";

// Firebase imports للـ real-time فقط
import { db } from '@/lib/firebase';
import { ref, onValue, off, push, set, update, query, orderByChild, equalTo, remove } from 'firebase/database';

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
  // 🔥 Real-time states only
  const [commentList, setCommentList] = useState<Comment[]>(() => {
    return Array.isArray(comments) ? comments : [];
  });
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  
  // Like state - real-time only
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Number(likes) || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Share state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // Image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auth context
  const { user: authUser } = useContext(AuthContext);
  const user_id = currentUserId || authUser?.id;

  // 🔥 Safe data formatting للبيانات الثابتة من الباك إند
  const safeContent = String(content || '');
  const safeGallery = Array.isArray(gallery) ? gallery : [];
  const safeImage = String(image || '');
  const safeVideo = String(video || '');

  // 🔥 Firebase Realtime Listeners للتفاعلات فقط
  useEffect(() => {
    if (!postId) return;

    console.log(`🔥 Setting up real-time listeners for post ${postId}`);

    // 🔥 Real-time comments listener
    const commentsRef = ref(db, `posts/${postId}/comments`);
    const commentsUnsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        const commentsArray: Comment[] = [];
        
        // Convert Firebase object to array safely
        Object.keys(commentsData).forEach(key => {
          const comment = commentsData[key];
          if (comment && typeof comment === 'object') {
            commentsArray.push({
              id: Number(comment.id) || Date.now(),
              post_id: Number(comment.post_id) || postId,
              user: {
                id: Number(comment.user?.id) || 0,
                user_name: String(comment.user?.user_name || "Unknown User"),
                profile_image: String(comment.user?.profile_image || ""),
                created_at: String(comment.user?.created_at || new Date().toISOString()),
                updated_at: String(comment.user?.updated_at || new Date().toISOString())
              },
              content: String(comment.content || ""),
              reaction: comment.reaction ? String(comment.reaction) : null,
              created_at: String(comment.created_at || new Date().toISOString())
            });
          }
        });
        
        // Sort by creation date (newest first)
        const sortedComments = commentsArray.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        console.log(`🔥 Real-time comments update for post ${postId}:`, sortedComments.length);
        setCommentList(sortedComments);
      } else {
        console.log(`🔥 No real-time comments for post ${postId}`);
        setCommentList([]);
      }
    });

    // 🔥 Real-time likes listener
    const likesRef = ref(db, `posts/${postId}/likes`);
    const likesUnsubscribe = onValue(likesRef, (snapshot) => {
      if (snapshot.exists()) {
        const likesData = snapshot.val();
        const likesArray = Object.keys(likesData);
        
        setLikesCount(likesArray.length);
        
        // Check if current user liked this post
        if (user_id) {
          const userLikeKey = Object.keys(likesData).find(key => 
            likesData[key].user_id === user_id
          );
          setHasUserLiked(!!userLikeKey);
        }
        
        console.log(`🔥 Real-time likes update for post ${postId}:`, likesArray.length);
      } else {
        setLikesCount(0);
        setHasUserLiked(false);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      console.log(`🔥 Cleaning up real-time listeners for post ${postId}`);
      off(commentsRef);
      off(likesRef);
    };
  }, [postId, user_id]);

  // 🔥 Enhanced notification system
  const sendNotification = useCallback(async (type: string, message: string, additionalData: any = {}) => {
    if (!authUser || !author.id) {
      console.log("❌ Cannot send notification: missing auth user or author");
      return;
    }
    
    // Don't send notification to self
    if (author.id === authUser.id) {
      console.log("ℹ️ Skipping self-notification");
      return;
    }

    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notificationRef = ref(db, `notifications/${author.id}/${notificationId}`);
      
      const notificationData = {
        id: notificationId,
        type: type,
        title: getNotificationTitle(type),
        message: message,
        sender_id: authUser.id,
        sender_name: String(authUser.user_name),
        sender_image: String(authUser.profile_image || ""),
        post_id: postId,
        post_content: safeContent.substring(0, 100) + (safeContent.length > 100 ? '...' : ''),
        timestamp: Date.now(),
        read: false,
        sender_type: 'user',
        ...additionalData
      };

      await set(notificationRef, notificationData);
      console.log("✅ Notification sent successfully to user:", author.id);
      
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  }, [authUser, author.id, postId, safeContent]);

  // Helper function for notification titles
  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'post_like':
        return 'New Like';
      case 'post_comment':
        return 'New Comment';
      case 'post_share':
        return 'Post Shared';
      default:
        return 'New Activity';
    }
  };

  // 🔥 Real-time like function
  const handleLikeToggle = async () => {
    if (!user_id) {
      toast.error("Please login to like posts");
      return;
    }

    if (!authUser) return;

    setLikeLoading(true);
    const newLikeStatus = !hasUserLiked;

    try {
      if (newLikeStatus) {
        // Add like to Firebase
        const likeRef = ref(db, `posts/${postId}/likes`);
        const newLikeKey = push(likeRef).key;
        
        if (newLikeKey) {
          await set(ref(db, `posts/${postId}/likes/${newLikeKey}`), {
            user_id: user_id,
            user_name: String(authUser.user_name),
            user_avatar: String(authUser.profile_image || ""),
            created_at: new Date().toISOString(),
            timestamp: Date.now()
          });
          
          // 🔥 Send notification to post owner
          await sendNotification('post_like', 
            `${authUser.user_name} liked your post: "${safeContent.substring(0, 50)}..."`,
            { like_id: newLikeKey }
          );
          
          toast.success("Liked post!");
        }
      } else {
        // Remove like from Firebase
        const likesQuery = query(
          ref(db, `posts/${postId}/likes`),
          orderByChild('user_id'),
          equalTo(user_id)
        );
        
        // We need to find and remove the specific like
        const snapshot = await new Promise((resolve) => {
          onValue(likesQuery, (snap) => {
            resolve(snap);
          }, { onlyOnce: true });
        });

        if ((snapshot as any).exists()) {
          const likesData = (snapshot as any).val();
          const likeKey = Object.keys(likesData)[0];
          
          await remove(ref(db, `posts/${postId}/likes/${likeKey}`));
          
          toast.success("Unliked post!");
        }
      }
    } catch (error: any) {
      console.error("Error with real-time like:", error);
      toast.error("Error liking post");
    } finally {
      setLikeLoading(false);
    }
  };

  // 🔥 Real-time comment function
  const handleAddComment = async () => {
    const safeNewComment = String(newComment || '').trim();
    if (!safeNewComment || !authUser) return;
    
    try {
      setLoadingComment(true);
      
      // 🔥 Add to Firebase for real-time update
      const commentsRef = ref(db, `posts/${postId}/comments`);
      const newCommentKey = push(commentsRef).key;
      
      if (newCommentKey) {
        const firebaseComment = {
          id: newCommentKey,
          post_id: postId,
          user: {
            id: authUser.id,
            user_name: String(authUser.user_name),
            profile_image: String(authUser.profile_image || ""),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          content: safeNewComment,
          reaction: null,
          created_at: new Date().toISOString(),
          timestamp: Date.now()
        };

        await set(ref(db, `posts/${postId}/comments/${newCommentKey}`), firebaseComment);
        
        // 🔥 Send notification to post owner
        if (author.id !== authUser.id) {
          await sendNotification('post_comment', 
            `${authUser.user_name} commented on your post: "${safeNewComment.substring(0, 50)}..."`,
            { comment_id: newCommentKey, comment_content: safeNewComment }
          );
        }
        
        setNewComment("");
        toast.success("Comment added!");
        
      }
    } catch (error) {
      console.error("Error adding real-time comment:", error);
      toast.error("Error adding comment");
    } finally {
      setLoadingComment(false);
    }
  };

  // 🔥 Share Post Functions
  const handleShare = async (shareType: 'whatsapp' | 'profile' | 'copy') => {
    if (!authUser) {
      toast.error("Please login to share posts");
      return;
    }

    setShareLoading(true);
    
    try {
      const postUrl = `${window.location.origin}/post/${postId}`;
      const shareMessage = `Check out this post by ${author.name}: ${safeContent.substring(0, 100)}...`;
      
      switch (shareType) {
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage + '\n' + postUrl)}`;
          window.open(whatsappUrl, '_blank');
          toast.success("Opening WhatsApp...");
          break;
          
        case 'profile':
          await shareToProfile(shareMessage, postUrl);
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(`${shareMessage}\n${postUrl}`);
          toast.success("Link copied to clipboard!");
          break;
      }
      
      // 🔥 Send share notification to post owner
      if (author.id !== authUser.id) {
        await sendNotification('post_share', 
          `${authUser.user_name} shared your post`,
          { share_type: shareType }
        );
      }
      
      setShowShareDialog(false);
      
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Error sharing post");
    } finally {
      setShareLoading(false);
    }
  };

  // Share to user's profile
  const shareToProfile = async (message: string, postUrl: string) => {
    try {
      const newPostRef = ref(db, 'posts');
      const newPostKey = push(newPostRef).key;
      
      if (newPostKey && authUser) {
        const sharedPost = {
          id: newPostKey,
          user: {
            id: authUser.id,
            user_name: String(authUser.user_name),
            profile_image: String(authUser.profile_image || "")
          },
          content: `${message}\n\n🔗 Original post: ${postUrl}`,
          original_post_id: postId,
          is_shared: true,
          shared_from: String(author.name),
          created_at: new Date().toISOString(),
          timestamp: Date.now(),
          likes_count: 0,
          comments_count: 0,
          shares_count: 0
        };
        
        await set(ref(db, `posts/${newPostKey}`), sharedPost);
        toast.success("Post shared to your profile!");
      }
    } catch (error) {
      console.error("Error sharing to profile:", error);
      throw error;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddComment();
  };

  // Check if image is default
  const isDefaultImage = (imgUrl: string) => {
    return imgUrl?.includes('default-logo.png') || imgUrl?.includes('default-image');
  };

  // Check if video is default
  const isDefaultVideo = (videoUrl: string) => {
    return videoUrl?.includes('default-logo.png') || videoUrl?.includes('default-video');
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
    const images = safeGallery.length > 0 ? safeGallery : (safeImage && !isDefaultImage(safeImage) ? [{ id: 1, name: "Post Image", fullUrl: safeImage }] : []);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Previous image
  const prevImage = () => {
    const images = safeGallery.length > 0 ? safeGallery : (safeImage && !isDefaultImage(safeImage) ? [{ id: 1, name: "Post Image", fullUrl: safeImage }] : []);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard in modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeImageModal();
  };

  // Calculate real comments count (without likes)
  const realCommentsCount = commentList.filter(comment => 
    comment && 
    comment.content && 
    String(comment.content).trim() !== '' && 
    comment.reaction !== 'like'
  ).length;

  // Render gallery
  const renderGallery = () => {
    const imageCount = safeGallery.length;

    if (imageCount === 1) {
      return (
        <div className="mb-4 cursor-pointer" onClick={() => openImageModal(0)}>
          <img
            src={safeGallery[0].fullUrl}
            alt={String(safeGallery[0].name)}
            className="w-full max-h-[500px] object-cover rounded-lg transition-transform hover:opacity-95"
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mb-4 grid grid-cols-2 gap-1">
          {safeGallery.map((img, index) => (
            <div key={img.id} className="cursor-pointer" onClick={() => openImageModal(index)}>
              <img
                src={img.fullUrl}
                alt={String(img.name)}
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
          {safeGallery.slice(0, 4).map((img, index) => (
            <div key={img.id} className="relative cursor-pointer" onClick={() => openImageModal(index)}>
              <img
                src={img.fullUrl}
                alt={String(img.name)}
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
    if (!safeVideo || isDefaultVideo(safeVideo)) return null;

    return (
      <div className="mb-4">
        <video 
          controls 
          className="w-full max-h-[500px] rounded-lg bg-black"
          poster={safeImage && !isDefaultImage(safeImage) ? safeImage : undefined}
        >
          <source src={safeVideo} type="video/mp4" />
          <source src={safeVideo} type="video/webm" />
          <source src={safeVideo} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const allImages = safeGallery.length > 0 ? safeGallery : (safeImage && !isDefaultImage(safeImage) ? [{ id: 1, name: "Post Image", fullUrl: safeImage }] : []);

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
                  src={String(author.avatar || "")}
                  fallback={String(author.name).split(" ").map(n => n[0]).join("")}
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
                  {String(author.name)}
                  {is_ad_request && (
                    <span className="ml-2 text-xs bg-[#039fb3] text-white px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-500">{String(author.timeAgo || "Just now")}</p>
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
                {safeContent}
              </p>

              {/* Video */}
              {renderVideo()}

              {/* Gallery or Single Image */}
              {safeGallery.length > 0 ? (
                renderGallery()
              ) : safeImage && !isDefaultImage(safeImage) ? (
                <div className="cursor-pointer mb-3" onClick={() => openImageModal(0)}>
                  <img 
                    src={safeImage} 
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
                  .filter(action => action.content && String(action.content).trim() !== '')
                  .map((action) => (
                    <div key={action.id} className="flex items-start gap-2">
                      <UserAvatar
                        src={String(action.user.profile_image)}
                        fallback={String(action.user.user_name).charAt(0)}
                        size="sm"
                      />
                      <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{String(action.user.user_name)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{String(action.content)}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">Like</span>
                          <span className="text-xs text-gray-500">Reply</span>
                          <span className="text-xs text-gray-500">
                            {new Date(action.created_at).toLocaleTimeString()}
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
                  src={String(authUser?.profile_image || "")}
                  fallback={String(authUser?.user_name?.charAt(0) || "U")}
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Share this post</h3>
              <p className="text-sm text-gray-600 mt-1">Choose how you want to share this post</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => handleShare('whatsapp')}
                disabled={shareLoading}
                className="w-full justify-start gap-3 py-3 h-auto bg-green-50 hover:bg-green-100 border border-green-200 text-green-700"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WA</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Share on WhatsApp</div>
                  <div className="text-xs text-green-600">Share with your contacts</div>
                </div>
              </Button>

              <Button
                onClick={() => handleShare('profile')}
                disabled={shareLoading}
                className="w-full justify-start gap-3 py-3 h-auto bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Share to your profile</div>
                  <div className="text-xs text-blue-600">Post to your timeline</div>
                </div>
              </Button>

              <Button
                onClick={() => handleShare('copy')}
                disabled={shareLoading}
                className="w-full justify-start gap-3 py-3 h-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700"
              >
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <Copy className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Copy link</div>
                  <div className="text-xs text-gray-600">Copy post link to clipboard</div>
                </div>
              </Button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
                className="flex-1"
                disabled={shareLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                alt={String(allImages[currentImageIndex].name)}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};