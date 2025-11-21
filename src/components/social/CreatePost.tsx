'use client';
import { useState } from "react";
import { Video, Image, Smile, Edit3, X, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/ImageUploader";
import api from "@/lib/api";
import { useContext } from "react";
import { AuthContext } from "@/Context/AuthContext";

type ModalType = "photo" | "video" | "feeling" | null;

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [content, setContent] = useState("");
  const [galleryIds, setGalleryIds] = useState<number[]>([]);
  const [videoId, setVideoId] = useState<number | null>(null);
  const [isAdRequest, setIsAdRequest] = useState(false);
  const { user, loading } = useContext(AuthContext);

  const handleCreatePost = async () => {
    // التحقق من الصحة
    if (!content.trim() && galleryIds.length === 0 && !videoId) {
      alert("Please add some content, photo, or video to create a post");
      return;
    }

    try {
      const payload: any = { 
        content: content.trim() || "",
        is_ad_request: isAdRequest ? 1 : 0
      };
      
      if (galleryIds.length > 0) payload.gallery = galleryIds;
      if (videoId) payload.video = videoId;

      console.log("📤 Creating post with payload:", payload);

      const res = await api.post("/post", payload);
      
      // ✅ استخراج البوست الجديد من الـ response
      const createdPost = res.data.data;

      // ✅ تمريره لــ onPostCreated
      if (onPostCreated) onPostCreated(createdPost);

      // Reset form
      setContent("");
      setGalleryIds([]);
      setVideoId(null);
      setIsAdRequest(false);
      setModalType(null);
      
      alert("Post created successfully! 🎉");
    } catch (error: any) {
      console.error("❌ Error creating post:", error);
      const errorMessage = error.response?.data?.message || "Error creating post";
      alert(`Error: ${errorMessage}`);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryIds(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideoId(null);
  };

  return (
    <Card className="p-4 mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-start gap-4">
          <UserAvatar
            src={user?.profile_image}
            fallback={user?.first_name?.[0] || "U"}
            className="w-12 h-12 border-2 border-[#039fb3]"
          />
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[60px] resize-none border-0 bg-gray-50 text-gray-800 text-base w-full rounded-xl focus:ring-2 focus:ring-[#039fb3] focus:border-[#039fb3] placeholder-gray-500"
            />
          </div>
        </div>

        {/* Ad Request Toggle */}
        <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-[#039fb3]" />
            <div>
              <Label htmlFor="ad-toggle" className="text-sm font-medium text-gray-800">
                Promote as Ad
              </Label>
              <p className="text-xs text-gray-600">Request to promote this post as an advertisement</p>
            </div>
          </div>
          <Switch
            id="ad-toggle"
            checked={isAdRequest}
            onCheckedChange={setIsAdRequest}
            className="data-[state=checked]:bg-[#039fb3]"
          />
        </div>

        {/* Preview Section */}
        {(galleryIds.length > 0 || videoId) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Media Preview</h4>
            <div className="flex flex-wrap gap-2">
              {galleryIds.map((id, index) => (
                <div key={index} className="relative">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-gray-500" />
                  </div>
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {videoId && (
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-gray-500" />
                  </div>
                  <button
                    onClick={removeVideo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-[#039fb3] hover:bg-blue-50 rounded-xl transition-all"
              onClick={() => setModalType("photo")}
            >
              <Image className="w-5 h-5 mr-2" />
              Photo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-[#039fb3] hover:bg-blue-50 rounded-xl transition-all"
              onClick={() => setModalType("video")}
            >
              <Video className="w-5 h-5 mr-2" />
              Video
            </Button>
          </div>
          <Button 
            onClick={handleCreatePost} 
            className="bg-[#039fb3] hover:bg-[#0288a1] text-white rounded-xl px-6 transition-all shadow-lg hover:shadow-xl"
            disabled={!content.trim() && galleryIds.length === 0 && !videoId}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </CardContent>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === "photo" && "Add Photos"}
                {modalType === "video" && "Add Video"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 rounded-xl"
                onClick={() => setModalType(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            {modalType === "photo" && (
              <div className="space-y-4">
                <ImageUploader
                  label="Upload Photos"
                  accept="image/*"
                  multiple={true}
                  onUploadSuccess={(id) => setGalleryIds(prev => [...prev, Number(id)])}
                />
                {galleryIds.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                    <p className="text-green-800 text-sm">
                      ✅ {galleryIds.length} photo(s) uploaded successfully
                    </p>
                  </div>
                )}
              </div>
            )}

            {modalType === "video" && (
              <div className="space-y-4">
                <ImageUploader
                  label="Upload Video"
                  accept="video/*"
                  multiple={false}
                  onUploadSuccess={(id) => setVideoId(Number(id))}
                />
                {videoId && (
                  <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                    <p className="text-green-800 text-sm">
                      ✅ Video uploaded successfully
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
                onClick={() => setModalType(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#039fb3] hover:bg-[#0288a1] text-white rounded-xl"
                onClick={() => setModalType(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};