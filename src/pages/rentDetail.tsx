import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/rent/${id}`);
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

  const handleSendMessage = async () => {
    if (!product) return;
    try {
      await api.post("/chat/send", {
        body: messageBody,
        receiver_id: product.user.id,
      });
      alert("Message sent successfully!");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!product) return <div className="text-center mt-20">Product not found</div>;

  // صور المنتج (صورة واحدة + جاليري لو موجود)
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
            <p>type: {product.type}</p>
            <p>Created At: {new Date(product.created_at).toLocaleString()}</p>
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

          <Button
            onClick={() => {
              setMessageBody(`Product: ${product.name}\nPrice: $${product.price}`);
              setIsModalOpen(true);
            }}
            className="w-full"
          >
            Message Seller
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Send Message</h2>

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

            <Textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="mb-4"
              rows={6}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ProDetail;
