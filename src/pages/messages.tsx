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
  MessageCircle,
  Smile,
  ArrowLeft,
  Menu
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
  is_read?: boolean;
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
  const [showEmojis, setShowEmojis] = useState(false);
  
  // 🔥 الحاجات الجديدة علشان الموبايل
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showChatView, setShowChatView] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // اللون الجديد اللي طلبته
  const primaryColor = "#039fb3";
  const primaryLight = "#e6f7f9";
  const primaryDark = "#028a9c";

  // Emojis للرسائل السريعة
  const quickEmojis = ['😊', '👍', '❤️', '😂', '😍', '🙏', '👏', '🔥', '🎉', '🤔'];

  // 🔥 نحدد إذا الجهاز موبايل ولا لا
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowChatList(true);
        setShowChatView(false);
      } else {
        setShowChatList(true);
        setShowChatView(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // 🔥 دالة علشان نفتح الشات في الموبايل
  const openChat = (conversation: Conversation) => {
    handleSelectConversation(conversation);
    if (isMobile) {
      setShowChatList(false);
      setShowChatView(true);
    }
  };

  // 🔥 دالة علشان نرجع لقائمة المحادثات في الموبايل
  const backToChatList = () => {
    if (isMobile) {
      setShowChatList(true);
      setShowChatView(false);
      setSelectedUser(null);
      setSelectedConversation(null);
    }
  };

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

  // 🔥 جلب قائمة المحادثات - الإصدار المعدل
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get("/conversations");
      console.log("🔍 Conversations API Raw Response:", res);
      console.log("🔍 Conversations API Data:", res.data);
      
      let conversationsData: Conversation[] = [];
      
      // الحالة الأولى: البيانات جاية كـ array مباشرة
      if (Array.isArray(res.data)) {
        console.log("📁 Data is direct array");
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
      } 
      // الحالة الثانية: البيانات جاية كـ object مع data property
      else if (res.data && typeof res.data === 'object') {
        console.log("📁 Data is object, checking structure...");
        
        if (res.data.data) {
          console.log("📁 Data has data property:", res.data.data);
          
          // إذا data هي array
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
          } 
          // إذا data هي object بمفاتيح رقمية
          else if (typeof res.data.data === 'object') {
            const dataObj = res.data.data;
            
            // نتحقق إذا فيه مفاتيح رقمية (مثل: {0: {...}, 1: {...}})
            const keys = Object.keys(dataObj);
            const hasNumericKeys = keys.every(key => !isNaN(Number(key)));
            
            if (hasNumericKeys && keys.length > 0) {
              console.log("📁 Object with numeric keys - converting to array");
              conversationsData = Object.values(dataObj).map((conv: any) => ({
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
              // بيانات مستخدم واحد فقط
              console.log("📁 Single conversation object");
              const userData = dataObj;
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
      
      // 🔥 إصلاح: إزالة المحادثات المكررة
      const uniqueConversations = conversationsData.filter((conv, index, self) => 
        index === self.findIndex(c => 
          c.user && c.user.id && c.user.id === conv.user?.id
        )
      );
      
      console.log("✅ Unique Conversations:", uniqueConversations);
      
      // نفلتر المحادثات اللي فيها بيانات user صحيحة
      const validConversations = uniqueConversations.filter(conv => 
        conv.user && conv.user.id && conv.user.user_name
      );
      
      console.log("✅ Valid Conversations:", validConversations);
      
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
      openChat(existingConversation);
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
        
        // نفتح الشات في الموبايل
        if (isMobile) {
          setShowChatList(false);
          setShowChatView(true);
        }
        
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
        // نظل الرسايل من الـ API موجودة
        return;
      }
      
      const firebaseMessages: Message[] = [];
      const processedIds = new Set();
      
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        const messageId = messageData.id || childSnapshot.key;
        
        console.log("📝 Processing Firebase message:", messageData);
        
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
            product_info: messageData.product_info,
            is_read: messageData.is_read || false
          });
        }
      });

      const sortedFirebaseMessages = firebaseMessages.sort((a, b) => {
        const timeA = a.timestamp || new Date(a.created_at).getTime();
        const timeB = b.timestamp || new Date(b.created_at).getTime();
        return timeA - timeB;
      });

      console.log("✅ Sorted Firebase messages:", sortedFirebaseMessages);

      // 🔥 إصلاح: نستخدم Firebase messages كـ source رئيسي
      setMessages(sortedFirebaseMessages);

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
      console.log("🔄 Setting up Firebase listener for receiver:", receiverId);
      
      // نستخدم Firebase فقط علشان نتجنب التكرار
      setupRealtimeListener(receiverId);
      
    } catch (error: any) {
      console.error("❌ Error setting up messages:", error);
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
        type: 'text',
        is_read: false
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

  // إرسال إيموجي
  const sendEmoji = async (emoji: string) => {
    if (!selectedUser || !user) return;

    try {
      setError(null);

      const roomId = generateRoomId(user.id, selectedUser.id);
      const messageId = `emoji_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const messageData = {
        id: messageId,
        body: emoji,
        sender_id: user.id,
        receiver_id: selectedUser.id,
        sender_name: user.user_name,
        sender_type: 'user',
        timestamp: Date.now(),
        created_at: new Date().toISOString(),
        type: 'text',
        is_read: false
      };

      // إرسال للـ Laravel API
      await api.post("/chat/send", {
        body: emoji,
        receiver_id: selectedUser.id,
      });

      // إرسال للـ Firebase
      const messagesRef = ref(db, `chats/${roomId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, messageData);

      setShowEmojis(false);
      
      // نحدث قائمة المحادثات
      fetchConversations();
      
    } catch (error: any) {
      console.error("❌ Error sending emoji:", error);
      setError("Failed to send emoji");
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
        file_size: fileData.file_size,
        is_read: false
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
      <div className="h-screen flex bg-white overflow-hidden">
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg m-4 max-w-md">
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
        
        {/* 🔥 قائمة المحادثات - تظهر في الموبايل لما يكون الشات مقفول */}
        {(showChatList || !isMobile) && (
          <div className={`${isMobile ? 'w-full' : 'w-96'} border-r border-gray-200 bg-white flex flex-col h-full`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full text-white hover:bg-white/20">
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full text-white hover:bg-white/20">
                    <Menu className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {!conversations || conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="font-medium mb-2">No conversations yet</p>
                  <p className="text-sm">Start a new conversation with a doctor</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conversation, index) => (
                    <div
                      key={conversation.user?.id || `conv_${index}`}
                      onClick={() => openChat(conversation)}
                      className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversation?.user?.id === conversation.user?.id 
                          ? 'bg-blue-50' 
                          : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-12 h-12 border-2 border-white">
                          <AvatarImage src={conversation.user?.profile_image} />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {conversation.user?.user_name?.charAt(0) || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            Dr. {conversation.user?.user_name}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {conversation.lastMessage?.created_at 
                              ? new Date(conversation.lastMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              : ''
                            }
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.body || 'Start a conversation'}
                        </p>
                      </div>

                      {conversation.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔥 نافذة الشات - تظهر في الموبايل لما نفتح محادثة */}
        {(showChatView || !isMobile) && displayUser ? (
          <div className={`${isMobile ? 'w-full' : 'flex-1'} bg-gray-50 flex flex-col h-full`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                    onClick={backToChatList}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                
                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                  <AvatarImage src={displayUser.profile_image} />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {displayUser.user_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 text-lg">Dr. {displayUser.user_name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      {isTyping ? 'Typing...' : 'Online'}
                    </p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="rounded-full text-gray-600 hover:bg-gray-100">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <MessageCircle className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-700">
                    {urlUserData ? "Start a new conversation" : "No messages yet"}
                  </h3>
                  <p className="text-center text-sm max-w-xs">
                    {urlUserData 
                      ? `Send your first message to Dr. ${displayUser.user_name}`
                      : `Say hello to Dr. ${displayUser.user_name} and start your consultation`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isMine = msg.sender?.id === user?.id;
                    const isProductMessage = msg.product_info;
                    const isImage = msg.type === 'image';
                    const isFile = msg.type === 'file';
                    
                    return (
                      <div
                        key={getMessageKey(msg, index)}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isMine ? "" : ""}`}>
                          {isProductMessage && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
                              <div className="flex gap-3">
                                {msg.product_info?.product_image && (
                                  <img 
                                    src={msg.product_info.product_image} 
                                    alt="Product"
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900">{msg.product_info?.product_name}</p>
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
                                className="max-w-full max-h-64 rounded-lg object-cover border border-gray-200 shadow-sm"
                              />
                            </div>
                          )}

                          {isFile && msg.file_url && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-blue-500" />
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{msg.file_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {msg.file_size ? formatFileSize(msg.file_size) : 'Unknown size'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={`p-3 rounded-2xl shadow-sm ${
                              isMine
                                ? "rounded-br-md text-white"
                                : "bg-white border border-gray-200 rounded-bl-md"
                            }`}
                            style={isMine ? { backgroundColor: primaryColor } : {}}
                          >
                            <p className="text-sm leading-relaxed">{msg.body}</p>
                          </div>
                          
                          <div className={`flex items-center gap-2 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            
                            {isMine && (
                              <div className="flex items-center gap-0.5">
                                <span className={`text-xs ${msg.is_read ? 'text-blue-300' : 'text-gray-400'}`}>✓</span>
                                <span className={`text-xs ${msg.is_read ? 'text-blue-300' : 'text-gray-400'}`}>✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {(userType === 'doctor' ? doctorQuickReplies : patientQuickReplies)
                  .map((reply, index) => (
                  <button
                    key={index}
                    className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm transition-colors whitespace-nowrap"
                    onClick={() => sendQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Emoji Picker */}
              {showEmojis && (
                <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {quickEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="text-xl p-1 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => sendEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-gray-600 hover:bg-gray-100"
                  onClick={handleAttachClick}
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-gray-600 hover:bg-gray-100"
                  onClick={() => setShowEmojis(!showEmojis)}
                >
                  <Smile className="w-5 h-5" />
                </Button>
                
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
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
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  />
                </div>
                
                <Button
                  size="sm"
                  className="rounded-full text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !selectedUser?.id}
                  style={{ 
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  }}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Empty State when no chat is selected on desktop
          !isMobile && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                <MessageCircle className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="font-semibold text-2xl mb-3 text-gray-700">Welcome to Medical Chat</h3>
              <p className="text-center max-w-md text-gray-600 mb-8">
                Select a conversation to start messaging with healthcare professionals.
                Get medical advice, schedule appointments, and discuss your health concerns.
              </p>
              <div 
                className="px-6 py-3 rounded-full text-white font-medium shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                Start a Conversation
              </div>
            </div>
          )
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </MainLayout>
  );
}