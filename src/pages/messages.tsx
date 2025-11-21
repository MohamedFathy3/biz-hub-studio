"use client";
import { useEffect, useState, useContext, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MoreHorizontal, 
  Send, 
  Paperclip, 
  ImageIcon,
  FileText,
  MessageCircle 
} from "lucide-react";
import api from "@/lib/api";
import { AuthContext } from "@/Context/AuthContext";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, push, set, onValue, off } from 'firebase/database';

type UserShort = {
  id: number;
  user_name: string;
  profile_image?: string;
  user_type?: string;
};

type Conversation = {
  user: UserShort;
  lastMessage?: any;
  unreadCount: number;
};

type Message = {
  id: string | number;
  body: string;
  created_at: string;
  sender: UserShort;
  receiver: UserShort;
  timestamp?: number;
  type?: 'text' | 'image' | 'file' | 'product';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  product_info?: any;
};

export default function Messages() {
  const { user } = useContext(AuthContext);
  console.log("🔍 Current User from Context:", user);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserShort | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlUserId, setUrlUserId] = useState<number | null>(null);
  const [urlUserData, setUrlUserData] = useState<UserShort | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب الـ user_id من الـ URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    console.log("🔍 URL User ID:", userId);
    if (userId) {
      setUrlUserId(parseInt(userId));
    }
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // دالة مساعدة علشان تعمل room ID فريد
  const generateRoomId = (userId1: number, userId2: number) => {
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  };

  // جلب بيانات المستخدم من الـ ID
  const fetchUserData = async (userId: number): Promise<UserShort | null> => {
    try {
      console.log("🔄 Fetching user data for ID:", userId);
      const res = await api.get(`/user/${userId}`);
      console.log("✅ User Data Response:", res.data);
      
      if (res.data.data) {
        const userData = {
          id: res.data.data.id,
          user_name: res.data.data.user_name,
          profile_image: res.data.data.profile_image,
          user_type: res.data.data.user_type
        };
        console.log("✅ Processed User Data:", userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return null;
    }
  };

  // جلب قائمة المحادثات
// جلب قائمة المحادثات
const fetchConversations = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const res = await api.get("/conversations");
    console.log("🔍 Conversations API Raw Response:", res);
    console.log("🔍 Conversations API Data:", res.data);
    
    let conversationsData: Conversation[] = [];
    
    if (Array.isArray(res.data)) {
      // الحالة الأولى: البيانات جاية كـ array مباشرة
      conversationsData = res.data.map((conv: any) => ({
        user: {
          id: conv.user?.id || conv.id,
          user_name: conv.user?.user_name || conv.user_name,
          profile_image: conv.user?.profile_image || conv.profile_image,
          user_type: conv.user?.user_type || conv.user_type
        },
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0
      }));
    } else if (res.data && typeof res.data === 'object') {
      console.log("📁 Data is Object, checking structure...");
      
      // الحالة الثانية: البيانات جاية كـ object
      if (res.data.data) {
        console.log("📁 Data has data property:", res.data.data);
        
        if (Array.isArray(res.data.data)) {
          // data property هي array
          conversationsData = res.data.data.map((conv: any) => ({
            user: {
              id: conv.user?.id || conv.id,
              user_name: conv.user?.user_name || conv.user_name,
              profile_image: conv.user?.profile_image || conv.profile_image,
              user_type: conv.user?.user_type || conv.user_type
            },
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount || 0
          }));
        } else if (typeof res.data.data === 'object') {
          console.log("📁 Single conversation object structure:", res.data.data);
          
          // إذا البيانات فيها أرقام كمفاتيح (مثل: {0: {...}, 6: {...}})
          if (Object.keys(res.data.data).every(key => !isNaN(Number(key)))) {
            console.log("📁 Object with numeric keys - converting to array");
            conversationsData = Object.values(res.data.data).map((conv: any) => ({
              user: {
                id: conv.user?.id || conv.id,
                user_name: conv.user?.user_name || conv.user_name,
                profile_image: conv.user?.profile_image || conv.profile_image,
                user_type: conv.user?.user_type || conv.user_type
              },
              lastMessage: conv.lastMessage,
              unreadCount: conv.unreadCount || 0
            }));
          } else {
            // بيانات مستخدم واحد
            const userData = res.data.data;
            conversationsData = [{
              user: {
                id: userData.id,
                user_name: userData.user_name,
                profile_image: userData.profile_image,
                user_type: userData.user_type
              },
              lastMessage: null,
              unreadCount: 0
            }];
          }
        }
      } else if (res.data.result === "Success") {
        // إذا في structure تانية
        console.log("📁 Success result structure");
        if (res.data.data && typeof res.data.data === 'object') {
          if (Array.isArray(res.data.data)) {
            conversationsData = res.data.data.map((conv: any) => ({
              user: {
                id: conv.user?.id || conv.id,
                user_name: conv.user?.user_name || conv.user_name,
                profile_image: conv.user?.profile_image || conv.profile_image,
                user_type: conv.user?.user_type || conv.user_type
              },
              lastMessage: conv.lastMessage,
              unreadCount: conv.unreadCount || 0
            }));
          } else {
            // بيانات مستخدم واحد
            const userData = res.data.data;
            conversationsData = [{
              user: {
                id: userData.id,
                user_name: userData.user_name,
                profile_image: userData.profile_image,
                user_type: userData.user_type
              },
              lastMessage: null,
              unreadCount: 0
            }];
          }
        }
      }
    }
    
    console.log("✅ Final Conversations Data:", conversationsData);
    
    // نفلتر المحادثات اللي فيها بيانات user صحيحة
    const validConversations = conversationsData.filter(conv => 
      conv.user && conv.user.id && conv.user.user_name
    );
    
    setConversations(validConversations);
    
    // بعد ما نجيب المحادثات، نشوف لو في user_id في الـ URL
    if (urlUserId && !selectedUser) {
      await handleUrlUserId(validConversations);
    }
    
  } catch (error: any) {
    console.error("❌ Error fetching conversations:", error);
    setError("Failed to load conversations");
  } finally {
    setLoading(false);
  }
};
  // معالجة الـ user_id من الـ URL
  const handleUrlUserId = async (conversationsData: Conversation[]) => {
    if (!urlUserId || !user) {
      console.log("❌ Missing urlUserId or user");
      return;
    }

    console.log("🔄 Looking for existing conversation with user ID:", urlUserId);
    
    // نشوف لو فيه محادثة موجودة مع الـ user
    const existingConversation = conversationsData.find(conv => {
      console.log("🔍 Checking conversation user ID:", conv.user?.id);
      return conv.user?.id === urlUserId;
    });
    
    if (existingConversation) {
      console.log("✅ Found existing conversation:", existingConversation);
      // لو فيه محادثة موجودة، نفتحها
      handleSelectConversation(existingConversation);
    } else {
      console.log("❌ No existing conversation found, creating new one");
      // لو مفيش محادثة، نجيب بيانات المستخدم ونعمل محادثة جديدة
      const userData = await fetchUserData(urlUserId);
      if (userData) {
        console.log("✅ User data fetched successfully:", userData);
        setUrlUserData(userData);
        setSelectedUser(userData);
        
        // نعمل محادثة جديدة
        const newConversation: Conversation = {
          user: userData,
          lastMessage: null,
          unreadCount: 0
        };
        
        setSelectedConversation(newConversation);
        setNewMessage("Hello"); // نضع رسالة ترحيبية في الـ input
        
        console.log("✅ New conversation created:", newConversation);
        
        // نبدأ الـ realtime listener
        setupRealtimeListener(userData.id);
        
        // نركز على الـ input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      } else {
        console.error("❌ Failed to fetch user data for URL user ID:", urlUserId);
      }
    }
  };

  // دالة علشان نستمع للرسائل الجديدة في الـ realtime
  const setupRealtimeListener = (receiverId: number) => {
    if (!user) {
      console.log("❌ No user for realtime listener");
      return;
    }

    console.log("🔄 Setting up realtime listener for receiver:", receiverId);

    // نوقف أي listener قديم
    if (currentChatRoom) {
      console.log("🛑 Stopping old listener for room:", currentChatRoom);
      const oldRef = ref(db, `chats/${currentChatRoom}/messages`);
      off(oldRef);
    }

    const roomId = generateRoomId(user.id, receiverId);
    console.log("🆕 Room ID:", roomId);
    setCurrentChatRoom(roomId);

    const messagesRef = ref(db, `chats/${roomId}/messages`);
    
    onValue(messagesRef, (snapshot) => {
      console.log("📨 Firebase snapshot received:", snapshot.val());
      
      if (!snapshot.exists()) {
        console.log("📭 No messages in Firebase yet");
        setMessages([]);
        return;
      }
      
      const firebaseMessages: Message[] = [];
      const processedIds = new Set();
      
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        const messageId = messageData.id || childSnapshot.key;
        
        console.log("📝 Processing message:", messageData);
        
        // نتأكد من وجود id و timestamp
        if (messageId && !processedIds.has(messageId)) {
          processedIds.add(messageId);
          
          firebaseMessages.push({
            id: messageId,
            body: messageData.body || '',
            created_at: messageData.created_at || new Date().toISOString(),
            sender: {
              id: messageData.sender_id || 0,
              user_name: messageData.sender_name || 'User'
            },
            receiver: {
              id: messageData.receiver_id || 0,
              user_name: selectedUser?.user_name || 'User'
            },
            timestamp: messageData.timestamp || Date.now(),
            type: messageData.type || 'text',
            file_url: messageData.file_url,
            file_name: messageData.file_name,
            file_size: messageData.file_size,
            product_info: messageData.product_info
          });
        }
      });

      const sortedMessages = firebaseMessages.sort((a, b) => {
        const timeA = a.timestamp || new Date(a.created_at).getTime();
        const timeB = b.timestamp || new Date(b.created_at).getTime();
        return timeA - timeB;
      });

      console.log("✅ Sorted Firebase messages:", sortedMessages);

      setMessages(prevMessages => {
        const allMessages = [...prevMessages, ...sortedMessages];
        const uniqueMessages = allMessages.filter((msg, index, self) => 
          index === self.findIndex(m => m.id === msg.id)
        );
        const finalMessages = uniqueMessages.sort((a, b) => {
          const timeA = a.timestamp || new Date(a.created_at).getTime();
          const timeB = b.timestamp || new Date(b.created_at).getTime();
          return timeA - timeB;
        });
        
        console.log("✅ Final messages after merge:", finalMessages);
        return finalMessages;
      });

    }, (error) => {
      console.error("❌ Firebase realtime listener error:", error);
      setError("Realtime connection failed");
    });

    // نستمع لـ typing indicators
    const typingRef = ref(db, `chats/${roomId}/typing`);
    onValue(typingRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val()[receiverId]) {
        console.log("⌨️ User is typing...");
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });
  };
