export interface User {
  _id: string
  username: string
  password: string
  role: "admin" | "cashier" | "manager"
  fullName: string
  email?: string
  phone?: string
  pin?: string
  qrCode?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthToken {
  userId: string
  username: string
  role: string
  fullName: string
  iat: number
  exp: number
}

export interface LoginLog {
  _id?: string
  userId: string
  username: string
  fullName: string
  action: "login" | "logout"
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  sessionDuration?: number
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  initialized: boolean
  loginWithUsernamePIN: (username: string, pin: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}