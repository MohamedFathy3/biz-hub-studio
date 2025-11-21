"use client";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from '@/lib/api';
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock,
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Briefcase, 
  Calendar,
  MessageCircle
} from "lucide-react";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, set, onValue, off, push, update } from 'firebase/database';
import { AuthContext } from "@/Context/AuthContext";

interface User {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image: string;
  graduation_year: string;
  graduation_grade: string;
  postgraduate_degree: string;
  experience_years: number;
  university: string;
  specialization: string;
  fields: Array<{ id: number; name: string }>;
  posts: Array<any>;
}

interface Filters {
  user_name?: string;
  email?: string;
  phone?: string;
  graduation_year?: string;
  graduation_grade?: string;
  postgraduate_degree?: string;
  experience_years?: number;
}

// نوع طلب الصداقة
type FriendRequestStatus = 'none' | 'pending' | 'accepted' | 'friends' | 'rejected';

export default function UsersList() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [perPage, setPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  
  // حالة طلبات الصداقة
  const [friendRequests, setFriendRequests] = useState<{[key: number]: FriendRequestStatus}>({});

  // حالة الفلاتر
  const [filters, setFilters] = useState<Filters>({});
  const [tempFilters, setTempFilters] = useState<Filters>({});

  // دالة علشان نعمل room ID فريد للصداقات
  const generateFriendshipId = (userId1: number, userId2: number) => {
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  };

  // 🔥 الاستماع لطلبات الصداقة في real-time
  useEffect(() => {
    if (!currentUser) return;

    const friendshipRef = ref(db, 'friendships');
    
    const unsubscribe = onValue(friendshipRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const friendships: {[key: number]: FriendRequestStatus} = {};
      
      snapshot.forEach((childSnapshot) => {
        const friendshipData = childSnapshot.val();
        const friendshipId = childSnapshot.key;
        
        // نشوف لو الصداقة متعلقة بالـ user الحالي
        if (friendshipId && friendshipId.includes(currentUser.id.toString())) {
          const userIds = friendshipId.split('_').map(Number);
          const otherUserId = userIds.find(id => id !== currentUser.id);
          
          if (otherUserId) {
            friendships[otherUserId] = friendshipData.status || 'none';
          }
        }
      });
      
      setFriendRequests(friendships);
    });

    return () => {
      off(friendshipRef);
    };
  }, [currentUser]);

  // جلب بيانات المستخدمين
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      // تنظيف الفلاتر من القيم الفارغة
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== undefined && value !== null && value !== '' && 
          !(typeof value === 'number' && isNaN(value))
        )
      );

      const payload = {
        filters: cleanFilters,
        orderBy: "id",
        orderByDirection: "asc",
        perPage: perPage,
        paginate: true,
        page: page
      };

      const response = await api.post("/user/index", payload);
      
      if (response.data.result === "Success") {
        setUsers(response.data.data);
        setTotalPages(response.data.meta.last_page);
        setCurrentPage(response.data.meta.current_page);
        setTotalUsers(response.data.meta.total);
      } else {
        console.error("API returned error:", response.data);
        alert("Failed to load users: " + (response.data.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, perPage]);

  // تطبيق الفلاتر
  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
    setShowFilters(false);
  };

  // مسح الفلاتر
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    setCurrentPage(1);
    setShowFilters(false);
  };

  // البحث الفوري
  const handleSearch = (value: string) => {
    setTempFilters(prev => ({ ...prev, user_name: value }));
    // استخدام debounce للبحث الفوري بعد توقف الكتابة
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, user_name: value }));
      setCurrentPage(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // التنقل بين الصفحات
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page);
    }
  };

  // الذهاب لصفحة البروفايل
  const goToProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  // فتح الشات مع المستخدم
  const handleSendMessage = (userId: number) => {
    navigate(`/messages?user_id=${userId}`);
  };

  // 🔥 إرسال طلب صداقة مع Firebase
  const addFriend = async (userId: number) => {
    if (!currentUser) return;

    try {
      const friendshipId = generateFriendshipId(currentUser.id, userId);
      
      // نعمل طلب صداقة في Firebase
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      const friendRequestData = {
        user1_id: currentUser.id,
        user1_name: currentUser.user_name,
        user1_image: currentUser.profile_image,
        user2_id: userId,
        user2_name: users.find(u => u.id === userId)?.user_name,
        user2_image: users.find(u => u.id === userId)?.profile_image,
        status: 'pending',
        requested_by: currentUser.id,
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await set(friendshipRef, friendRequestData);

      // نرسل إشعار للـ backend علشان التوثيق
      await api.post(`/friend-requests/${userId}`);
      
      // نحدث الحالة محلياً
      setFriendRequests(prev => ({
        ...prev,
        [userId]: 'pending'
      }));

      alert(`Friend request sent successfully ✅`);

    } catch (error: any) {
      console.error("Error adding friend:", error);
      alert("Something went wrong while sending friend request.");
    }
  };

  // 🔥 قبول طلب صداقة
  const acceptFriendRequest = async (userId: number) => {
    if (!currentUser) return;

    try {
      const friendshipId = generateFriendshipId(currentUser.id, userId);
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      await update(friendshipRef, {
        status: 'friends',
        updated_at: Date.now(),
        accepted_at: Date.now()
      });

      // نرسل للـ backend علشان التوثيق
      await api.put(`/friend-requests/${userId}/accept`);

      // نحدث الحالة محلياً
      setFriendRequests(prev => ({
        ...prev,
        [userId]: 'friends'
      }));

      alert("Friend request accepted! 🎉");

    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    }
  };

  // 🔥 رفض طلب صداقة
  const rejectFriendRequest = async (userId: number) => {
    if (!currentUser) return;

    try {
      const friendshipId = generateFriendshipId(currentUser.id, userId);
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      await update(friendshipRef, {
        status: 'rejected',
        updated_at: Date.now(),
        rejected_at: Date.now()
      });

      // نرسل للـ backend علشان التوثيق
      await api.put(`/friend-requests/${userId}/reject`);

      // نحدث الحالة محلياً
      setFriendRequests(prev => ({
        ...prev,
        [userId]: 'rejected'
      }));

      alert("Friend request rejected");

    } catch (error: any) {
      console.error("Error rejecting friend request:", error);
      alert("Failed to reject friend request");
    }
  };

  // 🔥 إلغاء طلب الصداقة
  const cancelFriendRequest = async (userId: number) => {
    if (!currentUser) return;

    try {
      const friendshipId = generateFriendshipId(currentUser.id, userId);
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      // نحذف طلب الصداقة
      await set(friendshipRef, null);

      // نحدث الحالة محلياً
      setFriendRequests(prev => ({
        ...prev,
        [userId]: 'none'
      }));

      alert("Friend request cancelled");

    } catch (error: any) {
      console.error("Error cancelling friend request:", error);
      alert("Failed to cancel friend request");
    }
  };

  // 🔥 إزالة صديق
  const removeFriend = async (userId: number) => {
    if (!currentUser) return;

    try {
      const friendshipId = generateFriendshipId(currentUser.id, userId);
      const friendshipRef = ref(db, `friendships/${friendshipId}`);
      
      // نحذف الصداقة
      await set(friendshipRef, null);

      // نرسل للـ backend علشان التوثيق
      await api.delete(`/friends/${userId}`);

      // نحدث الحالة محلياً
      setFriendRequests(prev => ({
        ...prev,
        [userId]: 'none'
      }));

      alert("Friend removed successfully");

    } catch (error: any) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };

  // 🔥 دالة علشان نعرض زر الصداقة المناسب
  const renderFriendButton = (userId: number) => {
    const status = friendRequests[userId] || 'none';

    switch (status) {
      case 'none':
        return (
          <Button
            size="sm"
            onClick={() => addFriend(userId)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-3 h-3" />
            Add friend
          </Button>
        );

      case 'pending':
        // نحتاج نعرف مين اللي أرسل الطلب
        const friendshipId = generateFriendshipId(currentUser!.id, userId);
        const friendshipRef = ref(db, `friendships/${friendshipId}`);
        
        // في تطبيق حقيقي، هنحتاج نجيب البيانات من Firebase علشان نعرف
        // لكن حالياً بنفترض إن الطلب مرسل مني
        const isSentByMe = true;
        
        if (isSentByMe) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelFriendRequest(userId)}
              className="flex items-center gap-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Clock className="w-3 h-3" />
              Cancel
            </Button>
          );
        } else {
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => acceptFriendRequest(userId)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-3 h-3" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rejectFriendRequest(userId)}
                className="flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-50"
              >
                <UserX className="w-3 h-3" />
                Reject
              </Button>
            </div>
          );
        }

      case 'friends':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex items-center gap-1 border-green-500 text-green-600"
            >
              <UserCheck className="w-3 h-3" />
              Friends
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFriend(userId)}
              className="flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-50"
            >
              <UserX className="w-3 h-3" />
              Remove
            </Button>
          </div>
        );

      case 'rejected':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => addFriend(userId)}
            className="flex items-center gap-1 border-gray-500 text-gray-600 hover:bg-gray-50"
          >
            <UserPlus className="w-3 h-3" />
            Try Again
          </Button>
        );

      default:
        return (
          <Button
            size="sm"
            onClick={() => addFriend(userId)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-3 h-3" />
            Add friend
          </Button>
        );
    }
  };

  // 🔥 Badge علشان حالة الصداقة
  const renderFriendBadge = (userId: number) => {
    const status = friendRequests[userId] || 'none';

    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      
      case 'friends':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            <UserCheck className="w-3 h-3 mr-1" />
            Friends
          </Badge>
        );
      
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
            <UserX className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Professionals</h1>
            <p className="text-gray-600">Find and connect with healthcare professionals</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by Username, email ..."
                    value={tempFilters.user_name || ""}
                    onChange={(e) => {
                      setTempFilters(prev => ({ ...prev, user_name: e.target.value }));
                      handleSearch(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {Object.keys(filters).filter(key => filters[key as keyof Filters]).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(filters).filter(key => filters[key as keyof Filters]).length}
                  </Badge>
                )}
              </Button>

              {/* Items Per Page */}
              <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={tempFilters.email || ""}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g., user@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={tempFilters.phone || ""}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g., 01012345678"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    <Input
                      id="graduation_year"
                      type="number"
                      value={tempFilters.graduation_year || ""}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, graduation_year: e.target.value }))}
                      placeholder="e.g., 2019"
                    />
                  </div>

                  {/* Graduation Grade */}
                  <div>
                    <Label htmlFor="graduation_grade">Graduation Grade</Label>
                    <Select
                      value={tempFilters.graduation_grade || ""}
                      onValueChange={(value) => setTempFilters(prev => ({ ...prev, graduation_grade: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="very_good">Very Good</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="pass">Pass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Postgraduate Degree */}
                  <div>
                    <Label htmlFor="postgraduate_degree">Postgraduate Degree</Label>
                    <Select
                      value={tempFilters.postgraduate_degree || ""}
                      onValueChange={(value) => setTempFilters(prev => ({ ...prev, postgraduate_degree: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Years */}
                  <div>
                    <Label htmlFor="experience_years">Experience Years</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={tempFilters.experience_years?.toString() || ""}
                      onChange={(e) => setTempFilters(prev => ({ 
                        ...prev, 
                        experience_years: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2 mt-4">
                  <Button onClick={applyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Showing {users.length} of {totalUsers} users
                {Object.keys(filters).filter(key => filters[key as keyof Filters]).length > 0 && 
                  " (filtered)"}
              </p>
              {Object.keys(filters).filter(key => filters[key as keyof Filters]).length > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="text-sm">
                  Clear filters
                </Button>
              )}
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  <CardContent className="p-0">
                    {/* Cover Image Placeholder */}
                    <div className="h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-lg"></div>
                    
                    {/* Profile Content */}
                    <div className="px-4 pb-4">
                      {/* Profile Header */}
                      <div className="flex items-start justify-between -mt-12 mb-4">
                        <div className="flex items-start gap-3">
                          <Avatar 
                            className="w-20 h-20 border-4 border-white cursor-pointer shadow-lg"
                            onClick={() => goToProfile(user.id)}
                          >
                            <AvatarImage src={user.profile_image} alt={user.user_name} />
                            <AvatarFallback className="text-lg bg-blue-100 text-blue-600 font-semibold">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="mt-2">
                            {renderFriendBadge(user.id)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToProfile(user.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendMessage(user.id)}
                            className="flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Message
                          </Button>
                          {renderFriendButton(user.id)}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 
                            className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => goToProfile(user.id)}
                          >
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-gray-600 text-sm">@{user.user_name}</p>
                        </div>

                        {/* Specializations */}
                        <div className="flex flex-wrap gap-1">
                          {user.fields?.slice(0, 3).map((field) => (
                            <Badge key={field.id} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                              {field.name}
                            </Badge>
                          ))}
                          {user.fields?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.fields.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Education and Experience */}
                        <div className="space-y-2 text-sm text-gray-600">
                          {user.university && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              <span>{user.university} {user.graduation_year && `• ${user.graduation_year}`}</span>
                            </div>
                          )}
                          {user.experience_years && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{user.experience_years} years experience</span>
                            </div>
                          )}
                          {user.specialization && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{user.specialization}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                          <span>{user.posts?.length || 0} posts</span>
                          <span>{user.fields?.length || 0} specializations</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {Object.keys(filters).filter(key => filters[key as keyof Filters]).length > 0 
                ? "Try adjusting your search criteria or filters" 
                : "No users available at the moment"}
            </p>
            {Object.keys(filters).filter(key => filters[key as keyof Filters]).length > 0 && (
              <Button onClick={clearFilters}>Clear all filters</Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}