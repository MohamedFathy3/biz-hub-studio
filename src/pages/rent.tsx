import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Store = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    des: "",
    gallery: [] as number[], // array of image IDs
    type: "rent", // الافتراضي إيجار
  });

  const perPage = 10;

  // fetch products
  const fetchProducts = async (page: number) => {
    try {
      const res = await api.post("/rent/index", {
        filters: {},
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

  // Handle multiple image uploads
  const handleMultipleImageUpload = (id: string | number) => {
    setNewProduct(prev => ({
      ...prev,
      gallery: [...prev.gallery, Number(id)], // تحويل id لأي رقم قبل التخزين
    }));
  };

  // Create new product
  const handleCreateProduct = async () => {
    try {
      await api.post("/rent", {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        des: newProduct.des,
        gallery: newProduct.gallery, // أرسل المصفوفة بدل imageId
        type: newProduct.type,
      });
      setModalOpen(false);
      fetchProducts(page);
      setNewProduct({ name: "", price: "", des: "", gallery: [], type: "rent" });
    } catch (err) {
      console.error(err);
      alert("Failed to create product.");
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Rent Store</h1>
          <Button onClick={() => setModalOpen(true)}>Add Rent Product</Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 l:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                {product.gallery && product.gallery.length > 0 && (
                  <img
                    src={product.gallery?.[0]?.fullUrl} // استخدم أول صورة من الـ gallery
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <CardContent className="p-5 flex flex-col justify-between h-46">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {product.des || "No description available."}
                </p>
                <div className="flex items-center justify-between mt-auto gap-2">
                  <span className="text-lg font-bold text-primary">${product.price}</span>
                  <Link to={`/RentDetail/${product.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span>{page} / {totalPages}</span>
          <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Add Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Rent Product</DialogTitle>
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
              placeholder="Description"
              value={newProduct.des}
              onChange={(e) => setNewProduct({ ...newProduct, des: e.target.value })}
            />

            {/* Dropdown type */}
            <Select
              value={newProduct.type}
              onValueChange={(value) => setNewProduct({ ...newProduct, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">rent</SelectItem>
                <SelectItem value="sale">sale</SelectItem>
              </SelectContent>
            </Select>

            {/* Image uploader */}
            <ImageUploader
              label="Upload Product Images"
              onUploadSuccess={handleMultipleImageUpload}
            />
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
