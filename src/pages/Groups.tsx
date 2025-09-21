import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, MessageCircle, Calendar, Plus, Globe, Lock } from "lucide-react";

const groupCategories = ["All Groups", "Technology", "Design", "Business", "Gaming", "Photography", "Travel"];

const groups = [
  {
    id: 1,
    name: "React Developers Community",
    description: "A community for React developers to share knowledge, tips, and best practices.",
    members: 12500,
    posts: 1200,
    category: "Technology",
    coverImage: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    isPrivate: false,
    isJoined: true,
    isPopular: true
  },
  {
    id: 2,
    name: "UI/UX Designers Hub",
    description: "Connect with designers worldwide and showcase your amazing work.",
    members: 8900,
    posts: 850,
    category: "Design",
    coverImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    isPrivate: false,
    isJoined: false,
    isPopular: true
  },
  {
    id: 3,
    name: "Startup Founders Network",
    description: "Exclusive community for startup founders to network and share experiences.",
    members: 3200,
    posts: 450,
    category: "Business",
    coverImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    isPrivate: true,
    isJoined: false,
    isPopular: false
  },
  {
    id: 4,
    name: "Gaming Enthusiasts",
    description: "Discuss latest games, reviews, and connect with fellow gamers.",
    members: 15600,
    posts: 2300,
    category: "Gaming",
    coverImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    isPrivate: false,
    isJoined: true,
    isPopular: true
  },
  {
    id: 5,
    name: "Photography Masters",
    description: "Share your photography skills and learn from professional photographers.",
    members: 7800,
    posts: 980,
    category: "Photography",
    coverImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    isPrivate: false,
    isJoined: false,
    isPopular: false
  },
  {
    id: 6,
    name: "Digital Nomads",
    description: "Connect with remote workers and travelers exploring the world.",
    members: 5400,
    posts: 675,
    category: "Travel",
    coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2635&q=80",
    isPrivate: false,
    isJoined: true,
    isPopular: false
  }
];

const myGroups = groups.filter(group => group.isJoined);
const popularGroups = groups.filter(group => group.isPopular);

const Groups = () => {
  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Groups</h1>
              <p className="text-muted-foreground">Connect with communities that share your interests</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search groups..."
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {groupCategories.map((category, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Groups Grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">All Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group) => (
                  <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-32">
                      <img
                        src={group.coverImage}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90">
                          {group.category}
                        </Badge>
                        {group.isPrivate && (
                          <Badge variant="secondary" className="bg-white/90">
                            <Lock className="w-3 h-3 mr-1" />
                            Private
                          </Badge>
                        )}
                        {!group.isPrivate && (
                          <Badge variant="secondary" className="bg-white/90">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {group.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.members.toLocaleString()} members
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {group.posts} posts
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant={group.isJoined ? "secondary" : "default"}
                      >
                        {group.isJoined ? "Joined" : "Join Group"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* My Groups */}
            <Card>
              <CardHeader>
                <CardTitle>My Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myGroups.map((group) => (
                  <div key={group.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img
                        src={group.coverImage}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {group.members.toLocaleString()} members
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Groups */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularGroups.map((group) => (
                  <div key={group.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img
                        src={group.coverImage}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {group.members.toLocaleString()} members
                      </p>
                    </div>
                    {!group.isJoined && (
                      <Button size="sm" variant="outline">
                        Join
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Group Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Group Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-sm text-muted-foreground">Groups Joined</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">24</div>
                  <div className="text-sm text-muted-foreground">Posts This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">156</div>
                  <div className="text-sm text-muted-foreground">Total Interactions</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Groups;