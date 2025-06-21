"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    barcode: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, image: data.url });
      } else {
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      category: formData.category,
      barcode: formData.barcode,
      description: formData.description,
      image: formData.image,
    };

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        fetchProducts();
        resetForm();
        alert(editingProduct ? "แก้ไขสินค้าสำเร็จ!" : "เพิ่มสินค้าสำเร็จ!");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกสินค้า");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      barcode: product.barcode || "",
      description: product.description || "",
      image: product.image || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchProducts();
          alert("ลบสินค้าสำเร็จ!");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("เกิดข้อผิดพลาดในการลบสินค้า");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      barcode: "",
      description: "",
      image: "",
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Filter and pagination logic
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center btn btn-success cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มสินค้า
              </button>
              <Link href="/" className="btn btn-secondary">
                กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-3">
        {/* Add/Edit Form */}
        {showAddForm ? (
          <div className="card mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
              </h2>
            </div>
            <div className="p-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  type="text"
                  placeholder="ชื่อสินค้า"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="ราคา"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="input"
                  required
                />
                <input
                  type="number"
                  placeholder="จำนวนสต็อก"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="หมวดหมู่"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="บาร์โค้ด (ไม่บังคับ)"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="input"
                />
                <input
                  type="text"
                  placeholder="รายละเอียด (ไม่บังคับ)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input"
                />

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปภาพสินค้า
                  </label>
                  {formData.image ? (
                    <div className="relative">
                      <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <Image
                          src={formData.image || "/placeholder.svg"}
                          alt="Product image"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm text-center">
                        {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่อเลือกรูปภาพ"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        PNG, JPG, GIF (สูงสุด 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={uploading}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="md:col-span-2 flex space-x-4">
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between">
            {/* Search and Controls */}
            <div className="card mb-3 xl:mb-6">
              <div className="p-3">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาสินค้า..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                      แสดง:
                    </label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="input w-auto"
                    >
                      <option value={5}>5 รายการ</option>
                      <option value={10}>10 รายการ</option>
                      <option value={20}>20 รายการ</option>
                      <option value={50}>50 รายการ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    รายการสินค้า ({filteredProducts.length} รายการ)
                  </h2>
                  <div className="text-sm text-gray-600">
                    แสดง {startIndex + 1}-
                    {Math.min(endIndex, filteredProducts.length)} จาก{" "}
                    {filteredProducts.length} รายการ
                  </div>
                </div>
              </div>

              {/* Fixed Height Table Container */}
              <div className="overflow-hidden">
                <div className="overFlowAuto">
                  <div className="h-[25rem] xl:h-[42rem] overFlowAuto">
                    <table className="table">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr>
                          <th className="bg-gray-50">ชื่อสินค้า</th>
                          <th className="bg-gray-50">หมวดหมู่</th>
                          <th className="bg-gray-50 text-right">ราคา</th>
                          <th className="bg-gray-50 text-right">สต็อก</th>
                          <th className="bg-gray-50">บาร์โค้ด</th>
                          <th className="bg-gray-50 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProducts.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <div className="flex items-center space-x-3">
                                {product.image ? (
                                  <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                      src={product.image || "/placeholder.svg"}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {product.name}
                                  </div>
                                  {product.description && (
                                    <div className="text-sm text-gray-600 truncate">
                                      {product.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-gray-900">
                              {product.category}
                            </td>
                            <td className="text-right font-medium text-gray-900">
                              ฿{product.price.toLocaleString()}
                            </td>
                            <td className="text-right">
                              <span
                                className={`px-2 py-1 rounded-full text-sm font-medium ${
                                  product.stock > 10
                                    ? "bg-green-100 text-green-800"
                                    : product.stock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.stock}
                              </span>
                            </td>
                            <td className="text-gray-900">
                              {product.barcode || "-"}
                            </td>
                            <td className="text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="btn btn-sm btn-secondary"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id)}
                                  className="btn btn-sm btn-danger"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Empty State */}
                    {currentProducts.length === 0 && (
                      <div className="text-center py-12">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">ไม่พบสินค้าที่ค้นหา</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      หน้า {currentPage} จาก {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        ก่อนหน้า
                      </button>

                      {/* Page Numbers */}
                      <div className="flex space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`w-8 h-8 text-sm rounded ${
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ถัดไป
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
