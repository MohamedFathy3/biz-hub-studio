"use client";
import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from '@/lib/api';
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  UserCheck, 
  UserX, 
  Clock,
  Users,
  UserPlus,
  MessageCircle,
  CheckCircle,
  XCircle,
  Bell,
  Trash2
} from "lucide-react";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, onValue, off, update, set, remove, query, orderByChild } from 'firebase/database';
import { AuthContext } from "@/Context/AuthContext";

interface User {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string;
  specialization: string;
  university: string;
  experience_years: number;
  user_type?: string;
}

interface FriendRequest {
  id: string;
  user1_id: number;
  user2_id: number;
  user1_name: string;
  user1_image: string;
  user2_name: string;
  user2_image: string;
  status: 'pending' | 'accepted' | 'rejected';
  requested_by: number;
  created_at: number;
  user_data?: User;
}

interface Friend {
  id: string;
  user1_id: number;
  user2_id: number;
  user1_data?: User;
  user2_data?: User;
  status: 'accepted';
  created_at: number;
  accepted_at: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  sender_id: number;
  sender_name: string;
  sender_image: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

type ActiveTab = 'friends' | 'requests' | 'notifications';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<ActiveTab>('friends');
  
  // States for different data
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // الألوان
  const BLUE_PRIMARY = '#039fb3';
  const WHITE = '#ffffff';

  // 🔥 جلب كل البيانات من Firebase
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

   // 1. جلب الأصدقاء - الجزء المعدل
const friendsRef = query(ref(db, 'friendships'), orderByChild('status'));
const friendsUnsubscribe = onValue(friendsRef, async (snapshot) => {
  if (!snapshot.exists()) {
    setFriends([]);
    return;
  }

  const friendsData: Friend[] = [];
  const userDataPromises: Promise<Friend>[] = [];
  
  snapshot.forEach((childSnapshot) => {
    const friendData = childSnapshot.val();
    const friendId = childSnapshot.key;
    
    if (friendId && friendData.status === 'accepted' && 
        (friendData.user1_id === currentUser.id || friendData.user2_id === currentUser.id)) {
      
      const friend: Friend = {
        ...friendData,
        id: friendId
      };

      // جلب بيانات المستخدم الآخر
      const userDataPromise = (async () => {
        try {
          const otherUserId = friend.user1_id === currentUser.id ? friend.user2_id : friend.user1_id;
          console.log("🔄 Fetching friend user data for ID:", otherUserId);
          
          const response = await api.get(`/user/${otherUserId}`);
          console.log("✅ Friend User API Response:", response.data);
          
          if (response.data.data) {
            const userData = response.data.data;
            console.log("✅ Friend User Data Received:", userData);
            
            if (friend.user1_id === currentUser.id) {
              return {
                ...friend,
                user2_data: {
                  id: userData.id,
                  user_name: userData.user_name || 'Unknown',
                  first_name: userData.first_name || 'User',
                  last_name: userData.last_name || '',
                  email: userData.email || '',
                  profile_image: userData.profile_image || '',
                  specialization: userData.specialization || userData.fields?.[0]?.name || 'General',
                  university: userData.university || 'Not specified',
                  experience_years: userData.experience_years || 0,
                  user_type: userData.user_type
                }
              };
            } else {
              return {
                ...friend,
                user1_data: {
                  id: userData.id,
                  user_name: userData.user_name || 'Unknown',
                  first_name: userData.first_name || 'User',
                  last_name: userData.last_name || '',
                  email: userData.email || '',
                  profile_image: userData.profile_image || '',
                  specialization: userData.specialization || userData.fields?.[0]?.name || 'General',
                  university: userData.university || 'Not specified',
                  experience_years: userData.experience_years || 0,
                  user_type: userData.user_type
                }
              };
            }
          }
        } catch (error) {
          console.error("❌ Error fetching friend user data:", error);
          
          // Fallback data
          const otherUserId = friend.user1_id === currentUser.id ? friend.user2_id : friend.user1_id;
          const fallbackData = {
            id: otherUserId,
            user_name: 'user',
            first_name: 'User',
            last_name: '',
            email: '',
            profile_image: '',
            specialization: 'Not specified',
            university: 'Not specified',
            experience_years: 0,
            user_type: 'user'
          };
          
          if (friend.user1_id === currentUser.id) {
            return {
              ...friend,
              user2_data: fallbackData
            };
          } else {
            return {
              ...friend,
              user1_data: fallbackData
            };
          }
        }
        
        // Final fallback
        const otherUserId = friend.user1_id === currentUser.id ? friend.user2_id : friend.user1_id;
        const finalFallbackData = {
          id: otherUserId,
          user_name: 'user',
          first_name: 'User',
          last_name: '',
          email: '',
          profile_image: '',
          specialization: 'Not specified',
          university: 'Not specified',
          experience_years: 0,
          user_type: 'user'
        };
        
        if (friend.user1_id === currentUser.id) {
          return {
            ...friend,
            user2_data: finalFallbackData
          };
        } else {
          return {
            ...friend,
            user1_data: finalFallbackData
          };
        }
      })();

      userDataPromises.push(userDataPromise);
    }
  });

  try {
    const friendsWithUserData = await Promise.all(userDataPromises);
    console.log("✅ All friends with user data:", friendsWithUserData);
    setFriends(friendsWithUserData);
  } catch (error) {
    console.error("❌ Error processing friend user data:", error);
    // نستخدم البيانات الأساسية إذا فشل جلب البيانات
    const basicFriends = friendsData.map(friend => {
      const otherUserId = friend.user1_id === currentUser.id ? friend.user2_id : friend.user1_id;
      const fallbackData = {
        id: otherUserId,
        user_name: 'user',
        first_name: 'User',
        last_name: '',
        email: '',
        profile_image: '',
        specialization: 'Not specified',
        university: 'Not specified',
        experience_years: 0,
        user_type: 'user'
      };
      
      if (friend.user1_id === currentUser.id) {
        return {
          ...friend,
          user2_data: fallbackData
        };
      } else {
        return {
          ...friend,
          user1_data: fallbackData
        };
      }
    });
    setFriends(basicFriends);
  }
});

