"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  Star,
  Eye,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { getMembershipLevelInfo } from "@/lib/pointsSystem";
import CustomerPointsModal from "@/components/customerPointsModal";
import { Customer, Sale } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
    null
  );
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(
    null
  );
  const [customerHistory, setCustomerHistory] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dateOfBirth: "",
    notes: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  // แล้วใช้ API calls แทน CustomerService methods
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const result = await response.json();
        setCustomers(result.customers || result);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCustomers();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/customers/search?term=${searchTerm}`);
      if (response.ok) {
        const results = await response.json();
        setCustomers(results);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/history`);
      if (response.ok) {
        const data = await response.json();
        setCustomerHistory(data);
      }
    } catch (error) {
      console.error("Error fetching customer history:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        // Update existing customer
        const response = await fetch(`/api/customers/${editingCustomer._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            dateOfBirth: formData.dateOfBirth
              ? new Date(formData.dateOfBirth)
              : undefined,
          }),
        });

        if (response.ok) {
          fetchCustomers();
          resetForm();
          alert("แก้ไขลูกค้าสำเร็จ!");
        } else {
          alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
        }
      } else {
        // Create new customer
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            dateOfBirth: formData.dateOfBirth
              ? new Date(formData.dateOfBirth)
              : undefined,
          }),
        });

        if (response.ok) {
          fetchCustomers();
          resetForm();
          alert("เพิ่มลูกค้าสำเร็จ!");
        } else {
          alert("เกิดข้อผิดพลาดในการเพิ่มลูกค้า");
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกค้า");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      dateOfBirth: customer.dateOfBirth
        ? new Date(customer.dateOfBirth).toISOString().split("T")[0]
        : "",
      notes: customer.notes || "",
    });
    setShowAddForm(true);
  };

  const handleViewHistory = (customer: Customer) => {
    setViewingCustomer(customer);
    fetchCustomerHistory(customer._id!);
  };

  const handleManagePoints = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPointsModal(true);
  };

  const handleDelete = async (customerId: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบลูกค้านี้?")) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchCustomers();
          alert("ลบลูกค้าสำเร็จ!");
        } else {
          alert("เกิดข้อผิดพลาดในการลบลูกค้า");
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("เกิดข้อผิดพลาดในการลบลูกค้า");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      dateOfBirth: "",
      notes: "",
    });
    setEditingCustomer(null);
    setShowAddForm(false);
  };

  const getMembershipColor = (level: string) => {
    const levelInfo = getMembershipLevelInfo(level);
    if (!levelInfo) return "bg-gray-100 text-gray-800";

    const colorMap = {
      orange: "bg-orange-100 text-orange-800",
      gray: "bg-gray-100 text-gray-800",
      yellow: "bg-yellow-100 text-yellow-800",
      purple: "bg-purple-100 text-purple-800",
    };

    return (
      colorMap[levelInfo.color as keyof typeof colorMap] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">จัดการลูกค้า</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center btn btn-success"
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลูกค้า
              </button>
              <Link href="/" className="btn btn-secondary">
                กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Add/Edit Form */}
        {showAddForm ? (
          <div className="card mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCustomer ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
              </h2>
            </div>
            <div className="p-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  type="text"
                  placeholder="ชื่อลูกค้า"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="เบอร์โทรศัพท์"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input"
                  required
                />
                <input
                  type="email"
                  placeholder="อีเมล (ไม่บังคับ)"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input"
                />
                <input
                  type="date"
                  placeholder="วันเกิด (ไม่บังคับ)"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="input"
                />
                <input
                  type="text"
                  placeholder="ที่อยู่ (ไม่บังคับ)"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input md:col-span-2"
                />
                <textarea
                  placeholder="หมายเหตุ (ไม่บังคับ)"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input md:col-span-2"
                  rows={3}
                />
                <div className="md:col-span-2 flex space-x-4">
                  <button type="submit" className="btn btn-primary">
                    {editingCustomer ? "บันทึกการแก้ไข" : "เพิ่มลูกค้า"}
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
          <>
            {/* Search */}
            <div className="card mb-6">
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาลูกค้า..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="input pl-10"
                    />
                  </div>
                  <button onClick={handleSearch} className="btn btn-primary">
                    ค้นหา
                  </button>
                </div>
              </div>
            </div>

            {/* Customers List */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  รายการลูกค้า ({filteredCustomers.length} คน)
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">กำลังโหลด...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {customer.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {customer.phone}
                              </p>
                              {customer.email && (
                                <p className="text-sm text-gray-600">
                                  {customer.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getMembershipColor(
                                customer.membershipLevel
                              )}`}
                            >
                              {customer.membershipLevel}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleManagePoints(customer)}
                                className="btn btn-sm btn-secondary"
                                title="จัดการแต้ม"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewHistory(customer)}
                                className="btn btn-sm btn-secondary"
                                title="ดูประวัติ"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(customer)}
                                className="btn btn-sm btn-secondary"
                                title="แก้ไข"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(customer._id!)}
                                className="btn btn-sm btn-danger"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {customer.address && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              <strong>ที่อยู่:</strong> {customer.address}
                            </p>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">ยอดซื้อรวม:</span>
                            <span className="font-semibold text-green-600">
                              ฿{customer.totalPurchases.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-500" />
                              คะแนนสะสม:
                            </span>
                            <span className="font-semibold text-blue-600">
                              {customer.points.toLocaleString()}
                            </span>
                          </div>
                          {customer.lastPurchase && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>ซื้อล่าสุด:</span>
                              <span>
                                {new Date(
                                  customer.lastPurchase
                                ).toLocaleDateString("th-TH")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Customer History Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overFlowAuto border border-gray-300 ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                ประวัติการซื้อ - {viewingCustomer.name}
              </h3>
              <button
                onClick={() => setViewingCustomer(null)}
                className="btn btn-secondary"
              >
                ปิด
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ระดับสมาชิก:</span>
                  <div
                    className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${getMembershipColor(
                      viewingCustomer.membershipLevel
                    )}`}
                  >
                    {viewingCustomer.membershipLevel}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">ยอดซื้อรวม:</span>
                  <div className="font-semibold text-green-600">
                    ฿{viewingCustomer.totalPurchases.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">คะแนนสะสม:</span>
                  <div className="font-semibold text-blue-600">
                    {viewingCustomer.points.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">จำนวนครั้งที่ซื้อ:</span>
                  <div className="font-semibold">
                    {customerHistory.length} ครั้ง
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {customerHistory.map((sale) => (
                <div
                  key={sale._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">
                      {new Date(sale.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-semibold text-green-600">
                      ฿{sale.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {customerHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  ยังไม่มีประวัติการซื้อ
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Points Management Modal */}
      {showPointsModal && selectedCustomer && (
        <CustomerPointsModal
          isOpen={showPointsModal}
          onClose={() => setShowPointsModal(false)}
          customerId={selectedCustomer._id!}
          customerName={selectedCustomer.name}
          currentPoints={selectedCustomer.points}
          membershipLevel={selectedCustomer.membershipLevel}
          onPointsUpdated={fetchCustomers}
        />
      )}
    </div>
  );
}
