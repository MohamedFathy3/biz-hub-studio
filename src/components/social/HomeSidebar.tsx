"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  CheckCircle2, 
  Calendar, 
  Image as ImageIcon, 
  MessageCircle, 
  Bell,
  X,
  User,
  Heart,
  Share2
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "@/Context/AuthContext";
import { useNavigate } from "react-router-dom";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, onValue, off, update, query, orderByChild } from 'firebase/database';

interface FriendRequest {
  id: number;
  status: string;
  sender: {
    id: number;
    user_name: string;
    profile_image: string;
    first_name?: string;
    last_name?: string;
  };
}

interface Friend {
  id: number;
  user_name: string;
  profile_image: string;
  first_name?: string;
  last_name?: string;
}

interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'new_message' | 'post_like' | 'post_comment' | 'post_share';
  title: string;
  message: string;
  sender_id: number;
  sender_name: string;
  sender_image: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

const events = [
  { id: 1, title: "Dental Conference", date: "Oct 28, 2025" },
  { id: 2, title: "Medical Workshop", date: "Nov 5, 2025" },
];

const photos = [
  "https://smilehousedentalcenter.com/assets/images/categories/16702389799%20(1).png",
  "https://eurodentalcenter.com/wp-content/uploads/2024/06/%D8%B7%D9%88%D8%A7%D8%B1%D8%A6-%D8%B7%D8%A8-%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86.jpg",
  "https://smilink-dental.com/wp-content/uploads/2024/06/%D8%A8%D8%A7%D9%84%D8%B5%D9%88%D8%B1-%D9%82%D9%88%D9%8A%D9%85-%D8%A7%D9%84%D8%A7%D8%B3%D9%86%D8%A7%D9%86.jpeg",
  "https://i0.wp.com/blog.asnany.net/wp-content/uploads/2024/07/befor-after.jpg?resize=788%2C713&ssl=1",
  "https://www.imtilakgroup.com/cdn-cgi/image/format=webp,fit=cover,width=787,height=400px/https://www.ilajak.com/uploads/posts/50d078a02ef9b6bb58517430ac307d54Ytz_160MkS.jpg",
  "https://s3-eu-west-1.amazonaws.com/content.argaamnews.com/963f7626-c065-49b3-90f1-c4a1a77385a5.jpg",
];

