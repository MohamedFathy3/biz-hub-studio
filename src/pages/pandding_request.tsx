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
  XCircle
} from "lucide-react";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, onValue, off, update, set, remove } from 'firebase/database';
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

type FilterType = 'all' | 'sent' | 'received';

export default function PendingRequests() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // الألوان حسب المتطلبات
  const BLUE_PRIMARY = '#039fb3';
  const WHITE = '#ffffff';

  // 🔥 حساب الإحصائيات باستخدام useMemo
  const { sentCount, receivedCount, allCount } = useMemo(() => {
    const sent = requests.filter(r => r.requested_by === currentUser?.id).length;
    const received = requests.filter(r => r.requested_by !== currentUser?.id).length;
    const all = requests.length;

    return { 
      sentCount: sent, 
      receivedCount: received, 
      allCount: all 
    };
  }, [requests, currentUser]);

  // 🔥 دالة إرسال الإشعارات محسنة للأداء
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

  // 🔥 جلب طلبات الصداقة محسن للأداء
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const friendshipRef = ref(db, 'friendships');
    
    const unsubscribe = onValue(friendshipRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const requestsData: FriendRequest[] = [];
      const userDataPromises: Promise<FriendRequest>[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const requestData = childSnapshot.val();
        const requestId = childSnapshot.key;
        
        // نأخذ فقط الطلبات المرتبطة بالـ user الحالي والحالة pending
        if (requestId && 
            (requestData.user1_id === currentUser.id || requestData.user2_id === currentUser.id) &&
            requestData.status === 'pending') {
          
          const request: FriendRequest = {
            ...requestData,
            id: requestId
          };

          // نضيف promise لجلب بيانات المستخدم
          const userDataPromise = (async () => {
            try {
              const otherUserId = request.user1_id === currentUser.id ? request.user2_id : request.user1_id;
              const response = await api.get(`/my-friends/`);
              
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

      // نجيب كل بيانات المستخدمين مرة واحدة
      try {
        const requestsWithUserData = await Promise.all(userDataPromises);
        setRequests(requestsWithUserData);
      } catch (error) {
        console.error("Error processing user data:", error);
        // إذا فشل جلب بيانات المستخدمين، نستخدم البيانات الأساسية
        const basicRequests = userDataPromises.map(async (_, index) => {
          const request = requestsData[index];
          return request || requestsData[index];
        });
        const resolvedRequests = await Promise.all(basicRequests);
        setRequests(resolvedRequests);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      off(friendshipRef);
    };
  }, [currentUser]);

  // 🔥 تطبيق الفلاتر والبحث محسن
  useEffect(() => {
    let result = requests;

    // فلتر حسب النوع
    if (activeFilter === 'sent') {
      result = result.filter(request => request.requested_by === currentUser?.id);
    } else if (activeFilter === 'received') {
      result = result.filter(request => request.requested_by !== currentUser?.id);
    }

    // فلتر حسب البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(request => {
        const user = request.user_data;
        return (
          user?.first_name?.toLowerCase().includes(term) ||
          user?.last_name?.toLowerCase().includes(term) ||
          user?.user_name?.toLowerCase().includes(term) ||
          user?.specialization?.toLowerCase().includes(term) ||
          user?.university?.toLowerCase().includes(term)
        );
      });
    }

    setFilteredRequests(result);
  }, [requests, searchTerm, activeFilter, currentUser]);

  // 🔥 دالة موحدة للرد على طلبات الصداقة
// 🔥 دالة موحدة للرد على طلبات الصداقة - معدلة
const respondToFriendRequest = useCallback(async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
  if (!currentUser) return;

  try {
    setSelectedRequest(requestId);
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      console.error("❌ Request not found:", requestId);
      return;
    }

    const otherUserId = request.user1_id === currentUser.id ? request.user2_id : request.user1_id;

    // 🔥 نستخدم الـ API الجديد مباشرة - مع الـ ID الصح
    if (action === 'accept' || action === 'reject') {
      console.log(`🔄 ${action}ing friend request for user:`, otherUserId);
      
      // 🔥 هنا التعديل: بنبعت otherUserId بدل requestId
      const response = await api.post(`/friend-requests/${otherUserId}/respond`, {
        action: action
      });

      console.log("✅ API Response:", response.data);

      // باقي الكود زي ما هو...
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
      // 🔥 إلغاء الطلب - نحذف من Firebase مباشرة
      console.log("🔄 Cancelling friend request:", requestId);
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

    // 🔥 نحدث الـ state محلياً فوراً علشان السرعة
    setRequests(prev => prev.filter(req => req.id !== requestId));

    console.log(`✅ Friend request ${action}ed successfully`);

  } catch (error: any) {
    console.error(`❌ Error ${action}ing friend request:`, error);
    
    // رسالة خطأ مفصلة
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        `Failed to ${action} friend request`;
    
    alert(errorMessage);
  } finally {
    setSelectedRequest(null);
  }
}, [currentUser, requests, sendNotification]);

  // 🔥 دالات مساعدة مبسطة
  const acceptFriendRequest = useCallback((requestId: string) => {
    respondToFriendRequest(requestId, 'accept');
  }, [respondToFriendRequest]);

  const rejectFriendRequest = useCallback((requestId: string) => {
    respondToFriendRequest(requestId, 'reject');
  }, [respondToFriendRequest]);

  const cancelFriendRequest = useCallback((requestId: string) => {
    respondToFriendRequest(requestId, 'cancel');
  }, [respondToFriendRequest]);

  // إرسال رسالة
  const handleSendMessage = useCallback((userId: number) => {
    navigate(`/messages?user_id=${userId}`);
  }, [navigate]);

  // مشاهدة البروفايل
  const viewProfile = useCallback((userId: number) => {
    navigate(`/profile/${userId}`);
  }, [navigate]);

  // 🔥 دالة البحث مع debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    // نمسح الـ timeout القديم
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // نعمل timeout جديد للبحث
    const timeout = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 min-h-screen" style={{ backgroundColor: WHITE }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: BLUE_PRIMARY }}>
            Friend Requests
          </h1>
          <p className="text-gray-600">
            Manage your pending friend requests and connections
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
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg" style={{ color: BLUE_PRIMARY }}>
                    {allCount}
                  </div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-green-600">
                    {receivedCount}
                  </div>
                  <div className="text-gray-500">Received</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-orange-600">
                    {sentCount}
                  </div>
                  <div className="text-gray-500">Sent</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 data-[state=active]:shadow-sm transition-all duration-200"
              style={{ 
                backgroundColor: activeFilter === 'all' ? BLUE_PRIMARY : 'transparent',
                color: activeFilter === 'all' ? WHITE : 'gray'
              }}
            >
              <Users className="w-4 h-4" />
              All Requests
            </TabsTrigger>
            <TabsTrigger 
              value="received"
              className="flex items-center gap-2 data-[state=active]:shadow-sm transition-all duration-200"
              style={{ 
                backgroundColor: activeFilter === 'received' ? BLUE_PRIMARY : 'transparent',
                color: activeFilter === 'received' ? WHITE : 'gray'
              }}
            >
              <UserPlus className="w-4 h-4" />
              Received
            </TabsTrigger>
            <TabsTrigger 
              value="sent"
              className="flex items-center gap-2 data-[state=active]:shadow-sm transition-all duration-200"
              style={{ 
                backgroundColor: activeFilter === 'sent' ? BLUE_PRIMARY : 'transparent',
                color: activeFilter === 'sent' ? WHITE : 'gray'
              }}
            >
              <Clock className="w-4 h-4" />
              Sent
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: BLUE_PRIMARY }}
            ></div>
          </div>
        ) : (
          <>
            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <Card className="text-center py-12 border-0 shadow-sm">
                  <CardContent>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'No matching requests found' : 'No pending requests'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : activeFilter === 'sent' 
                          ? "You haven't sent any friend requests yet"
                          : activeFilter === 'received'
                            ? "You don't have any incoming requests"
                            : "You don't have any pending friend requests"
                      }
                    </p>
                    {searchTerm && (
                      <Button 
                        onClick={() => setSearchTerm('')}
                        style={{ backgroundColor: BLUE_PRIMARY }}
                      >
                        Clear Search
                      </Button>
                    )}
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
                        <div className="flex items-start gap-4">
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
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {isSentByMe ? (
                              // Actions for sent requests
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelFriendRequest(request.id)}
                                disabled={selectedRequest === request.id}
                                className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                {selectedRequest === request.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                Cancel
                              </Button>
                            ) : (
                              // Actions for received requests
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => acceptFriendRequest(request.id)}
                                  disabled={selectedRequest === request.id}
                                  className="flex items-center gap-1 transition-all hover:scale-105"
                                  style={{ backgroundColor: BLUE_PRIMARY }}
                                >
                                  {selectedRequest === request.id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => rejectFriendRequest(request.id)}
                                  disabled={selectedRequest === request.id}
                                  className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}

                            {/* Message Button */}
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
          </>
        )}
      </div>
    </MainLayout>
  );
}