import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";

interface PostCardProps {
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export function PostCard({ author, content, image, likes, comments, timestamp }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <Card className="glass shadow-glass border-glass-border mb-6 transition-smooth hover:shadow-glass-lg">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={author?.avatar} />
              <AvatarFallback>{author?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm">{author?.name}</h4>
              <p className="text-muted-foreground text-xs">@{author?.username} • {timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed">{content}</p>
        </div>

        {/* Post Image */}
        {image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt="Post content" 
              className="w-full h-auto object-cover transition-smooth hover:scale-105"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-glass-border">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`hover:bg-accent ${liked ? 'text-red-500' : ''}`}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              <span className="text-xs">{likes + (liked ? 1 : 0)}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="text-xs">{comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Share className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`hover:bg-accent ${bookmarked ? 'text-primary' : ''}`}
            onClick={() => setBookmarked(!bookmarked)}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}