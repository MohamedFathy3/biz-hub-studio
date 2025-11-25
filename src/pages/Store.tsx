import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom"; 
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

const Store = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    discount: "",
    des: "",
    gallery: [] as number[],
    is_new: "1", // عدلنا ل string علشان ال Select
  });

  const perPage = 10;

  const fetchProducts = async (page: number) => {
    try {
      const res = await api.post("/product/index", {
        filters: {  "active":1} ,
        orderBy: "id",
        orderByDirection: "asc",
        perPage,
        paginate: true,
        deleted: false,
        page,
      });
      setProducts(res.data.data || []);
      setTotalPages(res.data.meta?.last_page || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleMultipleImageUpload = (id: number) => {
    setNewProduct(prev => ({
      ...prev,
      gallery: [...prev.gallery, id],
    }));
  };

  const handleCreateProduct = async () => {
    try {
      await api.post("/product", {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        discount: parseFloat(newProduct.discount),
        des: newProduct.des,
        gallery: newProduct.gallery,
        is_new: parseInt(newProduct.is_new), // حولنا ل number
      });
      setModalOpen(false);
      fetchProducts(page);
      // Reset form
      setNewProduct({ 
        name: "", 
        price: "", 
        discount: "", 
        des: "", 
        gallery: [], 
        is_new: "1" 
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create product.");
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Store</h1>
          <Button onClick={() => setModalOpen(true)}>Add Product</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                <img
                  src={product.gallery?.[0]?.fullUrl || "/placeholder-image.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <CardContent className="p-5 flex flex-col justify-between h-46">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {product.des || "No description available."}
                </p>

                <div className="flex items-center justify-between mt-auto gap-2">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                    {product.discount && product.discount !== "0" && (
                      <span className="text-sm text-red-500 line-through">${product.discount}</span>
                    )}
                    {product.price_after_discount && (
                      <span className="text-sm text-green-600 font-medium">
                        ${product.price_after_discount}
                      </span>
                    )}
                  </div>

                  <Link to={`/ProDetail/${product.id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-6 gap-2">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="flex items-center">{page} / {totalPages}</span>
          <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Input
              placeholder="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <Input
              placeholder="Discount"
              type="number"
              value={newProduct.discount}
              onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newProduct.des}
              onChange={(e) => setNewProduct({ ...newProduct, des: e.target.value })}
            />
            
            {/* الـ Select المعدل */}
            <Select
              value={newProduct.is_new}
              onValueChange={(value) => setNewProduct({ ...newProduct, is_new: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">New</SelectItem>
                <SelectItem value="0">Used</SelectItem>
              </SelectContent>
            </Select>

            {/* Image Uploader */}
            <div>
              <label className="block text-sm font-medium mb-2">Product Images</label>
              <ImageUploader
                onUploadSuccess={handleMultipleImageUpload}
                multiple={true}
              />
              {newProduct.gallery.length > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  {newProduct.gallery.length} image(s) uploaded
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProduct}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Store;