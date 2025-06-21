"use client"

import { AuthContextType, User } from "@/types/authType"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    console.log("AuthProvider mounted - checking authentication")
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("AuthContext - Starting auth check...")
      setLoading(true)

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("AuthContext - Response status:", response.status)

      if (response.ok) {
        try {
          const data = await response.json()
          console.log("AuthContext - Response data:", data)

          if (data.success && data.user) {
            console.log("AuthContext - User authenticated:", data.user.username)
            setUser(data.user)
          } else {
            console.log("AuthContext - Invalid response format:", data)
            setUser(null)
          }
        } catch (parseError) {
          console.error("AuthContext - JSON parse error:", parseError)
          setUser(null)
        }
      } else {
        console.log("AuthContext - Authentication failed")
        setUser(null)

        if (response.status === 401) {
          document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        }
      }
    } catch (error) {
      console.error("AuthContext - Network error:", error)
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
      console.log("AuthContext - Check completed")
    }
  }

  const loginWithUsernamePIN = async (username: string, pin: string): Promise<boolean> => {
    try {
      console.log("AuthContext - Username + PIN login attempt for:", username)

      const response = await fetch("/api/auth/login-username-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, pin }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          console.log("AuthContext - Username + PIN login successful")
          setUser(data.user)
          return true
        }
      }
      return false
    } catch (error) {
      console.error("AuthContext - Username + PIN login error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      console.log("AuthContext - Logout")

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        loginWithUsernamePIN,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
