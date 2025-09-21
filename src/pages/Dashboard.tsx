import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePost } from "@/components/social/CreatePost";
import { PostCard } from "@/components/social/PostCard";
import FriendComponent from "@/components/feed/frindereaquest"
import HomeSidebar from "@/components/social/HomeSidebar"
import Pepole from "@/components/social/Pople"
const stories = [
  { id: 1, name: "Add Story", isAddButton: true },
  { id: 2, name: "Aliqa Macale", avatar: "data:image/jpeg;base64,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" },
  { id: 3, name: "Seary Victor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 4, name: "John Steere", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 5, name: "Mohammad", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
];



const posts = [
  {
    author: {
      name: "Surfiya Zakir",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      timeAgo: "22 min ago"
    },
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nulla dolor, ornare at commodo non, feugiat non nisi. Phasellus faucibus mollis pharetra. Proin blandit ac massa sed rhoncus.",
    image: "https://www.colgate.com/content/dam/cp-sites/oral-care/oral-care-center/global/article/gscp/amed/this-interior-modern-dental-clinic.jpg",
        likes: 25,
    comments: 12,
    shares: 5
  },
    {
    author: {
      name: "Surfiya Zakir",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      timeAgo: "22 min ago"
    },
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nulla dolor, ornare at commodo non, feugiat non nisi. Phasellus faucibus mollis pharetra. Proin blandit ac massa sed rhoncus.",
    image: "https://png.pngtree.com/thumb_back/fh260/background/20230828/pngtree-seoul-dental-clinic-image_13120769.jpg",  likes: 25,
    comments: 12,
    shares: 5
  },
    {
    author: {
      name: "Surfiya Zakir",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      timeAgo: "22 min ago"
    },
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nulla dolor, ornare at commodo non, feugiat non nisi. Phasellus faucibus mollis pharetra. Proin blandit ac massa sed rhoncus.",
    image: "https://amriyaamsm.com/img/Pediatric-Dental-1200x674.jpg",    likes: 25,
    comments: 12,
    shares: 5
  },
];

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-6">
            {/* Stories */}
          



            {/* Create Post */}
            <CreatePost />
            {/* Posts Feed */}
            {posts.map((post, index) => (
              <PostCard key={index} {...post} />
            ))}
<Pepole/>

          </div>
          <div className="col-span-3">
          
   <HomeSidebar />
   </div>
          {/* Sidebar */}
          <div className="col-span-3">

            <FriendComponent/>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;