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
    gallery: [] as number[],
    type: "rent",
    // New fields for rent
    duration: "", // Number of months
    start_date: "", // Start date
    end_date: "", // End date
    // New fields for location
    governorate: "", // Governorate
    city: "", // City
    address: "", // Detailed address
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
      gallery: [...prev.gallery, Number(id)],
    }));
  };

  // Create new product
  const handleCreateProduct = async () => {
    try {
      const productData: any = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        des: newProduct.des,
        gallery: newProduct.gallery,
        type: newProduct.type,
        governorate: newProduct.governorate,
        city: newProduct.city,
        address: newProduct.address,
      };

      // Add rent fields only if type is "rent"
      if (newProduct.type === "rent") {
        productData.duration = newProduct.duration;
        productData.start_date = newProduct.start_date;
        productData.end_date = newProduct.end_date;
      }

      await api.post("/rent", productData);
      setModalOpen(false);
      fetchProducts(page);
      // Reset form
      setNewProduct({ 
        name: "", 
        price: "", 
        des: "", 
        gallery: [], 
        type: "rent",
        duration: "",
        start_date: "",
        end_date: "",
        governorate: "",
        city: "",
        address: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create product.");
    }
  };

  // Egyptian governorates list (example)
  const governorates = [
    "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira",
    "Faiyum", "Gharbia", "Ismailia", "Monufia", "Minya", "Qalyubia",
    "New Valley", "Suez", "Aswan", "Asyut", "Beni Suef", "Port Said",
    "Damietta", "Sharqia", "South Sinai", "Kafr El Sheikh", "Matrouh", "Luxor", "Qena"
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Rent Clinic</h1>
          <Button onClick={() => setModalOpen(true)}>Add Rent Clinic</Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                {product.gallery && product.gallery.length > 0 && (
                  <img
                    src={product.gallery?.[0]?.fullUrl}
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
                
                {/* Display additional information */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{product.type === "rent" ? "Rent" : "Sale"}</span>
                  </div>
                  {product.type === "rent" && product.duration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{product.duration} months</span>
                    </div>
                  )}
                  {product.governorate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Governorate:</span>
                      <span className="font-medium">{product.governorate}</span>
                    </div>
                  )}
                </div>

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
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Rent Clinic</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Clinic Name"
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
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
              </SelectContent>
            </Select>

            {/* Rent fields - only show if type is rent */}
            {newProduct.type === "rent" && (
              <div className="space-y-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-800">Rent Information</h4>
                <Input
                  placeholder="Duration (number of months)"
                  type="number"
                  value={newProduct.duration}
                  onChange={(e) => setNewProduct({ ...newProduct, duration: e.target.value })}
                />
                <Input
                  placeholder="Start Date"
                  type="date"
                  value={newProduct.start_date}
                  onChange={(e) => setNewProduct({ ...newProduct, start_date: e.target.value })}
                />
                <Input
                  placeholder="End Date"
                  type="date"
                  value={newProduct.end_date}
                  onChange={(e) => setNewProduct({ ...newProduct, end_date: e.target.value })}
                />
              </div>
            )}

            {/* Location fields */}
            <div className="space-y-3 p-3 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-800">Location Information</h4>
              
              <Select
                value={newProduct.governorate}
                onValueChange={(value) => setNewProduct({ ...newProduct, governorate: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Governorate" />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="City"
                value={newProduct.city}
                onChange={(e) => setNewProduct({ ...newProduct, city: e.target.value })}
              />

              <Input
                placeholder="Detailed Address"
                value={newProduct.address}
                onChange={(e) => setNewProduct({ ...newProduct, address: e.target.value })}
              />
            </div>

            {/* Image uploader */}
            <div className="p-3 border border-gray-200 rounded-lg">
              <ImageUploader
                label="Upload Clinic Images"
                onUploadSuccess={handleMultipleImageUpload}
              />
              {newProduct.gallery.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
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