    // 2. جلب طلبات الصداقة
    const requestsRef = query(ref(db, 'friendships'), orderByChild('status'));
    const requestsUnsubscribe = onValue(requestsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setRequests([]);
        return;
      }

      const requestsData: FriendRequest[] = [];
      const userDataPromises: Promise<FriendRequest>[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const requestData = childSnapshot.val();
        const requestId = childSnapshot.key;
        
        if (requestId && 
            (requestData.user1_id === currentUser.id || requestData.user2_id === currentUser.id) &&
            requestData.status === 'pending') {
          
          const request: FriendRequest = {
            ...requestData,
            id: requestId
          };

          // جلب بيانات المستخدم
          const userDataPromise = (async () => {
            try {
              const otherUserId = request.user1_id === currentUser.id ? request.user2_id : request.user1_id;
              const response = await api.get(`/user/${otherUserId}`);
              
              if (response.data.data) {
                return {
                  ...request,
                  user_data: response.data.data
                };
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
            return request;
          })();

          userDataPromises.push(userDataPromise);
        }
      });

      try {
        const requestsWithUserData = await Promise.all(userDataPromises);
        setRequests(requestsWithUserData);
      } catch (error) {
        console.error("Error processing user data:", error);
      }
    });

    // 3. جلب الإشعارات
    const notificationsRef = ref(db, `notifications/${currentUser.id}`);
    const notificationsUnsubscribe = onValue(notificationsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setNotifications([]);
        return;
      }

      const notificationsData: Notification[] = [];
      snapshot.forEach((childSnapshot) => {
        const notificationData = childSnapshot.val();
        const notificationId = childSnapshot.key;
        
        if (notificationId) {
          notificationsData.push({
            ...notificationData,
            id: notificationId
          });
        }
      });

      // ترتيب الإشعارات من الأحدث إلى الأقدم
      notificationsData.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(notificationsData);
    });

    setLoading(false);

    return () => {
      off(friendsRef);
      off(requestsRef);
      off(notificationsRef);
    };
  }, [currentUser]);

  // 🔥 إحصائيات
  const { friendsCount, pendingRequestsCount, unreadNotificationsCount } = useMemo(() => {
    return {
      friendsCount: friends.length,
      pendingRequestsCount: requests.length,
      unreadNotificationsCount: notifications.filter(n => !n.read).length
    };
  }, [friends, requests, notifications]);

  // 🔥 الفلترة والبحث
  const filteredFriends = useMemo(() => {
    if (!searchTerm) return friends;
    
    const term = searchTerm.toLowerCase();
    return friends.filter(friend => {
      const otherUser = friend.user1_id === currentUser?.id ? friend.user2_data : friend.user1_data;
      return (
        otherUser?.first_name?.toLowerCase().includes(term) ||
        otherUser?.last_name?.toLowerCase().includes(term) ||
        otherUser?.user_name?.toLowerCase().includes(term) ||
        otherUser?.specialization?.toLowerCase().includes(term) ||
        otherUser?.university?.toLowerCase().includes(term)
      );
    });
  }, [friends, searchTerm, currentUser]);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const otherUser = request.user_data;
      const term = searchTerm.toLowerCase();
      return (
        otherUser?.first_name?.toLowerCase().includes(term) ||
        otherUser?.last_name?.toLowerCase().includes(term) ||
        otherUser?.user_name?.toLowerCase().includes(term) ||
        otherUser?.specialization?.toLowerCase().includes(term) ||
        otherUser?.university?.toLowerCase().includes(term)
      );
    });
  }, [requests, searchTerm]);

  // 🔥 دالة إرسال الإشعارات
  const sendNotification = useCallback(async (receiverId: number, notificationData: {
    type: string;
    title: string;
    message: string;
    sender_id: number;
    sender_name: string;
    sender_image: string;
    data?: any;
  }) => {
    try {
      if (!currentUser) return;

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notificationRef = ref(db, `notifications/${receiverId}/${notificationId}`);
      
      const fullNotificationData = {
        ...notificationData,
        id: notificationId,
        timestamp: Date.now(),
        read: false,
        sender_type: 'user'
      };

      await set(notificationRef, fullNotificationData);
      
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  }, [currentUser]);

  // 🔥 معالجة طلبات الصداقة
  const handleFriendRequest = useCallback(async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
    if (!currentUser) return;

    try {
      setSelectedRequest(requestId);
      setSelectedAction(action);
      
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        console.error("❌ Request not found:", requestId);
        return;
      }

      const otherUserId = request.user1_id === currentUser.id ? request.user2_id : request.user1_id;

      if (action === 'accept' || action === 'reject') {
        // استخدام الـ API للرد على طلبات الصداقة
        const response = await api.post(`/friend-requests/${otherUserId}/respond`, {
          action: action
        });

        console.log("✅ API Response:", response.data);

        const requestRef = ref(db, `friendships/${requestId}`);
        
        if (action === 'accept') {
          await update(requestRef, {
            status: 'accepted',
            updated_at: Date.now(),
            accepted_at: Date.now()
          });

          // إشعار القبول
          await sendNotification(otherUserId, {
            type: 'friend_request_accepted',
            title: 'Friend Request Accepted 🎉',
            message: `${currentUser.first_name} ${currentUser.last_name} accepted your friend request! You are now friends.`,
            sender_id: currentUser.id,
            sender_name: currentUser.user_name,
            sender_image: currentUser.profile_image,
            data: {
              friendship_id: requestId,
              action: 'accepted'
            }
          });

        } else if (action === 'reject') {
          await update(requestRef, {
            status: 'rejected',
            updated_at: Date.now(),
            rejected_at: Date.now()
          });

          // إشعار الرفض
          await sendNotification(otherUserId, {
            type: 'friend_request_rejected',
            title: 'Friend Request Declined',
            message: `${currentUser.first_name} ${currentUser.last_name} declined your friend request`,
            sender_id: currentUser.id,
            sender_name: currentUser.user_name,
            sender_image: currentUser.profile_image,
            data: {
              friendship_id: requestId,
              action: 'rejected'
            }
          });
        }

      } else if (action === 'cancel') {
        // إلغاء الطلب
        const requestRef = ref(db, `friendships/${requestId}`);
        await remove(requestRef);

        // إشعار الإلغاء
        await sendNotification(otherUserId, {
          type: 'friend_request_cancelled',
          title: 'Friend Request Cancelled',
          message: `${currentUser.first_name} ${currentUser.last_name} cancelled the friend request`,
          sender_id: currentUser.id,
          sender_name: currentUser.user_name,
          sender_image: currentUser.profile_image,
          data: {
            friendship_id: requestId,
            action: 'cancelled'
          }
        });
      }

      // تحديث الـ state محلياً
      setRequests(prev => prev.filter(req => req.id !== requestId));

    } catch (error: any) {
      console.error(`❌ Error ${action}ing friend request:`, error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
    } finally {
      setSelectedRequest(null);
      setSelectedAction(null);
    }
  }, [currentUser, requests, sendNotification]);

  // 🔥 حذف الإشعار
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!currentUser) return;

    try {
      const notificationRef = ref(db, `notifications/${currentUser.id}/${notificationId}`);
      await remove(notificationRef);
      
      // تحديث الـ state محلياً
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error("❌ Error deleting notification:", error);
    }
  }, [currentUser]);

  // 🔥 تعيين الإشعار كمقروء
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!currentUser) return;

    try {
      const notificationRef = ref(db, `notifications/${currentUser.id}/${notificationId}`);
      await update(notificationRef, {
        read: true
      });
      
      // تحديث الـ state محلياً
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  }, [currentUser]);

  // 🔥 دالات التنقل
  const handleSendMessage = useCallback((userId: number) => {
    navigate(`/messages?user_id=${userId}`);
  }, [navigate]);

  const viewProfile = useCallback((userId: number) => {
    navigate(`/profile/${userId}`);
  }, [navigate]);

  // 🔥 البحث مع debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  // 🔥 دالة لعرض المحتوى بناءً على التبويب النشط
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-64">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: BLUE_PRIMARY }}
          ></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'friends':
        return renderFriendsContent();
      case 'requests':
        return renderRequestsContent();
      case 'notifications':
        return renderNotificationsContent();
      default:
        return renderFriendsContent();
    }
  };

  const renderFriendsContent = () => {
    return (
      <div className="space-y-4">
        {filteredFriends.length === 0 ? (
          <Card className="text-center py-12 border-0 shadow-sm">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No friends found' : 'No friends yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Start connecting with other healthcare professionals'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFriends.map((friend) => {
            const otherUser = friend.user1_id === currentUser?.id ? friend.user2_data : friend.user1_data;
            const otherUserId = friend.user1_id === currentUser?.id ? friend.user2_id : friend.user1_id;

            return (
              <Card key={friend.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar 
                      className="w-16 h-16 border-2 cursor-pointer transition-transform hover:scale-105"
                      style={{ borderColor: BLUE_PRIMARY + '20' }}
                      onClick={() => viewProfile(otherUserId)}
                    >
                      <AvatarImage src={otherUser?.profile_image} />
                      <AvatarFallback className="text-lg" style={{ backgroundColor: BLUE_PRIMARY, color: WHITE }}>
                        {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 
                            className="font-semibold text-lg cursor-pointer hover:underline transition-colors"
                            onClick={() => viewProfile(otherUserId)}
                            style={{ color: BLUE_PRIMARY }}
                          >
                            {otherUser?.first_name} {otherUser?.last_name}
                          </h3>
                          <p className="text-gray-600 text-sm">@{otherUser?.user_name}</p>
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className="bg-green-100 text-green-800 text-xs"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Friends
                        </Badge>
                      </div>

                     

                      {/* Connected Since */}
                      <p className="text-xs text-gray-500">
                        Connected since {new Date(friend.accepted_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage(otherUserId)}
                        className="flex items-center gap-1 transition-all hover:scale-105"
                        style={{ backgroundColor: BLUE_PRIMARY }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  const renderRequestsContent = () => {
    return (
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="text-center py-12 border-0 shadow-sm">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No requests found' : 'No pending requests'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'All friend requests are handled'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const isSentByMe = request.requested_by === currentUser?.id;
            const otherUser = request.user_data;
            const otherUserId = isSentByMe ? request.user2_id : request.user1_id;

            return (
              <Card key={request.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar 
                      className="w-16 h-16 border-2 cursor-pointer transition-transform hover:scale-105"
                      style={{ borderColor: BLUE_PRIMARY + '20' }}
                      onClick={() => viewProfile(otherUserId)}
                    >
                      <AvatarImage src={otherUser?.profile_image} />
                      <AvatarFallback className="text-lg" style={{ backgroundColor: BLUE_PRIMARY, color: WHITE }}>
                        {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 
                            className="font-semibold text-lg cursor-pointer hover:underline transition-colors"
                            onClick={() => viewProfile(otherUserId)}
                            style={{ color: BLUE_PRIMARY }}
                          >
                            {otherUser?.first_name} {otherUser?.last_name}
                          </h3>
                          <p className="text-gray-600 text-sm">@{otherUser?.user_name}</p>
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            isSentByMe 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {isSentByMe ? 'Sent' : 'Received'}
                        </Badge>
                      </div>

                      {/* Specialization and Info */}
                      {otherUser?.specialization && (
                        <p className="text-sm text-gray-700 mb-2">
                          {otherUser.specialization}
                          {otherUser?.university && ` • ${otherUser.university}`}
                          {otherUser?.experience_years && ` • ${otherUser.experience_years} years experience`}
                        </p>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {isSentByMe ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFriendRequest(request.id, 'cancel')}
                          disabled={selectedRequest === request.id && selectedAction === 'cancel'}
                          className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {selectedRequest === request.id && selectedAction === 'cancel' ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Cancel
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleFriendRequest(request.id, 'accept')}
                            disabled={selectedRequest === request.id && selectedAction === 'accept'}
                            className="flex items-center gap-1 transition-all hover:scale-105"
                            style={{ backgroundColor: BLUE_PRIMARY }}
                          >
                            {selectedRequest === request.id && selectedAction === 'accept' ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFriendRequest(request.id, 'reject')}
                            disabled={selectedRequest === request.id && selectedAction === 'reject'}
                            className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(otherUserId)}
                        className="flex items-center gap-1 border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  const renderNotificationsContent = () => {
    return (
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="text-center py-12 border-0 shadow-sm">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600">
                You'll see notifications about friend requests and messages here
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-0 shadow-sm transition-all duration-200 ${
                !notification.read ? 'bg-blue-50 border-l-4' : ''
              }`}
              style={{ borderLeftColor: !notification.read ? BLUE_PRIMARY : 'transparent' }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 border-2" style={{ borderColor: BLUE_PRIMARY + '20' }}>
                    <AvatarImage src={notification.sender_image} />
                    <AvatarFallback className="text-sm" style={{ backgroundColor: BLUE_PRIMARY, color: WHITE }}>
                      {notification.sender_name?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className={`font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            New
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(notification.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>

                    {/* Notification Type */}
                    <Badge 
                      variant="outline" 
                      className="text-xs border-gray-200"
                    >
                      {notification.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 border-green-200 text-green-600 hover:bg-green-50 text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 min-h-screen" style={{ backgroundColor: WHITE }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: BLUE_PRIMARY }}>
            Friends & Connections
          </h1>
          <p className="text-gray-600">
            Manage your friends, requests, and notifications in one place
          </p>
        </div>

        {/* Search and Stats */}
        <Card className="mb-6 shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-300"
                    style={{ borderColor: BLUE_PRIMARY + '20' }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg" style={{ color: BLUE_PRIMARY }}>
                    {friendsCount}
                  </div>
                  <div className="text-gray-500">Friends</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-orange-600">
                    {pendingRequestsCount}
                  </div>
                  <div className="text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-purple-600">
                    {unreadNotificationsCount}
                  </div>
                  <div className="text-gray-500">Unread</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="grid w-full grid-cols-3 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'friends' 
                  ? 'shadow-sm text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ 
                backgroundColor: activeTab === 'friends' ? BLUE_PRIMARY : 'transparent'
              }}
            >
              <UserCheck className="w-4 h-4" />
              Friends ({friendsCount})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'requests' 
                  ? 'shadow-sm text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ 
                backgroundColor: activeTab === 'requests' ? BLUE_PRIMARY : 'transparent'
              }}
            >
              <UserPlus className="w-4 h-4" />
              Requests ({pendingRequestsCount})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'notifications' 
                  ? 'shadow-sm text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ 
                backgroundColor: activeTab === 'notifications' ? BLUE_PRIMARY : 'transparent'
              }}
            >
              <Bell className="w-4 h-4" />
              Notifications ({unreadNotificationsCount})
            </button>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </MainLayout>
  );
}