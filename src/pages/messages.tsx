import { MainLayout } from "@/components/layout/MainLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Send } from "lucide-react";

const conversations = [
  {
    id: 1,
    user: { name: "Alice Cooper", avatar: "/api/placeholder/40/40", online: true },
    lastMessage: "Hey! How's your new project going?",
    timestamp: "2 min ago",
    unread: 2
  },
  {
    id: 2,
    user: { name: "Bob Johnson", avatar: "/api/placeholder/40/40", online: false },
    lastMessage: "Thanks for the feedback on the design",
    timestamp: "1 hour ago",
    unread: 0
  },
  {
    id: 3,
    user: { name: "Sarah Wilson", avatar: "/api/placeholder/40/40", online: true },
    lastMessage: "Let's schedule that meeting for next week",
    timestamp: "3 hours ago",
    unread: 1
  }
];

export default function Messages() {
  return (
    <MainLayout>
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="glass shadow-glass border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Messages
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-smooth"
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conversation.user.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{conversation.user.name}</p>
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge variant="default" className="text-xs">
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 glass shadow-glass border-glass-border flex flex-col">
          <CardHeader className="border-b border-glass-border">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Alice Cooper</h3>
                <p className="text-sm text-muted-foreground">Active now</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex">
                <div className="bg-accent rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Hey! How's your new project going?</p>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                  <p className="text-sm">It's going great! Just finished the design system.</p>
                  <span className="text-xs opacity-80">1 min ago</span>
                </div>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="border-t border-glass-border p-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1"
                />
                <Button size="sm" className="gradient-primary text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  );
}