const sendNotification = async (receiverId: number, notificationData: {
  type: string;
  title: string;
  message: string;
  sender_id: number;
  sender_name: string;
  sender_image: string;
  data?: any;
}) => {
  try {
    if (!user) {
      console.error("❌ Cannot send notification - user not found");
      return;
    }

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notificationRef = ref(db, `notifications/${receiverId}/${notificationId}`);
    
    const fullNotificationData = {
      ...notificationData,
      id: notificationId,
      timestamp: Date.now(),
      read: false
    };

    console.log("📨 Sending notification:", fullNotificationData);
    await set(notificationRef, fullNotificationData);
    
    console.log(`✅ Notification sent to user ${receiverId}: ${notificationData.type}`);
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

  // إرسال typing indicator
  const sendTypingIndicator = (isTyping: boolean) => {
    if (!user || !selectedUser || !currentChatRoom) {
      console.log("❌ Cannot send typing indicator - missing data");
      return;
    }
    
    console.log("⌨️ Sending typing indicator:", isTyping);
    const typingRef = ref(db, `chats/${currentChatRoom}/typing/${user.id}`);
    set(typingRef, isTyping);
  };

  // جلب الرسائل بيني وبين شخص معين
  const fetchMessages = async (receiverId: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching messages for receiver:", receiverId);

      const res = await api.get("/chat/messages", {
        params: { receiver_id: receiverId },
      });
      
      console.log("✅ Messages API Response:", res.data);
      
      let messagesData: Message[] = [];
      
      if (Array.isArray(res.data)) {
        messagesData = res.data;
      } else if (Array.isArray(res.data.data)) {
        messagesData = res.data.data;
      } else if (res.data && typeof res.data === 'object') {
        if (res.data.error) {
          messagesData = [];
        } else {
          messagesData = Object.values(res.data);
        }
      }
      
      console.log("🔍 Raw Messages Data:", messagesData);
      
      // نتأكد من كل message يكون فيه id
      const validMessages = messagesData.filter(msg => 
        msg && msg.id && msg.created_at
      ).map(msg => ({
        ...msg,
        id: msg.id || `api_${Date.now()}_${Math.random()}`,
        timestamp: msg.timestamp || new Date(msg.created_at).getTime()
      }));
      
      console.log("✅ Valid Messages:", validMessages);
      setMessages(validMessages);
      setupRealtimeListener(receiverId);
      
    } catch (error: any) {
      console.error("❌ Error fetching messages:", error);
      console.error("❌ Error details:", error.response?.data);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // إرسال رسالة نصية
 const sendMessage = async () => {
  if (!newMessage.trim() || !selectedUser || !user) return;

  try {
    setError(null);

    const roomId = generateRoomId(user.id, selectedUser.id);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      id: messageId,
      body: newMessage,
      sender_id: user.id,
      receiver_id: selectedUser.id,
      sender_name: user.user_name,
      sender_type: 'user',
      timestamp: Date.now(),
      created_at: new Date().toISOString(),
      type: 'text'
    };

    // إرسال للـ Laravel API
    await api.post("/chat/send", {
      body: newMessage,
      receiver_id: selectedUser.id,
    });

    // إرسال للـ Firebase
    const messagesRef = ref(db, `chats/${roomId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageData);

    // 🔥 إرسال إشعار للمستقبل
    await sendNotification(selectedUser.id, {
      type: 'new_message',
      title: 'New Message',
      message: `New message from ${user.user_name}: ${newMessage}`,
      sender_id: user.id,
      sender_name: user.user_name,
      sender_image: user.profile_image,
      data: {
        message_id: messageId,
        room_id: roomId
      }
    });

    setNewMessage("");
    sendTypingIndicator(false);
    
    // نحدث قائمة المحادثات
    fetchConversations();
    
  } catch (error: any) {
    console.error("❌ Error sending message:", error);
    setError("Failed to send message");
  }
};
  // رفع ملف أو صورة
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("📎 File selected:", file);
    
    if (!file || !selectedUser || !user) {
      console.log("❌ Missing file, selectedUser, or user");
      return;
    }

    // نتأكد من وجود الـ selectedUser.id
    if (!selectedUser.id) {
      console.error("❌ selectedUser.id is missing:", selectedUser);
      setError("Cannot upload file - user data is incomplete");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // إنشاء FormData علشان نرفع الملف
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiver_id', selectedUser.id.toString());

      console.log("🔄 Uploading file...");

      // رفع الملف للـ Laravel
      const uploadResponse = await api.post('/chat/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("✅ File upload response:", uploadResponse.data);

      const fileData = uploadResponse.data.data;
      
      const roomId = generateRoomId(user.id, selectedUser.id);
      const messageId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const messageData = {
        id: messageId,
        body: fileData.file_name || 'File shared',
        sender_id: user.id,
        receiver_id: selectedUser.id,
        sender_name: user.user_name || 'User',
        sender_type: 'user',
        timestamp: Date.now(),
        created_at: new Date().toISOString(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        file_url: fileData.file_url,
        file_name: fileData.file_name,
        file_size: fileData.file_size
      };

      console.log("📤 Sending file message:", messageData);

      // نتأكد من عدم وجود undefined في البيانات
      const hasUndefined = Object.values(messageData).some(value => value === undefined);
      if (hasUndefined) {
        console.error("❌ File message data contains undefined values:", messageData);
        throw new Error("File message data contains undefined values");
      }

      // إرسال للـ Firebase
      const messagesRef = ref(db, `chats/${roomId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, messageData);

      // نظف الـ input
      event.target.value = '';

      // نحدث قائمة المحادثات
      fetchConversations();

    } catch (error: any) {
      console.error("❌ Error uploading file:", error);
      console.error("❌ Error details:", error.response?.data);
      setError("Failed to upload file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // فتح ملف picker
  const handleAttachClick = () => {
    console.log("📎 Opening file picker...");
    fileInputRef.current?.click();
  };

  // إرسال رسالة سريعة (Quick Replies)
  const sendQuickReply = (message: string) => {
    console.log("⚡ Sending quick reply:", message);
    setNewMessage(message);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // عند اختيار محادثة
const handleSelectConversation = (conversation: Conversation) => {
  console.log("🔍 Selected Conversation:", conversation);
  
  // نتحقق من بيانات الـ user
  if (!conversation.user || !conversation.user.id || !conversation.user.user_name) {
    console.error("❌ Cannot select conversation - user data is incomplete:", conversation);
    return;
  }
  
  setSelectedConversation(conversation);
  setSelectedUser(conversation.user);
  setUrlUserData(null); // نظف بيانات الـ URL user
  
  console.log("✅ Fetching messages for user:", conversation.user.id);
  fetchMessages(conversation.user.id);
};

  // تنظيف الـ listeners
  useEffect(() => {
    return () => {
      if (currentChatRoom) {
        console.log("🧹 Cleaning up Firebase listeners for room:", currentChatRoom);
        const messagesRef = ref(db, `chats/${currentChatRoom}/messages`);
        const typingRef = ref(db, `chats/${currentChatRoom}/typing`);
        off(messagesRef);
        off(typingRef);
      }
    };
  }, [currentChatRoom]);

  // أول ما يفتح الصفحة يجيب المحادثات
  useEffect(() => {
    console.log("🔍 User changed, fetching conversations...");
    if (user) {
      fetchConversations();
    } else {
      console.log("❌ No user, skipping conversations fetch");
    }
  }, [user, urlUserId]);

  // Quick replies للدكاترة والمرضى
  const doctorQuickReplies = [
    "What are your symptoms?",
    "When did the symptoms start?",
    "Do you have any allergies?",
    "Are you taking any medications?",
    "Can you describe the pain?",
    "I'll review your test results"
  ];

  const patientQuickReplies = [
    "I need to schedule an appointment",
    "Can you explain the diagnosis?",
    "What are the treatment options?",
    "Are there any side effects?",
    "When should I follow up?",
    "Thank you doctor"
  ];

  // دالة علشان تعرض حجم الملف بشكل مقروء
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // دالة علشان تعمل key فريد للرسائل
  const getMessageKey = (msg: Message, index: number) => {
    if (msg.id && msg.timestamp) {
      return `${msg.id}_${msg.timestamp}`;
    }
    if (msg.id) {
      return msg.id.toString();
    }
    if (msg.timestamp) {
      return `msg_${msg.timestamp}_${index}`;
    }
    return `msg_${Date.now()}_${index}_${Math.random()}`;
  };

  // المستخدم اللي مختار (إما من المحادثات أو من الـ URL)
  const displayUser = selectedUser || urlUserData;
  console.log("🔍 Display User:", displayUser);

  // حل مشكلة user_type
  const userType = user?.user_type || user?.type || 'patient';
  console.log("🔍 User Type for Quick Replies:", userType);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 h-screen flex flex-col">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
          {/* Conversations List */}
          <Card className="lg:col-span-1 glass shadow-glass border-glass-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Messages</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={fetchConversations}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search doctors..." 
                  className="pl-10 bg-white/50"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {!conversations || conversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new conversation</p>
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <div
                      key={conversation.user?.id || `conv_${index}`}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-all duration-200 group ${
                        selectedConversation?.user?.id === conversation.user?.id 
                          ? 'bg-blue-50 border-r-2 border-blue-500' 
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="border-2 border-white shadow-sm">
                          <AvatarImage src={conversation.user?.profile_image} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
                            {conversation.user?.user_name?.charAt(0) || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">
                            Dr. {conversation.user?.user_name}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessage?.created_at 
                              ? new Date(conversation.lastMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              : ''
                            }
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.body || 'Start a conversation'}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 glass shadow-glass border-glass-border flex flex-col">
            {displayUser ? (
              <>
                {/* Header */}
                <CardHeader className="border-b border-glass-border pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="border-2 border-white shadow-md">
                        <AvatarImage src={displayUser.profile_image} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
                          Dr. {displayUser.user_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">Dr. {displayUser.user_name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm text-muted-foreground">
                            {isTyping ? 'Typing...' : 'Online • Available for consultation'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {urlUserData && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        New Conversation
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Quick Replies */}
                  <div className="p-4 border-b">
                    <div className="flex flex-wrap gap-2">
                      {(userType === 'doctor' ? doctorQuickReplies : patientQuickReplies)
                        .map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs bg-white/50 hover:bg-white"
                          onClick={() => sendQuickReply(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-400px)]">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {urlUserData ? "Start a new conversation" : "No messages yet"}
                        </h3>
                        <p className="text-sm">
                          {urlUserData 
                            ? `Send your first message to Dr. ${displayUser.user_name}`
                            : `Start the conversation with Dr. ${displayUser.user_name}`
                          }
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isMine = msg.sender?.id === user?.id;
                        const isProductMessage = msg.product_info;
                        const isImage = msg.type === 'image';
                        const isFile = msg.type === 'file';
                        
                        return (
                          <div
                            key={getMessageKey(msg, index)}
                            className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
                          >
                            <div className={`flex gap-2 max-w-xs lg:max-w-md ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                              {!isMine && (
                                <Avatar className="w-8 h-8 mt-1">
                                  <AvatarImage src={displayUser.profile_image} />
                                  <AvatarFallback>D</AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className="space-y-1">
                                {isProductMessage && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                    <div className="flex gap-3">
                                      {msg.product_info?.product_image && (
                                        <img 
                                          src={msg.product_info.product_image} 
                                          alt="Product"
                                          className="w-12 h-12 rounded object-cover"
                                        />
                                      )}
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm">{msg.product_info?.product_name}</p>
                                        <p className="text-green-600 font-bold">${msg.product_info?.product_price}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {isImage && msg.file_url && (
                                  <div className="mb-2">
                                    <img 
                                      src={msg.file_url} 
                                      alt="Shared image"
                                      className="max-w-full max-h-64 rounded-lg object-cover border border-gray-200"
                                    />
                                  </div>
                                )}

                                {isFile && msg.file_url && (
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-8 h-8 text-blue-500" />
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm truncate">{msg.file_name}</p>
                                        <p className="text-xs text-gray-500">
                                          {msg.file_size ? formatFileSize(msg.file_size) : 'Unknown size'}
                                        </p>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        asChild
                                      >
                                        <a href={msg.file_url} download target="_blank" rel="noopener noreferrer">
                                          Download
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                <div
                                  className={`p-3 rounded-2xl ${
                                    isMine
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                                      : "bg-white border border-gray-200 rounded-bl-md shadow-sm"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">{msg.body}</p>
                                </div>
                                
                                <span className={`text-xs text-muted-foreground block ${isMine ? "text-right" : "text-left"}`}>
                                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={displayUser.profile_image} />
                            <AvatarFallback>D</AvatarFallback>
                          </Avatar>
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-glass-border p-4 bg-white/50">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full"
                        onClick={handleAttachClick}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                      </Button>
                      <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          sendTypingIndicator(e.target.value.length > 0);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1 rounded-full bg-white"
                      />
                      <Button
                        size="sm"
                        className="rounded-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !selectedUser?.id}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-12 h-12 text-blue-300" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Welcome to Medical Chat</h3>
                <p className="text-center max-w-md">
                  Select a conversation to start messaging with healthcare professionals.
                  Get medical advice, schedule appointments, and discuss your health concerns.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}