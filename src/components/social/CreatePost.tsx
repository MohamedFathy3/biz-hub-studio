import { Video, Image, Smile, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";

export const CreatePost = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <UserAvatar
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            fallback="SZ"
          />
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] resize-none border-0 bg-secondary text-base"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Video className="w-5 h-5 mr-2" />
              Live Video
            </Button>
            <Button variant="ghost" size="sm" className="text-success hover:text-success">
              <Image className="w-5 h-5 mr-2" />
              Photo/Video
            </Button>
            <Button variant="ghost" size="sm" className="text-warning hover:text-warning">
              <Smile className="w-5 h-5 mr-2" />
              Feeling/Activity
            </Button>
          </div>
          <Button>
            <Edit3 className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};