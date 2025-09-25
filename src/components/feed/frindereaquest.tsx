import React, { useEffect, useState, useContext, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";
import api from "@/lib/api";

type Friend = {
  id: number;
  user_name: string;
  profile_image: string;
};

type UserShort = {
  id: number;
  user_name: string;
  profile_image?: string;
};

type Message = {
  id: number;
  body: string;
  created_at: string;
  sender: UserShort;
  receiver: UserShort;
};

export default function ContactsGroups() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unread, setUnread] = useState<Record<number, boolean>>({});
  const [lastMessageIds, setLastMessageIds] = useState<Record<number, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<number, string>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load friends from context once user loads
  useEffect(() => {
    if (user?.friends && Array.isArray(user.friends)) {
      setFriends(user.friends);
    }
  }, [user]);

  // utility: scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch full message history for opened friend
  const fetchMessagesForFriend = async (friendId: number) => {
    try {
      const res = await api.get("/chat/messages", {
        params: { receiver_id: friendId },
      });
      const data: Message[] = res?.data?.data ?? [];

      // set full messages if the opened friend is the selected one
      setMessages(data);

      // update last message info
      if (data.length > 0) {
        const last = data[data.length - 1];
        setLastMessages((p) => ({ ...p, [friendId]: last.body }));
        setLastMessageIds((p) => ({ ...p, [friendId]: last.id }));
      }

      // mark as read locally since user opened the modal
      setUnread((p) => ({ ...p, [friendId]: false }));

      // OPTIONAL: inform backend that messages were read (if your API supports it)
      // await api.post("/chat/mark-read", { receiver_id: friendId });
    } catch (err) {
      console.error("fetchMessagesForFriend error:", err);
    }
  };

  // Fetch only last message for friend (lightweight)
  const fetchLastMessageForFriend = async (friendId: number) => {
    try {
      const res = await api.get("/chat/messages", {
        params: { receiver_id: friendId },
      });
      const data: Message[] = res?.data?.data ?? [];
      if (!Array.isArray(data) || data.length === 0) {
        return;
      }
      const last = data[data.length - 1];

      const prevLastId = lastMessageIds[friendId];
      // update last message text and id
      setLastMessages((p) => ({ ...p, [friendId]: last.body }));
      setLastMessageIds((p) => ({ ...p, [friendId]: last.id }));

      // if the last message sender is NOT me and it's a new message (id changed),
      // mark unread = true (only if user hasn't opened the modal with that friend)
      if (last.sender?.id !== currentUserId && last.id !== prevLastId) {
        // only mark unread if modal is NOT open for this friend
        if (!selectedFriend || selectedFriend.id !== friendId) {
          setUnread((p) => ({ ...p, [friendId]: true }));
        }
        // move this friend to the top of the list
        setFriends((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((f) => f.id === friendId);
          if (idx > -1) {
            const [f] = copy.splice(idx, 1);
            return [f, ...copy];
          }
          return copy;
        });
      } else {
        // if message is from me or id didn't change, do nothing (or clear unread if it's open)
        if (selectedFriend && selectedFriend.id === friendId) {
          setUnread((p) => ({ ...p, [friendId]: false }));
        }
      }
    } catch (err) {
      console.error("fetchLastMessageForFriend error:", err);
    }
  };

  // Polling: periodically check last message for each friend
  // useEffect(() => {
  //   if (!friends || friends.length === 0) return;

  //   // initial fill of last messages
  //   friends.forEach((f) => {
  //     fetchLastMessageForFriend(f.id);
  //   });

  //   // Interval to check for updates every minute (60000 ms)
  //   const interval = setInterval(() => {
  //     friends.forEach((f) => {
  //       fetchLastMessageForFriend(f.id);
  //     });
  //   }, 60000); // 1 minute

  //   // Cleanup interval on component unmount or when friends change
  //   return () => clearInterval(interval);
  // }, [friends, currentUserId, selectedFriend, lastMessageIds]);

  // When selecting a friend: open modal, fetch full messages and clear unread
  const openChatWith = (friend: Friend) => {
    setSelectedFriend(friend);
    setUnread((p) => ({ ...p, [friend.id]: false }));
    fetchMessagesForFriend(friend.id);
  };

  // Send a new message to selected friend
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    try {
      await api.post("/chat/send", {
        body: newMessage,
        receiver_id: selectedFriend.id,
      });
      setNewMessage("");
      // refresh messages immediately (server will include the sent message)
      fetchMessagesForFriend(selectedFriend.id);

      // also clear unread for that friend (since this is my outgoing)
      setUnread((p) => ({ ...p, [selectedFriend.id]: false }));
    } catch (err) {
      console.error("send message error:", err);
    }
  };

  // computed list: keep current ordering (we already move unread friends to top when they get new msg)
  const visibleFriends = friends;

  return (
    <div className="fixed top-15 right-5 w-80 bg-white rounded-lg shadow-md p-5 space-y-6 h-[90vh] overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
        CONTACTS
      </h3>

      <div className="space-y-2">
        {visibleFriends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => openChatWith(friend)}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={friend.profile_image}
                  alt={friend.user_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {unread[friend.id] && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-gray-800">
                  {friend.user_name}
                </span>
                <span className="text-xs text-gray-500 truncate w-40">
                  {lastMessages[friend.id] || "No messages yet"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Modal */}
      {selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b p-4">
              <img
                src={selectedFriend.profile_image}
                alt={selectedFriend.user_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{selectedFriend.user_name}</p>
                <p className="text-sm text-gray-500">Chat</p>
              </div>
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => setSelectedFriend(null)}
              >
                ✕
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = msg.sender?.id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                          isMine ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.body}</div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {new Date(msg.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400">No messages yet</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" onClick={handleSend}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
