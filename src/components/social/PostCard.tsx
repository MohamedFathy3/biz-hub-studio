import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";

interface PostCardProps {
  author: {
    name: string;
    avatar?: string;
    timeAgo: string;
  };
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export const PostCard = ({ author, content, image, likes = 0, comments = 0, shares = 0 }: PostCardProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={author.avatar}
              fallback={author.name.split(' ').map(n => n[0]).join('')}
              online
            />
            <div>
              <h4 className="font-semibold text-foreground">{author.name}</h4>
              <p className="text-sm text-muted-foreground">{author.timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed">{content}</p>
        </div>

        {/* Post Image */}
        {image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt="Post content" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Heart className="w-5 h-5 mr-2" />
              {likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <MessageCircle className="w-5 h-5 mr-2" />
              {comments}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Share2 className="w-5 h-5 mr-2" />
              {shares}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};