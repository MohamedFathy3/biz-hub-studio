import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AuthContext } from "@/Context/AuthContext";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

const ProDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sending, setSending] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/product/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // دالة مساعدة علشان تعمل room ID فريد
  const generateRoomId = (userId1: number, userId2: number) => {
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  };

  // 🔥 دالة إرسال الإشعارات
  const sendNotification = async (receiverId: number, notificationData: {
    type: string;
    title: string;
    message: string;
    sender_id: number;
    sender_name: string;
    sender_image: string;
    data?: any;
  }) => {
    try {
      if (!user) return;

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
      console.log("✅ Notification sent successfully to user:", receiverId);
      
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!product || !user || !messageBody.trim()) {
      alert("Please write a message first.");
      return;
    }

    setSending(true);
    
    try {
      const receiverId = product.user.id;
      const roomId = generateRoomId(user.id, receiverId);
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const messageData = {
        id: messageId,
        body: messageBody,
        sender_id: user.id,
        receiver_id: receiverId,
        sender_name: user.user_name,
        sender_type: 'user',
        timestamp: Date.now(),
        created_at: new Date().toISOString(),
        product_info: {
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image?.fullUrl || product.gallery?.[0]?.fullUrl
        }
      };

      console.log("📤 Sending message from product page:", messageData);

      // 1. إرسال للـ Laravel API علشان يتخزن في الداتابيز
      await api.post("/chat/send", {
        body: messageBody,
        receiver_id: receiverId,
        product_id: product.id
      });
      console.log("✅ Message sent to Laravel API");

      // 2. إرسال للـ Firebase علشان الـ realtime
      const messagesRef = ref(db, `chats/${roomId}/messages`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, messageData);
      console.log("✅ Message sent to Firebase");

      // 🔥 3. إرسال إشعار للبائع
      await sendNotification(receiverId, {
        type: 'new_message',
        title: 'New Message 📩',
        message: `${user.user_name} sent you a message about your product: ${product.name}`,
        sender_id: user.id,
        sender_name: user.user_name,
        sender_image: user.profile_image,
        data: {
          product_id: product.id,
          product_name: product.name,
          room_id: roomId,
          message_preview: messageBody.substring(0, 100) + '...'
        }
      });

      // 🔥 4. إرسال إشعار push notification (إذا محتاج)
      try {
        await api.post("/send-notification", {
          user_id: receiverId,
          title: "New Message 📩",
          message: `${user.user_name} sent you a message about ${product.name}`,
          data: {
            type: 'new_message',
            product_id: product.id,
            room_id: roomId
          }
        });
        console.log("✅ Push notification sent");
      } catch (notifError) {
        console.log("ℹ️ Push notification service not available");
      }

      // نجاح الإرسال
      alert("Message sent successfully!");
      setIsModalOpen(false);
      setMessageBody("");

      // اختياري: نروح لصفحة الشات
      setTimeout(() => {
        navigate("/messages");
      }, 1500);

    } catch (err: any) {
      console.error("❌ Error sending message:", err);
      
      // لو فشل الـ API، نجرب نرسل للـ Firebase فقط
      try {
        if (product && user) {
          const receiverId = product.user.id;
          const roomId = generateRoomId(user.id, receiverId);
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const messageData = {
            id: messageId,
            body: messageBody,
            sender_id: user.id,
            receiver_id: receiverId,
            sender_name: user.user_name,
            sender_type: 'user',
            timestamp: Date.now(),
            created_at: new Date().toISOString(),
            product_info: {
              product_id: product.id,
              product_name: product.name,
              product_price: product.price
            }
          };

          const messagesRef = ref(db, `chats/${roomId}/messages`);
          const newMessageRef = push(messagesRef);
          await set(newMessageRef, messageData);
          
          // 🔥 إرسال إشعار حتى لو فشل الـ API
          await sendNotification(receiverId, {
            type: 'new_message',
            title: 'New Message 📩',
            message: `${user.user_name} sent you a message about your product: ${product.name}`,
            sender_id: user.id,
            sender_name: user.user_name,
            sender_image: user.profile_image,
            data: {
              product_id: product.id,
              product_name: product.name,
              room_id: roomId
            }
          });
          
          alert("Message sent via Firebase!");
          setIsModalOpen(false);
          setMessageBody("");
        }
      } catch (firebaseError) {
        console.error("❌ Firebase also failed:", firebaseError);
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  // دالة علشان تفتح الشات مباشرة
  const handleOpenChat = () => {
    if (!user) {
      alert("Please login to send messages");
      return;
    }
    
    if (!product) return;

    // نجهز نص الرسالة الافتراضي
    const defaultMessage = `Hello, I'm interested in your product: ${product.name}\nPrice: $${product.price}\nCan you tell me more about it?`;
    
    setMessageBody(defaultMessage);
    setIsModalOpen(true);
  };

  // دالة علشان تفتح صفحة الشات مباشرة
  const handleGoToChat = () => {
    if (!user) {
      alert("Please login to chat");
      return;
    }
    
    navigate("/messages");
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!product) return <div className="text-center mt-20">Product not found</div>;

  // صور المنتج
  const images = [ ...(product.gallery || []).map((g: any) => g.fullUrl)];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <MainLayout>
      <div className="relative flex flex-col md:flex-row h-screen">
        {/* سلايدر الصور */}
        <div className="relative w-full md:w-2/3 h-1/2 md:h-full overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* زرار يسار */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/60"
          >
            <ChevronLeft size={28} />
          </button>

          {/* زرار يمين */}
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/60"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* تفاصيل المنتج */}
        <div className="w-full md:w-1/3 bg-white p-6 overflow-y-auto shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.des}</p>

          <div className="flex items-center gap-4 text-lg mb-4">
            <span className="font-bold text-xl">${product.price}</span>
            {product.discount && (
              <span className="line-through text-red-500">${product.discount}</span>
            )}
            {product.price_after_discount && (
              <span className="text-green-600 font-semibold">
                ${product.price_after_discount}
              </span>
            )}
          </div>

          <div className="text-gray-600 space-y-1 mb-6">
            <p>New: {product.is_new ? "Yes" : "No"}</p>
            <p>Created At: {new Date(product.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(product.updated_at).toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 border rounded-lg shadow-sm">
            <img
              src={product.user.profile_image}
              alt={product.user.user_name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-lg">{product.user.user_name}</p>
              {product.user.email && (
                <p className="text-sm text-gray-500">{product.user.email}</p>
              )}
            </div>
          </div>

          {/* أزرار الشات */}
          <div className="space-y-3">
            <Button
              onClick={handleOpenChat}
              className="w-full"
              disabled={sending}
            >
              {sending ? "Sending..." : "Message Seller"}
            </Button>
            
          
          </div>
        </div>
      </div>

      {/* Modal إرسال الرسالة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Send Message to Seller</h2>

            {/* معلومات البائع */}
            <div className="flex items-center gap-4 mb-4 p-4 border-b">
              <img
                src={product.user.profile_image}
                alt={product.user.user_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{product.user.user_name}</p>
                {product.user.email && (
                  <p className="text-sm text-gray-500">{product.user.email}</p>
                )}
              </div>
            </div>

            {/* معلومات المنتج */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">About the product:</p>
              <p>{product.name} - ${product.price}</p>
            </div>

            <Textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="mb-4"
              rows={6}
              placeholder="Write your message to the seller..."
            />

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={sending || !messageBody.trim()}
              >
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ProDetail;