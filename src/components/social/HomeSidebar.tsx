"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle2, Users, Calendar, Image as ImageIcon } from "lucide-react";

// ====== Data ======
const friendRequests = [
  {
    id: 1,
    name: "Ahmed Ali",
    mutual: "5 mutual friends",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Sara Mohamed",
    mutual: "2 mutual friends",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

const confirmFriends = [
  { id: 1, name: "Omar Youssef", img: "https://randomuser.me/api/portraits/men/11.jpg" },
  { id: 2, name: "Mona Adel", img: "https://randomuser.me/api/portraits/women/65.jpg" },
];

const suggestedPages = [
  { id: 1, name: "Cat Lovers", followers: "12K followers", img: "https://placekitten.com/100/100" },
  { id: 2, name: "Tech World", followers: "8K followers", img: "https://placekitten.com/101/101" },
];

const events = [
  { id: 1, title: "React Conference", date: "Oct 28, 2025" },
  { id: 2, title: "Startup Meetup", date: "Nov 5, 2025" },
];

const photos = [
  "https://smilehousedentalcenter.com/assets/images/categories/16702389799%20(1).png",
  "https://eurodentalcenter.com/wp-content/uploads/2024/06/%D8%B7%D9%88%D8%A7%D8%B1%D8%A6-%D8%B7%D8%A8-%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86.jpg",
  "https://smilink-dental.com/wp-content/uploads/2024/06/%D8%A8%D8%A7%D9%84%D8%B5%D9%88%D8%B1-%D8%AA%D9%82%D9%88%D9%8A%D9%85-%D8%A7%D9%84%D8%A7%D8%B3%D9%86%D8%A7%D9%86.jpeg",
  "https://i0.wp.com/blog.asnany.net/wp-content/uploads/2024/07/befor-after.jpg?resize=788%2C713&ssl=1",
  "https://www.imtilakgroup.com/cdn-cgi/image/format=webp,fit=cover,width=787,height=400px/https://www.ilajak.com/uploads/posts/50d078a02ef9b6bb58517430ac307d54Ytz_160MkS.jpg",
  "https://s3-eu-west-1.amazonaws.com/content.argaamnews.com/963f7626-c065-49b3-90f1-c4a1a77385a5.jpg",
];

// ====== Component ======
export default function HomeSidebar() {
  return (
    <div className="w-[280px] space-y-4">
      {/* Friend Requests */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-3">
        <CardHeader className="flex items-center gap-2">
          <UserPlus className="text-blue-500" />
          <CardTitle className="text-base">Friend Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {friendRequests.map((f) => (
            <div key={f.id} className="flex items-start gap-3">
              <img src={f.img} alt={f.name} width={40} height={40} className="rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{f.name}</p>
                <p className="text-xs text-gray-500">{f.mutual}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="flex-1">Confirm</Button>
                  <Button size="sm" variant="outline" className="flex-1">Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confirm Friends */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-3">
        <CardHeader className="flex items-center gap-2">
          <CheckCircle2 className="text-green-500" />
          <CardTitle className="text-base">Confirm Friends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {confirmFriends.map((f) => (
            <div key={f.id} className="flex items-center gap-3">
              <img src={f.img} alt={f.name} width={36} height={36} className="rounded-full" />
              <span className="text-gray-700 text-sm">{f.name}</span>
            </div>
          ))}
          <Button size="sm" className="mt-3 w-full">View All</Button>
        </CardContent>
      </Card>

      {/* Suggested Pages */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-3">
        <CardHeader className="flex items-center gap-2">
          <Users className="text-purple-500" />
          <CardTitle className="text-base">Suggested Pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedPages.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <img src={p.img} alt={p.name} width={45} height={45} className="rounded-md object-cover" />
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.followers}</p>
              </div>
              <Button size="sm">Follow</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Events */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-3">
        <CardHeader className="flex items-center gap-2">
          <Calendar className="text-orange-500" />
          <CardTitle className="text-base">Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="border-b pb-2 last:border-0">
              <p className="font-medium text-gray-800">{e.title}</p>
              <p className="text-xs text-gray-500">{e.date}</p>
            </div>
          ))}
          <Button size="sm" className="mt-2 w-full">See Events</Button>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-3">
        <CardHeader className="flex items-center gap-2">
          <ImageIcon className="text-pink-500" />
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <img
                key={i}
                src={p}
                alt="photo"
                className="w-full h-20 rounded-lg object-cover"
              />
            ))}
          </div>
          <Button size="sm" className="mt-3 w-full">Open Gallery</Button>
        </CardContent>
      </Card>
    </div>
  );
}
