import React, { useEffect, useState, useContext, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, MessageCircle, User } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, push, set, onValue, off, get, query, orderByChild, update } from 'firebase/database';

type Friend = {
  id: number;
  user_name: string;
  profile_image?: string;
  user_type?: string;
  first_name?: string;
  last_name?: string;
};

type Message = {
  id: string;
  body: string;
  created_at: string;
  sender_id: number;
  receiver_id: number;
  sender_name?: string;
  timestamp?: number;
  type?: 'text' | 'image' | 'file';
  read?: boolean;
};

export default function ContactsGroups() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<number, string>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null);

  // 🔥 دالة إرسال الإشعارات
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
        read: false,
        sender_type: 'user'
      };

      console.log("📨 Sending notification:", fullNotificationData);
      await set(notificationRef, fullNotificationData);
      
      console.log(`✅ Notification sent to user ${receiverId}: ${notificationData.type}`);
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  };

  // Generate room ID
  const generateRoomId = (userId1: number, userId2: number) => {
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  };

  // Fetch friends from Firebase
  useEffect(() => {
    if (!currentUserId) return;

    const fetchFriendsFromFirebase = () => {
      const friendshipsRef = ref(db, 'friendships');
      
      const unsubscribe = onValue(friendshipsRef, (snapshot) => {
        if (!snapshot.exists()) {
          setFriends([]);
          setFilteredFriends([]);
          return;
        }

        const friendsList: Friend[] = [];

        snapshot.forEach((childSnapshot) => {
          const friendshipData = childSnapshot.val();
          const friendshipId = childSnapshot.key;
          
          // Check if friendship involves current user and is accepted
          if (friendshipId && friendshipId.includes(currentUserId.toString()) && 
              friendshipData.status === 'friends') {
            
            const userIds = friendshipId.split('_').map(Number);
            const otherUserId = userIds.find(id => id !== currentUserId);
            
            if (otherUserId) {
              const otherUser: Friend = {
                id: otherUserId,
                user_name: friendshipData.user1_id === otherUserId ? 
                          friendshipData.user1_name : friendshipData.user2_name,
                profile_image: friendshipData.user1_id === otherUserId ? 
                              friendshipData.user1_image : friendshipData.user2_image,
                user_type: friendshipData.user1_id === otherUserId ? 
                          friendshipData.user1_type : friendshipData.user2_type,
                first_name: "",
                last_name: ""
              };
              friendsList.push(otherUser);
            }
          }
        });

        setFriends(friendsList);
        setFilteredFriends(friendsList);
        
        // Fetch last messages for all friends
        fetchLastMessagesForFriends(friendsList);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchFriendsFromFirebase();
    return () => unsubscribe();
  }, [currentUserId]);

  // Filter friends based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(friend =>
        friend.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (friend.first_name && friend.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (friend.last_name && friend.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredFriends(filtered);
    }
  }, [searchTerm, friends]);

  // Fetch last messages for all friends
  const fetchLastMessagesForFriends = async (friendsList: Friend[]) => {
    if (!currentUserId) return;

    const lastMessagesMap: Record<number, string> = {};
    const unreadCountsMap: Record<number, number> = {};

    for (const friend of friendsList) {
      const roomId = generateRoomId(currentUserId, friend.id);
      const messagesRef = ref(db, `chats/${roomId}/messages`);
      const messagesQuery = query(messagesRef, orderByChild('timestamp'));
      
      try {
        const snapshot = await get(messagesQuery);
        if (snapshot.exists()) {
          const messages: Message[] = [];
          let unreadCount = 0;

          snapshot.forEach((childSnapshot) => {
            const messageData = childSnapshot.val();
            const message: Message = {
              id: childSnapshot.key || messageData.id,
              body: messageData.body,
              created_at: messageData.created_at,
              sender_id: messageData.sender_id,
              receiver_id: messageData.receiver_id,
              sender_name: messageData.sender_name,
              timestamp: messageData.timestamp,
              type: messageData.type || 'text',
              read: messageData.read || false
            };
            messages.push(message);

            // Count unread messages from this friend
            if (message.sender_id === friend.id && !message.read) {
              unreadCount++;
            }
          });

          // Get last message
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            lastMessagesMap[friend.id] = lastMsg.body;
          }

          // Set unread count
          if (unreadCount > 0) {
            unreadCountsMap[friend.id] = unreadCount;
          }
        }
      } catch (error) {
        console.error("Error fetching messages for friend:", friend.id, error);
      }
    }

    setLastMessages(lastMessagesMap);
    setUnreadCounts(unreadCountsMap);
  };

  // Setup real-time chat listener
  const setupChatListener = (friendId: number) => {
    if (!currentUserId) return;

    // Stop previous listener
    if (currentChatRoom) {
      const oldRef = ref(db, `chats/${currentChatRoom}/messages`);
      off(oldRef);
    }

    const roomId = generateRoomId(currentUserId, friendId);
    setCurrentChatRoom(roomId);

    const messagesRef = ref(db, `chats/${roomId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setMessages([]);
        return;
      }

      const firebaseMessages: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        firebaseMessages.push({
          id: childSnapshot.key || messageData.id,
          body: messageData.body,
          created_at: messageData.created_at,
          sender_id: messageData.sender_id,
          receiver_id: messageData.receiver_id,
          sender_name: messageData.sender_name,
          timestamp: messageData.timestamp,
          type: messageData.type || 'text',
          read: messageData.read || false
        });
      });

      // Sort messages by timestamp
      const sortedMessages = firebaseMessages.sort((a, b) => 
        (a.timestamp || 0) - (b.timestamp || 0)
      );

      setMessages(sortedMessages);

      // Mark messages as read when opening chat
      markMessagesAsRead(friendId, sortedMessages);
    });

    return unsubscribe;
  };

  // Mark messages as read
  const markMessagesAsRead = async (friendId: number, messages: Message[]) => {
    if (!currentUserId) return;

    try {
      const roomId = generateRoomId(currentUserId, friendId);
      const updates: any = {};

      messages.forEach(message => {
        if (message.sender_id === friendId && !message.read) {
          updates[`chats/${roomId}/messages/${message.id}/read`] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        
        // Update unread counts
        setUnreadCounts(prev => ({
          ...prev,
          [friendId]: 0
        }));
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Select friend for chat
  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setMessages([]);
    const unsubscribe = setupChatListener(friend.id);
    
    // Cleanup on component unmount or friend change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  };

  // 🔥 Send message with notification
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !currentUserId || !user) return;

    try {
      const roomId = generateRoomId(currentUserId, selectedFriend.id);
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const messageData = {
        id: messageId,
        body: newMessage.trim(),
        sender_id: currentUserId,
        receiver_id: selectedFriend.id,
        sender_name: user.user_name || 'User',
        timestamp: Date.now(),
        created_at: new Date().toISOString(),
        type: 'text',
        read: false
      };

      // Send to Firebase
      const messagesRef = ref(db, `chats/${roomId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, messageData);

      // 🔥 إرسال إشعار للمستقبل
      await sendNotification(selectedFriend.id, {
        type: 'new_message',
        title: 'New Message',
        message: `New message from ${user.user_name}: ${newMessage.trim()}`,
        sender_id: currentUserId,
        sender_name: user.user_name,
        sender_image: user.profile_image || '',
        data: {
          message_id: messageId,
          room_id: roomId,
          message_preview: newMessage.trim().substring(0, 50) + (newMessage.trim().length > 50 ? '...' : ''),
          chat_type: 'direct_message'
        }
      });

      setNewMessage("");
      
      // Update last message
      setLastMessages(prev => ({
        ...prev,
        [selectedFriend.id]: newMessage.trim()
      }));

      console.log(`✅ Message sent to ${selectedFriend.user_name} with notification`);

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get display name for friend
  const getDisplayName = (friend: Friend) => {
    if (friend.first_name && friend.last_name) {
      return `${friend.first_name} ${friend.last_name}`;
    }
    return friend.user_type === 'doctor' ? `Dr. ${friend.user_name}` : friend.user_name;
  };

  // 🔥 Listen for new notifications (optional - for real-time badge updates)
  useEffect(() => {
    if (!currentUserId) return;

    const notificationsRef = ref(db, `notifications/${currentUserId}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        // يمكننا استخدام هذا لتحديث الـ badges أو عرض إشعارات فورية
        console.log("📬 New notifications received");
        
        // يمكننا إضافة toast notification هنا لو عاوزين
        // toast.success("New message received!");
      }
    });

    return () => {
      off(notificationsRef);
    };
  }, [currentUserId]);

  return (
    <div className="fixed top-15 right-5 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Friends</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {filteredFriends.length} friends
        </Badge>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No friends found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => handleSelectFriend(friend)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                selectedFriend?.id === friend.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Avatar className="border-2 border-white shadow-sm">
                <AvatarImage src={friend.profile_image} alt={getDisplayName(friend)} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
                  {friend.user_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800 truncate">
                    {getDisplayName(friend)}
                  </p>
                  {unreadCounts[friend.id] > 0 && (
                    <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                      {unreadCounts[friend.id]}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {lastMessages[friend.id] || 'No messages yet'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Modal */}
      {selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
              <Avatar>
                <AvatarImage src={selectedFriend.profile_image} alt={getDisplayName(selectedFriend)} />
                <AvatarFallback>
                  {selectedFriend.user_name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {getDisplayName(selectedFriend)}
                </p>
                <p className="text-sm text-gray-500">Online now</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFriend(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          isMine
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {isMine && msg.read && (
                          <p className="text-xs text-blue-200 mt-1">✓ Read</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white rounded-b-xl">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-full"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Messages will trigger notifications
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}