export interface Product {
  _id: string
  name: string
  price: number
  stock: number
  category: string
  barcode?: string
  description?: string
  image?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  address?: string
  totalPurchases: number
  lastPurchase?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface Sale {
  _id: string
  items: SaleItem[]
  customerName?: string
  customerPhone?: string
  totalAmount: number
  saleDate: Date
  createdAt: Date
}

export interface SaleItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface DashboardStats {
  totalSales: number
  totalProducts: number
  totalCustomers: number
  todaySales: number
}
