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
  points: number
  membershipLevel: string
  lastPurchase?: Date
}

export interface Sale {
  _id: string
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  totalAmount: number
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

export interface ModalConfig {
  type: "info" | "warning" | "error" | "success" | "confirm"
  title: string
  message: string
  primaryButton?: {
    text: string
    action: () => void
    variant?: "primary" | "success" | "danger"
  }
  secondaryButton?: {
    text: string
    action: () => void
    variant?: "secondary" | "outline"
  }
  onClose?: () => void
  closable?: boolean
}

export interface ModalContextType {
  isOpen: boolean
  config: ModalConfig | null
  showModal: (config: ModalConfig) => void
  hideModal: () => void
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void
  showAlert: (title: string, message: string, type?: "info" | "warning" | "error" | "success") => void
  showError: (message: string, title?: string) => void
  showSuccess: (message: string, title?: string) => void
}

export interface Discount {
  type: "percentage" | "fixed" | "points"
  value: number
  description: string
}

export interface CartItem extends Product {
  quantity: number
}