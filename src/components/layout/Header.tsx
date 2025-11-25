// components/Header.tsx
import { 
  Search, Home, Users, MessageCircle, Bell, Menu, ChevronDown, X,
  UserPlus, Heart, MessageSquare, Share2, CheckCircle2,
  BookOpen, Store, Briefcase, Calendar, Settings, BarChart3 // 🔥 أضف الـ icons المطلوبة
} from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import { useContext, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "@/Context/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, onValue, off, update, query, orderByChild } from 'firebase/database';

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

// 🔥 أضف function cn هنا
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const Header = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  // 🔥 Mobile Menu Items - كل الصفحات هنا
  const mobileMenuItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/User", icon: Users, label: "Friends" },
    // { href: "/PendingRequests", icon: UserPlus, label: "Pending Requests" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/stories", icon: BookOpen, label: "Explore Stories" },
    { href: "/store", icon: Store, label: "Store" },
    { href: "/Alljobs", icon: Briefcase, label: "My Jobs" },
    { href: "/jobs", icon: Briefcase, label: "Jobs" },
    { href: "/Rent", icon: Store, label: "Rent Clinic" },
    { href: "/event", icon: Calendar, label: "Latest Event" },
    // { href: "/settings", icon: Settings, label: "Settings" },
    // { href: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  // 🔥 جلب الإشعارات الحقيقية من Firebase
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

      // نرتب الإشعارات من الأحدث للأقدم
      const sortedNotifications = notificationsList
        .sort((a, b) => b.timestamp - a.timestamp);
      
      setNotifications(sortedNotifications);
    });

    return unsubscribe;
  };

  // 🔥 جلب طلبات الصداقة
  const fetchFriendRequestsFromFirebase = () => {
    if (!user) return;

    const friendshipRef = ref(db, 'friendships');
    
    const unsubscribe = onValue(friendshipRef, (snapshot) => {
      if (!snapshot.exists()) {
        setFriendRequests([]);
        return;
      }

      const pendingRequests: any[] = [];

      snapshot.forEach((childSnapshot) => {
        const friendshipData = childSnapshot.val();
        const friendshipId = childSnapshot.key;
        
        if (friendshipId && friendshipId.includes(user.id.toString())) {
          const userIds = friendshipId.split('_').map(Number);
          const otherUserId = userIds.find(id => id !== user.id);
          
          if (otherUserId && friendshipData.status === 'pending' && friendshipData.requested_by !== user.id) {
            const otherUser = {
              id: otherUserId,
              user_name: friendshipData.user1_id === otherUserId ? friendshipData.user1_name : friendshipData.user2_name,
              profile_image: friendshipData.user1_id === otherUserId ? friendshipData.user1_image : friendshipData.user2_image,
              first_name: "",
              last_name: ""
            };

            pendingRequests.push({
              id: Date.now() + otherUserId,
              status: 'pending',
              sender: otherUser
            });
          }
        }
      });

      setFriendRequests(pendingRequests);
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

  // 🔥 معالجة النقر على إشعار
  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);

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
    const friendshipId = [user.id, senderId].sort((a, b) => a - b).join('_');
    const friendshipRef = ref(db, `friendships/${friendshipId}`);
    
    // تحديث حالة الصداقة في Firebase
    await update(friendshipRef, {
      status: 'friends',
      updated_at: Date.now(),
      accepted_at: Date.now()
    });

    // 🔥 إرسال طلب للباك إند علشان التوثيق
    await api.post(`/friend-requests/${senderId}/respond`, {
      action: "accept"
    });

    setFriendRequests(prev => prev.filter(req => req.sender.id !== senderId));
  } catch (error: any) {
    console.error("Error accepting friend request:", error);
  }
};

  // 🔥 رفض طلب صداقة
 const rejectFriendRequest = async (senderId: number) => {
  if (!user) return;

  try {
    const friendshipId = [user.id, senderId].sort((a, b) => a - b).join('_');
    const friendshipRef = ref(db, `friendships/${friendshipId}`);
    
    await update(friendshipRef, {
      status: 'rejected',
      updated_at: Date.now(),
      rejected_at: Date.now()
    });

    // 🔥 إرسال طلب للباك إند علشان التوثيق
    await api.post(`/friend-requests/${senderId}/respond`, {
      action: "reject"
    });

    setFriendRequests(prev => prev.filter(req => req.sender.id !== senderId));
  } catch (error: any) {
    console.error("Error rejecting friend request:", error);
  }
};

  // 🔥 الحصول على أيقونة الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-4 h-4" />;
      case 'friend_accepted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'new_message':
        return <MessageCircle className="w-4 h-4" />;
      case 'post_like':
        return <Heart className="w-4 h-4" />;
      case 'post_comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'post_share':
        return <Share2 className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // 🔥 الحصول على لون الإشعار
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return "bg-blue-100 text-blue-600";
      case 'friend_accepted':
        return "bg-green-100 text-green-600";
      case 'new_message':
        return "bg-purple-100 text-purple-600";
      case 'post_like':
        return "bg-red-100 text-red-600";
      case 'post_comment':
        return "bg-orange-100 text-orange-600";
      case 'post_share':
        return "bg-teal-100 text-teal-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // 🔥 تنسيق الوقت
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  useEffect(() => {
    const unsubscribeNotifications = fetchNotificationsFromFirebase();
    const unsubscribeFriendRequests = fetchFriendRequestsFromFirebase();
    
    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications();
      if (unsubscribeFriendRequests) unsubscribeFriendRequests();
    };
  }, [user]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadFriendRequestsCount = friendRequests.length;

  return (
    <>
      <header
        className={cn(
          "h-16 bg-white border-b border-gray-200 fixed top-0 z-40 transition-all duration-300 shadow-sm",
          "left-0 right-0"
        )}
      >
        <div className="flex items-center justify-between h-full px-4 md:px-6 w-full">
          {/* 🔥 Left Section - Logo & Menu */}
          <div className="flex items-center gap-3">
            {/* Menu Button - يظهر في الموبيل فقط */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(true)}
              className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Logo - يظهر في الموبيل */}
            <div className="lg:hidden flex items-center gap-2">
              <img
                src="/website_blue.png"
                alt="Dent Studio Logo"
                className=" object-contain"
                style={{width: "134px"}}
              />
          
            </div>

          
          </div>

          {/* 🔥 Center Section - Navigation - يظهر في الديسكتوب فقط */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {[
              { href: "/", icon: Home, label: "Home" },
              { href: "/User", icon: Users, label: "Friends" },
              // { href: "/PendingRequests", icon: Users, label: "Pending Requests" },
              { href: "/messages", icon: MessageCircle, label: "Messages" },
            ].map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center w-20 h-12 rounded-xl mx-1 transition-all duration-200",
                    isActive
                      ? "bg-[#039fb3] text-white shadow-lg shadow-blue-100"
                      : "text-gray-500 hover:text-[#039fb3] hover:bg-gray-50"
                  )
                }
              >
                <Button variant="ghost" className="h-12 w-full rounded-xl">
                  <item.icon className="w-5 h-5" />
                </Button>
              </NavLink>
            ))}
          </div>

          {/* 🔥 Right Section - Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Search Button - يظهر في الموبيل فقط */}
           

            {/* Notifications Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "p-2 hover:bg-gray-100 rounded-xl transition-all duration-200",
                  showNotifications && "bg-blue-50 text-[#039fb3]"
                )}
              >
                <Bell className="w-5 h-5" />
                {(unreadNotificationsCount > 0 || unreadFriendRequestsCount > 0) && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white">
                    {unreadNotificationsCount + unreadFriendRequestsCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Profile */}
            <div 
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200"
              onClick={() => navigate("/profile")}
            >
              <Avatar className="w-8 h-8 border-2 border-[#039fb3]">
                <AvatarImage src={user?.profile_image} />
                <AvatarFallback className="bg-[#039fb3] text-white text-sm font-medium">
                  {user?.first_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  @{user?.user_name || "username"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
            </div>
          </div>
        </div>
      </header>

      {/* 🔥 Mobile Menu Panel */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src="/website_blue.png"
                    alt="Dent Studio Logo"
                    className="w-25 h-20 object-contain"
                  />
                
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-[#039fb3]">
                    <AvatarImage src={user?.profile_image} />
                    <AvatarFallback className="bg-[#039fb3] text-white text-lg font-medium">
                      {user?.first_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">@{user?.user_name}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <nav className="space-y-2">
                  {mobileMenuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-[#039fb3] text-white shadow-lg shadow-blue-100"
                            : "text-gray-600 hover:text-[#039fb3] hover:bg-gray-50"
                        )}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setShowNotifications(false)}
            />

            {/* Notifications Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "fixed bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden",
                "w-[95vw] max-w-md mx-auto",
                "left-1/2 transform -translate-x-1/2",
                "top-20",
                "lg:top-16 lg:right-6 lg:left-auto lg:transform-none lg:w-96"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {unreadNotificationsCount > 0 
                      ? `You have ${unreadNotificationsCount} new notifications`
                      : 'No new notifications'
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Notifications Content */}
              <div className="max-h-80 lg:max-h-96 overflow-y-auto">
                {/* Friend Requests Section */}
                {friendRequests.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Friend Requests</h4>
                      <div className="space-y-3">
                        {friendRequests.map((request) => (
                          <div
                            key={request.sender.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200"
                          >
                            <img
                              src={request.sender.profile_image}
                              alt={request.sender.user_name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {request.sender.user_name}
                              </p>
                              <p className="text-xs text-gray-500">Sent you a friend request</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="text-xs bg-green-600 hover:bg-green-700"
                                onClick={() => acceptFriendRequest(request.sender.id)}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => rejectFriendRequest(request.sender.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications List */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-4">Recent Activity</h4>
                  
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No notifications yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.slice(0, 10).map((notification) => (
                        <div 
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200",
                            notification.read && "opacity-70"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            getNotificationColor(notification.type)
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 font-medium">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

           
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};