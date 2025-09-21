import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePost } from "@/components/social/CreatePost";
import { PostCard } from "@/components/social/PostCard";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stories = [
  { id: 1, name: "Add Story", isAddButton: true },
  { id: 2, name: "Aliqa Macale", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 3, name: "Seary Victor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 4, name: "John Steere", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 5, name: "Mohammad", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
];

const friendRequests = [
  { id: 1, name: "Anthony Daugloi", mutualFriends: 12, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 2, name: "Mohannad Zitoun", mutualFriends: 18, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
  { id: 3, name: "Hurin Seary", mutualFriends: 28, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
];

const contacts = [
  { id: 1, name: "Hurin Seary", online: true, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 2, name: "Victor Exrixon", online: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 3, name: "Surfiya Zakir", online: false, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
  { id: 4, name: "Goria Coast", online: false, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
];

const posts = [
  {
    author: {
      name: "Surfiya Zakir",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      timeAgo: "22 min ago"
    },
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nulla dolor, ornare at commodo non, feugiat non nisi. Phasellus faucibus mollis pharetra. Proin blandit ac massa sed rhoncus.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    likes: 25,
    comments: 12,
    shares: 5
  }
];

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            {/* Stories */}
            <div className="mb-6">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {stories.map((story) => (
                  <div key={story.id} className="flex-shrink-0">
                    {story.isAddButton ? (
                      <div className="w-32 h-48 bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border cursor-pointer hover:bg-secondary transition-colors">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                          <span className="text-2xl text-primary-foreground">+</span>
                        </div>
                        <span className="text-sm font-medium">Add Story</span>
                      </div>
                    ) : (
                      <div 
                        className="w-32 h-48 rounded-xl overflow-hidden relative cursor-pointer bg-gradient-to-t from-black/50 to-transparent"
                        style={{
                          backgroundImage: `url(${story.avatar})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden mb-2">
                            <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-white text-xs font-medium block">{story.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create Post */}
            <CreatePost />

            {/* Posts Feed */}
            {posts.map((post, index) => (
              <PostCard key={index} {...post} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Friend Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Friend Request
                  <Button variant="link" size="sm" className="text-primary p-0">
                    See all
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3">
                    <UserAvatar
                      src={request.avatar}
                      fallback={request.name.split(' ').map(n => n[0]).join('')}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{request.name}</h4>
                      <p className="text-xs text-muted-foreground">{request.mutualFriends} mutual friends</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="h-7 text-xs">
                          Confirm
                        </Button>
                        <Button variant="secondary" size="sm" className="h-7 text-xs">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3">
                    <UserAvatar
                      src={contact.avatar}
                      fallback={contact.name.split(' ').map(n => n[0]).join('')}
                      online={contact.online}
                    />
                    <span className="font-medium text-sm">{contact.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;