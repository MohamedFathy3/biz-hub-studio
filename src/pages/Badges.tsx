import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Search, Filter } from "lucide-react";
import FriendComponent from "@/components/feed/frindereaquest"

const users = [
  {
    id: 1,
    name: "Aliqa Macale",
    email: "support@gmail.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    connections: "55.7k",
    followers: "105k",
    followings: "71k",
    badges: ["🏆", "🎨", "💡"],
    isFollowing: false
  },
  {
    id: 2,
    name: "Hendrix Stamp",
    email: "support@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    connections: "55.7k",
    followers: "105k",
    followings: "71k",
    badges: ["💎", "🎨", "🚀", "💡"],
    isFollowing: false
  },
  {
    id: 3,
    name: "Stephen Grider",
    email: "support@gmail.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    connections: "55.7k",
    followers: "105k",
    followings: "71k",
    badges: ["🔥", "🚀", "💎"],
    isFollowing: false
  },
  {
    id: 4,
    name: "Mohannad Zitoun",
    email: "support@gmail.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    connections: "55.7k",
    followers: "105k",
    followings: "71k",
    badges: ["💎", "🎨", "💡"],
    isFollowing: false
  },
  {
    id: 5,
    name: "Aliqa Macale",
    email: "support@gmail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    connections: "55.7k",
    followers: "105k",
    followings: "71k",
    badges: ["🏆", "🎨", "💡"],
    isFollowing: false
  },
  {
    id: 6,
    name: "Surfiya Zakir",
    email: "support@gmail.com",
    avatar: "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    connections: "55.7k",
    followers: "105k",
    followings: "71k",
    badges: ["🔥", "🚀", "💎", "💡"],
    isFollowing: false
  }
];

const Badges = () => {
  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Badge</h1>
          <p className="text-muted-foreground">Discover talented individuals in our community</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search here..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <UserAvatar
                    src={user.avatar}
                    fallback={user.name.split(' ').map(n => n[0]).join('')}
                    size="xl"
                    className="mx-auto"
                  />
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="font-bold text-lg">{user.connections}</div>
                    <div className="text-muted-foreground text-xs">Connections</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{user.followers}</div>
                    <div className="text-muted-foreground text-xs">Followers</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{user.followings}</div>
                    <div className="text-muted-foreground text-xs">Followings</div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-1 mb-4">
                  {user.badges.map((badge, index) => (
                    <div 
                      key={index}
                      className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-sm"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
                
                <Button className="w-full">
                  FOLLOW
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Badges;