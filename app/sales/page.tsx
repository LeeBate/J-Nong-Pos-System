"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Minus, Trash2, ShoppingCart, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  _id: string
  name: string
  price: number
  stock: number
  category: string
  barcode?: string
  image?: string
}

interface CartItem extends Product {
  quantity: number
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode?.includes(searchTerm)
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item._id === product._id)
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)))
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter((item) => item._id !== productId))
    } else {
      const product = products.find((p) => p._id === productId)
      if (product && newQuantity <= product.stock) {
        setCart(cart.map((item) => (item._id === productId ? { ...item, quantity: newQuantity } : item)))
      }
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item._id !== productId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customerName,
        customerPhone,
        totalAmount: getTotalAmount(),
        saleDate: new Date(),
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      })

      if (response.ok) {
        alert("การขายสำเร็จ!")
        setCart([])
        setCustomerName("")
        setCustomerPhone("")
        fetchProducts()
      }
    } catch (error) {
      console.error("Error processing sale:", error)
      alert("เกิดข้อผิดพลาดในการขาย")
    }
  }

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">ขายสินค้า</h1>
            <Link href="/" className="btn btn-secondary">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">เลือกสินค้า</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาสินค้า หรือ บาร์โค้ด..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input w-auto min-w-[150px]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "ทุกหมวดหมู่" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
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
                      <h3 className="font-semibold text-sm mb-1 text-gray-900">{product.name}</h3>
                      <p className="text-gray-600 text-xs mb-2">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">฿{product.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">คงเหลือ: {product.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div>
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  ตะกร้าสินค้า
                </h2>
              </div>
              <div className="p-6">
                {/* Customer Info */}
                <div className="mb-4 space-y-3">
                  <input
                    type="text"
                    placeholder="ชื่อลูกค้า (ไม่บังคับ)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="เบอร์โทร (ไม่บังคับ)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input"
                  />
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {item.image ? (
                          <div className="w-10 h-10 relative rounded overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-xs text-gray-600">฿{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
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

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">รวมทั้งหมด:</span>
                    <span className="text-xl font-bold text-blue-600">฿{getTotalAmount().toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ชำระเงิน
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
