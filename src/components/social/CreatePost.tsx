'use client';
import { useState } from "react";
import { Video, Image, Smile, Edit3, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
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
  const { user, loading } = useContext(AuthContext);

const handleCreatePost = async () => {
  try {
    const payload: any = { content };
    if (galleryIds.length > 0) payload.gallery = galleryIds;
    if (videoId) payload.video = videoId;

    const res = await api.post("/post", payload);
    
    // ✅ استخراج البوست الجديد من الـ response
    const createdPost = res.data.data;

    // ✅ تمريره لــ onPostCreated
    if (onPostCreated) onPostCreated(createdPost);

    setContent("");
    setGalleryIds([]);
    setVideoId(null);
    setModalType(null);
  } catch (error) {
    console.error(error);
    alert("Error creating post");
  }
};

  return (
   <Card className="p-3 mb-5">
  <CardContent className="p-1">
    <div className="flex items-start gap-6 flex-wrap">
      <UserAvatar
        src={user.profile_image}
        fallback="SZ"
      />
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="min-h-[40px] resize-none border-0 bg-secondary text-base w-full"
        />
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border flex-wrap">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-white"
          onClick={() => setModalType("video")}
        >
          <Video className="w-5 h-5 mr-2" />
           Video
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-success hover:text-white"
          onClick={() => setModalType("photo")}
        >
          <Image className="w-5 h-5 mr-2" />
          Photo
        </Button>
       
      </div>
      <Button onClick={handleCreatePost} className="mt-2 lg:mt-0">
        <Edit3 className="w-4 h-4 mr-2" />
        Create Post
      </Button>
    </div>
  </CardContent>

  {/* Modal */}
  {modalType && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90%] sm:w-[400px] p-6 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => setModalType(null)}
        >
          <X className="w-5 h-5" />
        </Button>

       

        {/* Modal Content */}
        {modalType === "photo" && (
          <ImageUploader
  label="Upload Photos"
  accept="image/*"
  multiple 
onUploadSuccess={(id) =>
    setGalleryIds((prev) => [...prev, Number(id)])
  }/>
        )}

        {modalType === "video" && (
        <ImageUploader
  label="Upload Video"
  accept="video/*"
  onUploadSuccess={(id) => setVideoId(Number(id))}
/>
        )}

   

        <Button className="mt-4 w-full" onClick={handleCreatePost}>
          Post
        </Button>
      </div>
    </div>
  )}
</Card>

  );
};
