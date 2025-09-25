"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle2, Calendar, Image as ImageIcon } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "@/Context/AuthContext";

interface FriendRequest {
  id: number;
  status: string;
  sender: {
    id: number;
    user_name: string;
    profile_image: string;
  };
}

const events = [
  { id: 1, title: "React Conference", date: "Oct 28, 2025" },
  { id: 2, title: "Startup Meetup", date: "Nov 5, 2025" },
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
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmFriends, setConfirmFriends] = useState(user?.friends?.slice(-2) || []);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pending-requests");
      const requests = response.data.message.requests;
      setFriendRequests(requests);
    } catch (error) {
      console.error("Error loading friend requests", error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (id: number, action: "accept" | "reject") => {
    try {
      // Send response to the backend
      await api.post(`/friend-requests/${id}/respond`, { action });

      // Optimistically update the UI after accepting
      if (action === "accept") {
        // Find the accepted friend request
        const acceptedRequest = friendRequests.find((f) => f.id === id);
        if (acceptedRequest) {
          // Remove from pending requests and add to confirmed friends
          setFriendRequests((prev) => prev.filter((f) => f.id !== id));
          setConfirmFriends((prev) => [acceptedRequest.sender, ...prev]);
        }
      } else {
        // Just remove the rejected request from the list
        setFriendRequests((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request`, error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    const interval = setInterval(fetchFriendRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[280px] space-y-4">
      {/* Friend Requests */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition p-4 w-full max-w-md mx-auto">
        <CardHeader className="flex items-center gap-2 pb-2">
          <UserPlus className="text-blue-500" />
          <CardTitle className="text-base font-semibold">Friend Requests</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-gray-500">Loading...</p>}

          {!loading && friendRequests.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No pending friend requests.
            </p>
          )}

          {friendRequests.map((f) => (
            <div
              key={f.id}
              className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg"
            >
              <img
                src={f.sender.profile_image}
                alt={f.sender.user_name}
                width={40}
                height={40}
                className="rounded-full object-cover border border-gray-200"
              />

              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {f.sender.user_name}
                </p>

                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => respondToRequest(f.id, "accept")}
                  >
                    Confirm
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    onClick={() => respondToRequest(f.id, "reject")}
                  >
                    Delete
                  </Button>
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
          <CardTitle className="text-base">Confirmed Friends</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {userLoading && (
            <p className="text-sm text-gray-500 text-center">Loading friends...</p>
          )}

          {!userLoading && confirmFriends.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No confirmed friends.
            </p>
          )}

          {!userLoading && confirmFriends.map((f) => (
            <div key={f.id} className="flex items-center gap-3">
              <img
                src={f.profile_image}
                alt={f.user_name}
                className="w-9 h-9 rounded-full object-cover border border-gray-300"
              />
              <span className="text-gray-700 text-sm">{f.user_name}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
