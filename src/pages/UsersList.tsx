import { useState, useEffect } from "react";
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
import { Search, Filter, UserPlus, Eye, ChevronLeft, ChevronRight, GraduationCap, Briefcase, Calendar } from "lucide-react";

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

export default function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [perPage, setPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);

  // حالة الفلاتر
  const [filters, setFilters] = useState<Filters>({});
  const [tempFilters, setTempFilters] = useState<Filters>({});

  // جلب بيانات المستخدمين
  const fetchUsers = async (page = 1) => {
    setLoading(false);
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

      console.log("Sending payload:", payload); // للتصحيح

      const response = await api.post("/user/index", payload);
      
      if (response.data.result === "Success") {
        setUsers(response.data.data);
        setTotalPages(response.data.meta.last_page);
        setCurrentPage(response.data.meta.current_page);
        setTotalUsers(response.data.meta.total);
        
        console.log("Users data:", response.data.data); // للتصحيح
      } else {
        console.error("API returned error:", response.data);
        alert("Failed to load users: " + (response.data.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
      alert("Failed to load users. Check console for details.");
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

  const addFriend = async (userId: number) => {
    try {
      const res = await api.post(`/friend-requests/${userId}`);
      
      if (res.data.result === "Success") {
        alert(`Friend request sent successfully ✅`);
      } else {
        alert(res.data.message || "Failed to send friend request ❌");
      }
    } catch (error: any) {
      console.error("Error adding friend:", error);
      alert("Something went wrong while sending friend request.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
            <p className="text-gray-600">Find and connect with dental professionals</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 mb-8">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    {/* Cover Image Placeholder */}
                    <div className="h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-lg"></div>
                    
                    {/* Profile Content */}
                    <div className="px-4 pb-4">
                      {/* Profile Header */}
                      <div className="flex items-start justify-between -mt-12 mb-4">
                        <Avatar 
                          className="w-20 h-20 border-4 border-white cursor-pointer"
                          onClick={() => goToProfile(user.id)}
                        >
                          <AvatarImage src={user.profile_image} alt={user.user_name} />
                          <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex gap-2 mt-2">
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
                            size="sm"
                            onClick={() => addFriend(user.id)}
                            className="flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            Connect
                          </Button>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 
                            className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                            onClick={() => goToProfile(user.id)}
                          >
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-gray-600 text-sm">@{user.user_name}</p>
                        </div>

                        {/* Specializations */}
                        <div className="flex flex-wrap gap-1">
                          {user.fields?.slice(0, 3).map((field) => (
                            <Badge key={field.id} variant="secondary" className="text-xs">
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
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{user.university} • {user.graduation_year}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            <span>{user.experience_years} years experience</span>
                          </div>
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