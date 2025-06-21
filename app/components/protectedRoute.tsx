"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // รอให้ initialized เป็น true ก่อนตรวจสอบ
    if (initialized && !loading) {
      console.log("ProtectedRoute - Check:", { user: !!user, initialized, loading })

      if (!user) {
        console.log("ProtectedRoute - Redirecting to login (no user)")
        router.push("/login")
        return
      }

      if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
        console.log("ProtectedRoute - Redirecting to dashboard (insufficient role)")
        router.push("/dashboard")
        return
      }
    }
  }, [user, loading, initialized, router, requiredRole])

  // แสดง loading จนกว่า initialized จะเป็น true
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
