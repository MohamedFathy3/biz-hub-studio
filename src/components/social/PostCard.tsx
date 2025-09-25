import { useState } from "react";
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface Author {
  id:number,
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
  likes?: number;
  shares?: number;
  comments?: Comment[];
  gallery?: GalleryItem[];
  postId: number;
  currentUserId?: number;
}

export const PostCard = ({
  author,
  content,
  image,
  likes = 0,
  shares = 0,
  comments = [],
  gallery = [],
  postId,
  currentUserId,
}: PostCardProps) => {
  const [commentList, setCommentList] = useState<Comment[]>(comments);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  
  // states للـ image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // استخراج user_id من token إذا لم يتم تمريره
  const token = Cookies.get("token");
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };
  const user = token ? parseJwt(token) : null;
  const user_id = currentUserId || user?.id;

  // حساب الإحصائيات من الـ comments
  const getStatsFromComments = () => {
    const likesCount = commentList.filter(comment => comment.reaction === 'like').length;
    const commentsCount = commentList.filter(comment => comment.content && comment.content.trim() !== '').length;
    const hasUserLiked = commentList.some(comment => 
      comment.user.id === user_id && comment.reaction === 'like'
    );

    return { likesCount, commentsCount, hasUserLiked };
  };

  const { likesCount, commentsCount, hasUserLiked } = getStatsFromComments();

  // دالة لتحديد ما إذا كانت الصورة default
  const isDefaultImage = (imgUrl: string) => {
    return imgUrl.includes('default-logo.png') || imgUrl.includes('default-image');
  };

  // دالة لفتح المودال مع الصورة المحددة
  const openImageModal = (index: number = 0) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  // دالة للإغلاق
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageIndex(0);
  };

  // دالة للصورة التالية
  const nextImage = () => {
    const images = gallery.length > 0 ? gallery : (image && !isDefaultImage(image) ? [{ id: 1, name: "Post Image", fullUrl: image }] : []);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // دالة للصورة السابقة
  const prevImage = () => {
    const images = gallery.length > 0 ? gallery : (image && !isDefaultImage(image) ? [{ id: 1, name: "Post Image", fullUrl: image }] : []);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // دالة للتعامل مع ضغط الأزرار في المودال
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeImageModal();
  };

  // دالة لإضافة تعليق أو reaction
// دالة لإضافة تعليق أو reaction
const handleAddAction = async (type: 'comment' | 'like') => {
  try {
    if (type === 'comment') {
      if (!newComment.trim()) return;
      setLoadingComment(true);
    } else {
      setLoadingLike(true);
    }

    // Prepare the request data based on the type
    const requestData: any = {
      post_id: postId,
    };

    if (type === 'comment') {
      requestData.content = newComment;
      requestData.reaction = null; // Explicitly set reaction to null for comments
    } else {
      requestData.content = null; // Explicitly set content to null for likes
      requestData.reaction = 'like';
    }

    const response = await api.post("/create-comment", requestData);
    
    console.log("API Response:", response);

    if (response.data && response.data.data) {
      const newAction = response.data.data;

      if (type === 'like') {
        // Handle like/unlike logic
        const existingLikeIndex = commentList.findIndex(comment => 
          comment.user.id === user_id && comment.reaction === 'like'
        );
        
        if (existingLikeIndex >= 0) {
          // Unlike - remove the like from the list
          setCommentList(prev => prev.filter((_, index) => index !== existingLikeIndex));
        } else {
          // Like - add the like to the list
          setCommentList(prev => [newAction, ...prev]);
        }
      } else {
        // Add new comment
        setCommentList(prev => [newAction, ...prev]);
        setNewComment("");
      }
    } else {
      throw new Error("Invalid response format");
    }

  } catch (error) {
    console.error("Error adding action:", error);
    alert(`حدث خطأ أثناء ${type === 'comment' ? 'إرسال التعليق' : 'الإعجاب'}`);
  } finally {
    setLoadingComment(false);
    setLoadingLike(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddAction('comment');
  };

  // دالة لعرض الجاليري مع إضافة onClick
  const renderGallery = () => {
    const imageCount = gallery.length;

    if (imageCount === 1) {
      return (
        <div className="mb-4 cursor-pointer" onClick={() => openImageModal(0)}>
          <img
            src={gallery[0].fullUrl}
            alt={gallery[0].name}
            className="w-full h-96 object-cover rounded-lg transition-transform hover:scale-105"
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {gallery.map((img, index) => (
            <div key={img.id} className="cursor-pointer" onClick={() => openImageModal(index)}>
              <img
                src={img.fullUrl}
                alt={img.name}
                className="w-full h-64 object-cover rounded-lg transition-transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      );
    }

    if (imageCount === 3) {
      return (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            {gallery.slice(0, 2).map((img, index) => (
              <div key={img.id} className="cursor-pointer" onClick={() => openImageModal(index)}>
                <img
                  src={img.fullUrl}
                  alt={img.name}
                  className="w-full h-48 object-cover rounded-lg transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
          <div className="cursor-pointer" onClick={() => openImageModal(2)}>
            <img
              src={gallery[2].fullUrl}
              alt={gallery[2].name}
              className="w-full h-48 object-cover rounded-lg transition-transform hover:scale-105"
            />
          </div>
        </div>
      );
    }

    if (imageCount === 4) {
      return (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {gallery.map((img, index) => (
            <div key={img.id} className="cursor-pointer" onClick={() => openImageModal(index)}>
              <img
                src={img.fullUrl}
                alt={img.name}
                className="w-full h-48 object-cover rounded-lg transition-transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      );
    }

    if (imageCount >= 5) {
      return (
        <div className="mb-4 relative">
          <div className="grid grid-cols-2 gap-2">
            {gallery.slice(0, 4).map((img, index) => (
              <div key={img.id} className="relative cursor-pointer" onClick={() => openImageModal(index)}>
                <img
                  src={img.fullUrl}
                  alt={img.name}
                  className="w-full h-48 object-cover rounded-lg transition-transform hover:scale-105"
                />
                {index === 3 && imageCount > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{imageCount - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const allImages = gallery.length > 0 ? gallery : (image && !isDefaultImage(image) ? [{ id: 1, name: "Post Image", fullUrl: image }] : []);

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
             {user_id !== author.id ? (
  <Link to={`/profile/${author.id}`}>
    <UserAvatar
      src={author.avatar}
      fallback={author.name.split(" ").map(n => n[0]).join("")}
      online
    />
  </Link>
) : (
  <UserAvatar
    src={author.avatar}
    fallback={author.name.split(" ").map(n => n[0]).join("")}
    online
  />
)}
              <div>
                <h4 className="font-semibold text-foreground">{author.name}</h4>
                <p className="text-sm text-muted-foreground">{author.timeAgo}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          {!showComments && (
            <>
              <p className="mb-4 text-foreground leading-relaxed">{content}</p>

              {gallery && gallery.length > 0 ? (
                renderGallery()
              ) : image && !isDefaultImage(image) ? (
                <div className="cursor-pointer" onClick={() => openImageModal(0)}>
                  <img 
                    src={image} 
                    alt="Post" 
                    className="w-full h-96 object-cover mb-4 rounded-lg transition-transform hover:scale-105" 
                  />
                </div>
              ) : null}
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border mb-4">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddAction('like')}
                className={`flex items-center gap-1 ${hasUserLiked ? 'text-red-500' : ''}`}
                disabled={loadingLike}
              >
                <Heart className={`w-5 h-5 mr-2 ${hasUserLiked ? 'fill-current' : ''}`} /> 
                {likesCount}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1"
              >
                <MessageCircle className="w-5 h-5 mr-2" /> 
                {commentsCount}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-5 h-5 mr-2" /> 
                {shares}
              </Button>
            </div>
            <Button variant="ghost" size="sm">
              <Bookmark className="w-5 h-5" />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="border-t border-border pt-4">
              {/* قائمة التعليقات والتفاعلات */}
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4">
                {commentList.map((action) => (
                  <div key={action.id} className="flex items-start gap-3">
                    <UserAvatar
                      src={action.user.profile_image}
                      fallback={action.user.user_name.charAt(0)}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{action.user.user_name}</span>
                        <span className="text-xs text-muted-foreground">{action.created_at}</span>
                      </div>
                      
                      {action.reaction === 'like' ? (
                        <div className="text-red-500 flex items-center gap-1">
                        
                        </div>
                      ) : (
                        <p className="text-sm text-foreground bg-muted/50 p-2 rounded-lg">
                          {action.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* إضافة تعليق جديد */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder=" add comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 border border-border rounded-md p-2 text-sm"
                  disabled={loadingComment}
                />
                <Button 
                  onClick={() => handleAddAction('comment')} 
                  disabled={loadingComment || !newComment.trim()}
                >
                  {loadingComment ? " pandding..." : "send"}
                </Button>
                <Button variant="ghost" onClick={() => setShowComments(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black border-0" onKeyDown={handleKeyDown}>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* زر الإغلاق */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-75"
              onClick={closeImageModal}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* زر الصورة السابقة */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-75"
                onClick={prevImage}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {/* زر الصورة التالية */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-75"
                onClick={nextImage}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* مؤشر الصور */}
            {allImages.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* الصورة */}
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