export default function HomeSidebar() {
  const { user, loading: userLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [confirmedFriends, setConfirmedFriends] = useState<Friend[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // دالة علشان نعمل room ID فريد
  const generateFriendshipId = (userId1: number, userId2: number) => {
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  };

  // 🔥 جلب جميع الإشعارات من Firebase
  const fetchNotificationsFromFirebase = () => {
    if (!user) return;

    const notificationsRef = ref(db, `notifications/${user.id}`);
    const notificationsQuery = query(notificationsRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(notificationsQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setNotifications([]);
        return;
      }

      const notificationsList: Notification[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const notificationData = childSnapshot.val();
        notificationsList.push({
          id: childSnapshot.key || Date.now().toString(),
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          sender_id: notificationData.sender_id,
          sender_name: notificationData.sender_name,
          sender_image: notificationData.sender_image,
          data: notificationData.data,
          timestamp: notificationData.timestamp,
          read: notificationData.read || false
        });
      });

      // نرتب الإشعارات من الأحدث للأقدم ونأخذ آخر 10
      const sortedNotifications = notificationsList
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      
      setNotifications(sortedNotifications);
    });

    return unsubscribe;
  };

  // 🔥 جلب طلبات الصداقة من Firebase
  const fetchFriendRequestsFromFirebase = () => {
    if (!user) return;

    const friendshipRef = ref(db, 'friendships');
    
    const unsubscribe = onValue(friendshipRef, (snapshot) => {
      if (!snapshot.exists()) {
        setFriendRequests([]);
        setConfirmedFriends([]);
        return;
      }

      const pendingRequests: FriendRequest[] = [];
      const friends: Friend[] = [];

      snapshot.forEach((childSnapshot) => {
        const friendshipData = childSnapshot.val();
        const friendshipId = childSnapshot.key;
        
        // نشوف لو الصداقة متعلقة بالـ user الحالي
        if (friendshipId && friendshipId.includes(user.id.toString())) {
          const userIds = friendshipId.split('_').map(Number);
          const otherUserId = userIds.find(id => id !== user.id);
          
          if (otherUserId) {
            const otherUser = {
              id: otherUserId,
              user_name: friendshipData.user1_id === otherUserId ? friendshipData.user1_name : friendshipData.user2_name,
              profile_image: friendshipData.user1_id === otherUserId ? friendshipData.user1_image : friendshipData.user2_image,
              first_name: "",
              last_name: ""
            };

            if (friendshipData.status === 'pending' && friendshipData.requested_by !== user.id) {
              // طلبات الصداقة الواردة (مش المرسلة مني)
              pendingRequests.push({
                id: Date.now() + otherUserId,
                status: 'pending',
                sender: otherUser
              });
            } else if (friendshipData.status === 'friends') {
              // الأصدقاء المقبولين
              friends.push(otherUser);
            }
          }
        }
      });

      setFriendRequests(pendingRequests.slice(0, 2));
      setConfirmedFriends(friends.slice(0, 2));
    });

    return unsubscribe;
  };

  // 🔥 وضع إشعار كمقروء
  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const notificationRef = ref(db, `notifications/${user.id}/${notificationId}`);
      await update(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // 🔥 حذف إشعار
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const notificationRef = ref(db, `notifications/${user.id}/${notificationId}`);
      await update(notificationRef, null);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // 🔥 معالجة النقر على إشعار
  const handleNotificationClick = (notification: Notification) => {
    // نضع الإشعار كمقروء
    markNotificationAsRead(notification.id);

    // نتحرك حسب نوع الإشعار
    switch (notification.type) {
      case 'friend_request':
        navigate('/friends?tab=requests');
        break;
      case 'friend_accepted':
        navigate('/friends?tab=friends');
        break;
      case 'new_message':
        if (notification.data?.sender_id) {
          navigate(`/messages?user_id=${notification.data.sender_id}`);
        }
        break;
      case 'post_like':
      case 'post_comment':
      case 'post_share':
        if (notification.data?.post_id) {
          navigate(`/post/${notification.data.post_id}`);
        }
        break;
      default:
        break;
    }

    setShowNotifications(false);
  };

  // 🔥 قبول طلب صداقة
  const acceptFriendRequest = async (senderId: number) => {
    if (!user) return;

    try {
      const friendshipId = generateFriendshipId(user.id, senderId);
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      await update(friendshipRef, {
        status: 'friends',
        updated_at: Date.now(),
        accepted_at: Date.now()
      });

      await api.put(`/friend-requests/${senderId}/respond`);

      setFriendRequests(prev => prev.filter(req => req.sender.id !== senderId));
      
      const userResponse = await api.get(`/user/${senderId}`);
      if (userResponse.data.data) {
        const newFriend = {
          id: senderId,
          user_name: userResponse.data.data.user_name,
          profile_image: userResponse.data.data.profile_image,
          first_name: userResponse.data.data.first_name,
          last_name: userResponse.data.data.last_name
        };
        setConfirmedFriends(prev => [newFriend, ...prev].slice(0, 2));
      }

    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    }
  };

  // 🔥 رفض طلب صداقة
  const rejectFriendRequest = async (senderId: number) => {
    if (!user) return;

    try {
      const friendshipId = generateFriendshipId(user.id, senderId);
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      await update(friendshipRef, {
        status: 'rejected',
        updated_at: Date.now(),
        rejected_at: Date.now()
      });

      await api.put(`/friend-requests/${senderId}/reject`);
      setFriendRequests(prev => prev.filter(req => req.sender.id !== senderId));

    } catch (error: any) {
      console.error("Error rejecting friend request:", error);
      alert("Failed to reject friend request");
    }
  };

  // 🔥 فتح الشات مع صديق
  const handleMessageFriend = (friendId: number) => {
    navigate(`/messages?user_id=${friendId}`);
  };

  // 🔥 مشاهدة كل الطلبات
  const handleViewAllRequests = () => {
    navigate('/PendingRequests');
  };

  // 🔥 مشاهدة كل الأصدقاء
  const handleViewAllFriends = () => {
    navigate('/PendingRequests');
  };

  // 🔥 مشاهدة كل الإشعارات
  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  // 🔥 الحصول على أيقونة حسب نوع الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'friend_accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'new_message':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'post_like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'post_comment':
        return <MessageCircle className="w-4 h-4 text-orange-500" />;
      case 'post_share':
        return <Share2 className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // 🔥 الحصول على لون حسب نوع الإشعار
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'bg-blue-50 border-blue-200';
      case 'friend_accepted':
        return 'bg-green-50 border-green-200';
      case 'new_message':
        return 'bg-purple-50 border-purple-200';
      case 'post_like':
        return 'bg-red-50 border-red-200';
      case 'post_comment':
        return 'bg-orange-50 border-orange-200';
      case 'post_share':
        return 'bg-teal-50 border-teal-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  useEffect(() => {
    const unsubscribeFriends = fetchFriendRequestsFromFirebase();
    const unsubscribeNotifications = fetchNotificationsFromFirebase();
    
    return () => {
      if (unsubscribeFriends) unsubscribeFriends();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [user]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed w-[280px] space-y-4 ">
      {/* Notifications */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Bell className="text-purple-500 w-5 h-5" />
            <CardTitle className="text-base font-semibold">Notifications</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {unreadNotificationsCount}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 h-8 w-8"
            >
              {showNotifications ? <X className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {showNotifications ? (
            <>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No notifications yet
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                        notification.read ? 'opacity-70' : 'opacity-100'
                      } ${getNotificationColor(notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-gray-800 text-sm">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-gray-600 text-xs mt-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {notifications.length > 0 && (
            <></>
              )}
            </>
          ) : (
            <>
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                    notification.read ? 'opacity-60' : 'opacity-100'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-sm truncate">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              ))}
              
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No new notifications
                </p>
              )}
              
              {notifications.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => setShowNotifications(true)}
                >
                  Show {notifications.length - 3} more
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Friend Requests */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="text-blue-500 w-5 h-5" />
            <CardTitle className="text-base font-semibold">Friend Requests</CardTitle>
          </div>
          {friendRequests.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {friendRequests.length}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {friendRequests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              No pending requests
            </p>
          ) : (
            <>
              {friendRequests.map((request) => (
                <div
                  key={request.sender.id}
                  className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <img
                    src={request.sender.profile_image}
                    alt={request.sender.user_name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-white shadow-sm"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {request.sender.first_name && request.sender.last_name 
                        ? `${request.sender.first_name} ${request.sender.last_name}`
                        : request.sender.user_name
                      }
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{request.sender.user_name}</p>

                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => acceptFriendRequest(request.sender.id)}
                      >
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => rejectFriendRequest(request.sender.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={handleViewAllRequests}
              >
                View All Requests
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* باقي المكونات بدون تغيير */}
      {/* Confirmed Friends */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 w-5 h-5" />
            <CardTitle className="text-base font-semibold">Friends</CardTitle>
          </div>
          {confirmedFriends.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {confirmedFriends.length}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {userLoading ? (
            <p className="text-sm text-gray-500 text-center py-2">Loading friends...</p>
          ) : confirmedFriends.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              No friends yet
            </p>
          ) : (
            <>
              {confirmedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={friend.profile_image}
                      alt={friend.user_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">
                        {friend.first_name && friend.last_name 
                          ? `${friend.first_name} ${friend.last_name}`
                          : friend.user_name
                        }
                      </p>
                      <p className="text-gray-500 text-xs truncate">@{friend.user_name}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                    onClick={() => handleMessageFriend(friend.id)}
                    title="Send message"
                  >
                    <MessageCircle className="w-3 h-3 text-blue-600" />
                  </Button>
                </div>
              ))}

              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleViewAllFriends}
              >
                View All Friends
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Events */}
      {/* <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
        <CardHeader className="flex items-center gap-2 pb-3">
          <Calendar className="text-orange-500 w-5 h-5" />
          <CardTitle className="text-base font-semibold">Medical Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <p className="font-medium text-gray-800 text-sm">{event.title}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {event.date}
              </p>
            </div>
          ))}
        </CardContent>
      </Card> */}

      {/* Photos */}
      {/* <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4">
        <CardHeader className="flex items-center gap-2 pb-3">
          <ImageIcon className="text-pink-500 w-5 h-5" />
          <CardTitle className="text-base font-semibold">Dental Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Dental photo ${index + 1}`}
                className="w-full h-20 rounded-lg object-cover border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.open(photo, '_blank')}
              />
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}

// Badge component
const Badge = ({ variant = "default", className = "", children, ...props }: any) => {
  const baseStyles = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};