"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ImageIcon,
  User,
  Gift,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useModal, useConfirm } from "@/hooks/useModal";
import { CartItem, Customer, Discount, Product } from "@/types/types";
import PaymentModal, { type PaymentData } from "@/components/paymentModal";
import ReceiptModal from "@/components/receiptModal";
import { validatePhoneNumber } from "@/lib/utils";

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Customer states
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dateOfBirth: "",
    notes: "",
  });

  // Discount states
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [usePoints, setUsePoints] = useState(0);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Modal hook
  const { showModal, showError, showSuccess, hideModal } = useModal();
  const confirm = useConfirm();

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

  const searchCustomer = async () => {
    if (!customerPhone) {
      showModal({
        type: "warning",
        title: "แจ้งเตือน",
        message: "กรุณากรอกเบอร์โทรศัพท์",
        primaryButton: {
          text: "ตกลง",
          action: () => {
            hideModal();
          },
          variant: "success",
        },
      });
      return;
    }

    if (!validatePhoneNumber(customerPhone)) {
      showModal({
        type: "warning",
        title: "แจ้งเตือน",
        message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)",
        primaryButton: {
          text: "ตกลง",
          action: () => {
            hideModal();
          },
          variant: "success",
        },
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/customers/search?phone=${customerPhone}`
      );
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
        calculateDiscount(data);
      } else if (response.status === 404) {
        // ไม่พบข้อมูลผู้ใช้
        setCustomer(null);
        setAppliedDiscount(null);
        showModal({
          type: "warning",
          title: "แจ้งเตือน",
          message: "ไม่พบข้อมูลของผู้ใช้",
          primaryButton: {
            text: "สมัครสมาชิก",
            action: () => {
              setCustomerFormData({
                ...customerFormData,
                phone: customerPhone,
              });
              setShowCustomerForm(true);
              hideModal();
            },
            variant: "success",
          },
          secondaryButton: {
            text: "ย้อนกลับ",
            action: () => {
              hideModal();
            },
            variant: "secondary",
          },
          closable: true,
        });
      } else {
        // Error อื่นๆ
        setCustomer(null);
        setAppliedDiscount(null);
        showError("พบปัญหาการเชื่อมต่ออินเทอร์เน็ต", "พบข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      setCustomer(null);
      setAppliedDiscount(null);
      showError("พบปัญหาการเชื่อมต่ออินเทอร์เน็ต", "พบข้อผิดพลาด");
    }
  };

  const calculateDiscount = (customerData: Customer) => {
    const subtotal = getSubtotal();

    // ส่วนลดตามระดับสมาชิก
    let discountPercentage = 0;
    switch (customerData.membershipLevel) {
      case "Bronze":
        discountPercentage = 5;
        break;
      case "Silver":
        discountPercentage = 10;
        break;
      case "Gold":
        discountPercentage = 15;
        break;
      case "Platinum":
        discountPercentage = 20;
        break;
    }

    // ส่วนลดตามยอดซื้อ
    if (subtotal >= 1000) {
      discountPercentage = Math.max(discountPercentage, 10);
    } else if (subtotal >= 500) {
      discountPercentage = Math.max(discountPercentage, 5);
    }

    if (discountPercentage > 0) {
      setAppliedDiscount({
        type: "percentage",
        value: discountPercentage,
        description: `ส่วนลดสมาชิก ${customerData.membershipLevel} ${discountPercentage}%`,
      });
    }
  };

    const resetForm = () => {
    setCustomerFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      dateOfBirth: "",
      notes: "",
    })
    setShowCustomerForm(false);
    setCustomer(null);
    setCustomerPhone("");
  }


  const handleCustomerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!validatePhoneNumber(customerFormData.phone)) {
      showModal({
        type: "warning",
        title: "แจ้งเตือน",
        message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)",
        primaryButton: {
          text: "ตกลง",
          action: () => {
            hideModal();
          },
          variant: "success",
        },
      });
      return;
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
           body: JSON.stringify({
            ...customerFormData,
            dateOfBirth: customerFormData.dateOfBirth ? new Date(customerFormData.dateOfBirth) : undefined,
          }),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setCustomer(newCustomer.customer);
        setCustomerPhone(customerFormData.phone);
        setShowCustomerForm(false);
        resetForm();
        showSuccess("สมัครสมาชิกสำเร็จ!");
      }else if (response.status === 409) {
        showError("เบอร์โทรศัพท์นี้มีผู้ใช้แล้ว กรุณาใช้เบอร์อื่น");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch (error) {
      console.error("Error registering customer:", error);
      showError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        showModal({
          type: "warning",
          title: "ไม่สามารถเพิ่มสินค้า",
          message: `สินค้าคงเหลือไม่เพียงพอ (คงเหลือ ${product.stock} ชิ้น)`,
          primaryButton: {
            text: "ตกลง",
            action: () => hideModal(),
            variant: "success",
          },
        });
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      } else {
        showModal({
          type: "warning",
          title: "ไม่สามารถเพิ่มสินค้า",
          message: `สินค้าคงเหลือไม่เพียงพอ (คงเหลือ ${product.stock} ชิ้น)`,
          primaryButton: {
            text: "ตกลง",
            action: () => hideModal(),
            variant: "success",
          },
        });
      }
    }

    // คำนวณส่วนลดใหม่เมื่อมีการเปลี่ยนแปลงตะกร้า
    if (customer) {
      calculateDiscount(customer);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter((item) => item._id !== productId));
    } else {
      const product = products.find((p) => p._id === productId);
      if (product && newQuantity <= product.stock) {
        setCart(
          cart.map((item) =>
            item._id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    }

    // คำนวณส่วนลดใหม่
    if (customer) {
      calculateDiscount(customer);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item._id !== productId));
    if (customer) {
      calculateDiscount(customer);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    if (!appliedDiscount) return 0;

    if (appliedDiscount.type === "percentage") {
      return subtotal * (appliedDiscount.value / 100);
    } else if (appliedDiscount.type === "fixed") {
      return appliedDiscount.value;
    } else if (appliedDiscount.type === "points") {
      return usePoints;
    }
    return 0;
  };

  const getPointsDiscount = () => {
    return usePoints;
  };

  const getTotalAmount = () => {
    return getSubtotal() - getDiscountAmount() - getPointsDiscount();
  };

  const getEarnedPoints = () => {
    // ได้ 1 คะแนนต่อการใช้จ่าย 10 บาท
    return Math.floor(getTotalAmount() / 10);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (paymentData: PaymentData) => {
    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customerId: customer?._id,
        customerName: customer?.name,
        customerPhone: customer?.phone,
        subtotal: getSubtotal(),
        discountAmount: getDiscountAmount(),
        pointsUsed: usePoints,
        pointsEarned: getEarnedPoints(),
        totalAmount: getTotalAmount(),
        paymentMethod: paymentData.method.id,
        paymentReference: paymentData.reference,
        saleDate: new Date(),
      };

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const result = await response.json();
        // สร้างข้อมูลใบเสร็จ
        const receipt = {
          receiptNumber: `R${Date.now().toString().slice(-8)}`,
          date: new Date(),
          items: cart.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: getSubtotal(),
          discount: getDiscountAmount(),
          pointsUsed: usePoints,
          total: getTotalAmount(),
          payment: paymentData,
          customer: customer
            ? {
                name: customer.name,
                phone: customer.phone,
                membershipLevel: customer.membershipLevel,
                pointsEarned: getEarnedPoints(),
              }
            : undefined,
        };

        setReceiptData(receipt);
        setShowPaymentModal(false);
        setShowReceiptModal(true);

        // Reset cart and customer data
        setCart([]);
        setCustomer(null);
        setCustomerPhone("");
        setAppliedDiscount(null);
        setUsePoints(0);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      showError("เกิดข้อผิดพลาดในการขาย");
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  return (
    <div className=" bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">ขายสินค้า</h1>
            <Link href="/" className="btn btn-secondary">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </header>

      {/* Products Section */}
      <div className="max-w-full xl:max-w-7xl mx-auto py-3 xl:py-6 sm:px-6 lg:px-3 ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="col-span-8">
            <div className="card h-[42rem] xl:h-[60rem]">
              <div className="p-3 xl:p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  เลือกสินค้า
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาสินค้า หรือ บาร์โค้ด..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 h-[48px]"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input w-auto min-w-[150px] "
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "ทุกหมวดหมู่" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-3 xl:p-4 h-[34rem] xl:h-[52rem] overFlowAuto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-3 gap-3 xl:gap-6 overFlowAuto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all duration-200 hover:border-blue-300"
                      onClick={() => addToCart(product)}
                    >
                      {product.image ? (
                        <div className="w-full h-32 relative rounded-lg overflow-hidden mb-3">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <h3 className="font-semibold text-sm mb-1 text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-xs mb-2">
                        {product.category}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">
                          ฿{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          คงเหลือ: {product.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col col-span-4 space-y-2 xl:space-y-3 ">
            {/* Cart Section */}

            <div className="card h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  ตะกร้าสินค้า
                </h2>
              </div>
              <div className="p-2">
                <div className="flex flex-col justify-between h-[27rem] xl:h-[41rem]">
                  {/* Cart Items */}
                  <div className="space-y-1 mb-4 h-full overFlowAuto">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="mr-2 w-[125px] xl:w-[215px]">
                            <h4 className="text-md font-medium text-gray-900 truncate ">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              ฿{item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="w-8 h-8 flex items-center justify-center border border-red-300 rounded hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Calculation */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ยอดรวม:</span>
                      <span className="font-medium">
                        ฿{getSubtotal().toLocaleString()}
                      </span>
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>ส่วนลด:</span>
                        <span>-฿{getDiscountAmount().toLocaleString()}</span>
                      </div>
                    )}

                    {usePoints > 0 && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>ใช้คะแนน:</span>
                        <span>-฿{usePoints.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-semibold text-gray-900">
                        รวมทั้งหมด:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ฿{getTotalAmount().toLocaleString()}
                      </span>
                    </div>

                    {customer && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          คะแนนที่จะได้รับ:
                        </span>
                        <span className="font-medium">
                          {getEarnedPoints()} คะแนน
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                      className="btn btn-primary w-full mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ชำระเงิน
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-2 h-full">
              {/* Customer Search */}
              <div className="mb-2 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เบอร์โทรลูกค้า"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input flex-1"
                  />
                  <button onClick={searchCustomer} className="btn btn-primary">
                    ค้นหา
                  </button>
                </div>

                {!customer && customerPhone && (
                  <button
                    onClick={() => {
                      setCustomerFormData({
                        ...customerFormData,
                        phone: customerPhone,
                      });
                      setShowCustomerForm(true);
                    }}
                    className="flex items-center justify-center btn btn-success w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    สมัครสมาชิกใหม่
                  </button>
                )}
              </div>

              {/* Customer Info */}
              {customer && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-900">
                      {customer?.name}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {customer?.membershipLevel}
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>คะแนนสะสม:</span>
                      <span className="font-medium">
                        {customer?.points?.toLocaleString()} คะแนน
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ยอดซื้อรวม:</span>
                      <span className="font-medium">
                        ฿{customer?.totalPurchases?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Use Points */}
                  {customer?.points > 0 && (
                    <div className="mt-0">
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        ใช้คะแนน (1 คะแนน = 1 บาท)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={Math.min(customer?.points, getSubtotal())}
                        value={usePoints}
                        onChange={(e) => setUsePoints(Number(e.target.value))}
                        className="input text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Discount Info */}
              {/* {appliedDiscount && (
                <div className=" p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-700">
                    <Gift className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {appliedDiscount?.description}
                    </span>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Registration Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              สมัครสมาชิกใหม่
            </h3>
            <form onSubmit={handleCustomerRegistration} className="space-y-4">
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล"
                value={customerFormData.name}
                onChange={(e) =>
                  setCustomerFormData({
                    ...customerFormData,
                    name: e.target.value,
                  })
                }
                className="input"
                required
              />
              <input
                type="text"
                placeholder="เบอร์โทรศัพท์"
                value={customerFormData.phone}
                onChange={(e) =>
                  setCustomerFormData({
                    ...customerFormData,
                    phone: e.target.value,
                  })
                }
                className="input"
                required
              />
                <input
                  type="date"
                  placeholder="วันเกิด (ไม่บังคับ)"
                  value={customerFormData.dateOfBirth}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, dateOfBirth: e.target.value })}
                  className="input"
                />
              <input
                type="email"
                placeholder="อีเมล (ไม่บังคับ)"
                value={customerFormData.email}
                onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="ที่อยู่ (ไม่บังคับ)"
                value={customerFormData.address}
                onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                className="input"
              />
               <textarea
                  placeholder="หมายเหตุ (ไม่บังคับ)"
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, notes: e.target.value })}
                  className="input md:col-span-2"
                  rows={3}
                />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  สมัครสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={getTotalAmount()}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          receiptData={receiptData}
        />
      )}
    </div>
  );
}
