import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock } from "lucide-react";

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
      setMessageBody("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    }
  };

  // صور المنتج
  const images = [...(product?.gallery || []).map((g: any) => g.fullUrl)];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!product) return <div className="text-center mt-20">Product not found</div>;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* سلايدر الصور */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentIndex]}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                
                {/* أزرار التنقل */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* مؤشر الصور */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 lg:h-[500px] flex items-center justify-center bg-gray-200 text-gray-500">
                No Image Available
              </div>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="space-y-6">
            <div>
              <Badge 
                variant={product.type === "rent" ? "default" : "secondary"}
                className="mb-3"
              >
                {product.type === "rent" ? "For Rent" : "For Sale"}
              </Badge>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {product.des}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-green-600">
                  ${product.price}
                </span>
                {product.type === "rent" && product.duration && (
                  <span className="text-gray-500 text-lg">
                    / {product.duration} {product.duration === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>
            </div>

            {/* معلومات الإيجار */}
            {product.type === "rent" && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">Rental Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Duration:</span>
                      <span>{product.duration} days</span>
                    </div>
                    {product.start_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Start Date:</span>
                        <span>{new Date(product.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {product.end_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">End Date:</span>
                        <span>{new Date(product.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* الموقع */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Location</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div className="text-sm">
                    {product.governorate && (
                      <p className="font-medium">{product.governorate}</p>
                    )}
                    {product.city && (
                      <p className="text-gray-600">{product.city}</p>
                    )}
                    {product.address && (
                      <p className="text-gray-600">{product.address}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات البائع */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Seller Information</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={product.user.profile_image}
                    alt={product.user.user_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{product.user.user_name}</p>
                    <p className="text-gray-500 text-sm">
                      Member since {new Date(product.user.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات إضافية */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge 
                      variant={product.active ? "default" : "secondary"} 
                      className="ml-2"
                    >
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Listed:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* زر التواصل */}
            <Button
              onClick={() => {
                const defaultMessage = `Hello! I'm interested in your "${product.name}" for $${product.price}`;
                setMessageBody(defaultMessage);
                setIsModalOpen(true);
              }}
              className="w-full py-3 text-lg"
              size="lg"
            >
              Contact Seller
            </Button>
          </div>
        </div>
      </div>

      {/* Modal التواصل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Contact Seller</h2>

            {/* معلومات البائع */}
            <div className="flex items-center gap-4 mb-4 p-4 border rounded-lg">
              <img
                src={product.user.profile_image}
                alt={product.user.user_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{product.user.user_name}</p>
                <p className="text-sm text-gray-500">About the product: {product.name}</p>
              </div>
            </div>

            {/* حقل الرسالة */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Your Message
              </label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="min-h-[150px] resize-none"
                placeholder="Type your message here..."
              />
            </div>

            {/* معلومات المنتج في الرسالة */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <p className="font-medium mb-1">Product Details:</p>
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              {product.type === "rent" && (
                <p><strong>Rental Duration:</strong> {product.duration} days</p>
              )}
            </div>

            {/* أزرار الإجراء */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsModalOpen(false);
                  setMessageBody("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!messageBody.trim()}
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ProDetail;