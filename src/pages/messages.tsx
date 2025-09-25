"use client";
import { useEffect, useState, useContext } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Send } from "lucide-react";
import api from "@/lib/api";
import { AuthContext } from "@/Context/AuthContext";

type UserShort = {
  id: number;
  user_name: string;
  profile_image?: string;
};

type Message = {
  id: number;
  body: string;
  created_at: string;
  sender: UserShort;
  receiver: UserShort;
};

export default function Messages() {
  const { user } = useContext(AuthContext);

  const [conversations, setConversations] = useState<UserShort[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserShort | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // جلب قائمة المحادثات (الناس اللي بعتوا أو استقبلت منهم رسائل)
  const fetchConversations = async () => {
    try {
      // ممكن تعمل endpoint مخصص يرجع آخر رسالة من كل شخص
      // أو تستخدم /chat/messages مع كل شخص حسب المتاح عندك
      // هنا هنفترض عندك API جاهز بيرجع list
      const res = await api.get("/chat/conversations");
      setConversations(res.data.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // جلب الرسائل بيني وبين شخص معين
  const fetchMessages = async (receiverId: number) => {
    try {
      const res = await api.get("/chat/messages", {
        params: { receiver_id: receiverId },
      });
      setMessages(res.data.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // إرسال رسالة
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await api.post("/chat/send", {
        body: newMessage,
        receiver_id: selectedUser.id,
      });

      setNewMessage("");
      fetchMessages(selectedUser.id); // تحديث الرسائل بعد الإرسال
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // أول ما يفتح الصفحة يجيب المحادثات
  useEffect(() => {
    fetchConversations();
  }, []);

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
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedUser(conv);
                      fetchMessages(conv.id);
                    }}
                    className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-smooth"
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conv.profile_image} />
                        <AvatarFallback>
                          {conv.user_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{conv.user_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        آخر رسالة...
                      </p>
                    </div>
                    {/* تقدر تضيف badge لعدد الرسائل الغير مقروءة */}
                    <Badge variant="default" className="text-xs">
                      1
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 glass shadow-glass border-glass-border flex flex-col">
            {selectedUser ? (
              <>
                {/* Header */}
                <CardHeader className="border-b border-glass-border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedUser.profile_image} />
                      <AvatarFallback>
                        {selectedUser.user_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedUser.user_name}</h3>
                      <p className="text-sm text-muted-foreground">Active now</p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg) => {
                      const isMine = msg.sender.id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`p-3 rounded-lg max-w-xs ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent"
                            }`}
                          >
                            <p className="text-sm">{msg.body}</p>
                            <span className="text-xs opacity-70">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input */}
                  <div className="border-t border-glass-border p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        className="gradient-primary text-white"
                        onClick={sendMessage}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                اختر محادثة لعرض الرسائل
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
