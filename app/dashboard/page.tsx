"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Package, Users, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protectedRoute"
import UserMenu from "@/components/userMenu"
import { DashboardStats } from "@/types/types"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    todaySales: 0,
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  return (
    <ProtectedRoute>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">ระบบ POS</h1>
            <div className="flex items-center space-x-4">
              <Link href="/sales" className="btn btn-primary flex items-center ">
                <ShoppingCart className="w-4 h-4 mr-2" />
                <p>ขาย</p>
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/" className="border-b-2 border-blue-500 py-4 px-1 text-blue-600 font-medium">
              แดชบอร์ด
            </Link>
            <Link href="/sales" className="py-4 px-1 text-gray-500 hover:text-gray-700 transition-colors">
              ขาย
            </Link>
            <Link href="/products" className="py-4 px-1 text-gray-500 hover:text-gray-700 transition-colors">
              สินค้า
            </Link>
            <Link href="/customers" className="py-4 px-1 text-gray-500 hover:text-gray-700 transition-colors">
              ลูกค้า
            </Link>
            <Link href="/reports" className="py-4 px-1 text-gray-500 hover:text-gray-700 transition-colors">
              รายงาน
            </Link>
            <Link href="/charts" className="py-4 px-1 text-gray-500 hover:text-gray-700 transition-colors">
              กราฟ
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ยอดขายวันนี้</p>
                  <p className="text-2xl font-bold text-gray-900">฿{stats?.todaySales?.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+20.1% จากเมื่อวาน</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ยอดขายรวม</p>
                  <p className="text-2xl font-bold text-gray-900">฿{stats?.totalSales?.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+15% จากเดือนที่แล้ว</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">จำนวนสินค้า</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts}</p>
                  <p className="text-xs text-gray-500">รายการสินค้าทั้งหมด</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ลูกค้า</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers}</p>
                  <p className="text-xs text-gray-500">ลูกค้าทั้งหมด</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">ขายสินค้า</h3>
              </div>
              <p className="text-gray-600 mb-4">เริ่มต้นการขายสินค้าใหม่</p>
              <Link href="/sales" className="btn btn-primary w-full">
                เริ่มขาย
              </Link>
            </div>

            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">จัดการสินค้า</h3>
              </div>
              <p className="text-gray-600 mb-4">เพิ่ม แก้ไข หรือลบสินค้า</p>
              <Link href="/products" className="btn btn-secondary w-full">
                จัดการสินค้า
              </Link>
            </div>

            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">รายงานการขาย</h3>
              </div>
              <p className="text-gray-600 mb-4">ดูรายงานและสถิติการขาย</p>
              <Link href="/reports" className="btn btn-secondary w-full">
                ดูรายงาน
              </Link>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
