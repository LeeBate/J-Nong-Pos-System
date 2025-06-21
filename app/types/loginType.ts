export interface UserOption {
  username: string
  fullName: string
  role: string
  lastLogin?: Date
}

export interface LoginHistory {
  username: string
  fullName: string
  role: string
  lastLogin: Date
}