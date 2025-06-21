import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import { AuthToken, User } from "@/types/authType"

// ตรวจสอบ JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in environment variables")
  throw new Error("JWT_SECRET is required")
}

console.log("✅ JWT_SECRET is configured, length:", JWT_SECRET.length)

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload = {
    userId: user._id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  }

  const token : string = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  })

  console.log("✅ Token generated for user:", user.username)
  console.log("🔑 Token preview:", token.substring(0, 20) + "...")
  return token
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
  try {
    console.log("🔍 Verifying token:", token.substring(0, 20) + "...")

    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken

    console.log("✅ Token verified successfully")
    console.log("👤 User:", decoded.username)
    console.log("⏰ Expires:", new Date(decoded.exp * 1000).toLocaleString())
    console.log("🕐 Current time:", new Date().toLocaleString())
    console.log("⏳ Time until expiry:", Math.round((decoded.exp * 1000 - Date.now()) / (1000 * 60 * 60)), "hours")

    return decoded
  } catch (error : any) {
    console.error("❌ Token verification failed:")
    console.error("  - Error type:", error.constructor.name)
    console.error("  - Error message:", error.message)
    console.error("  - Token preview:", token.substring(0, 20) + "...")
    return null
  }
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  console.log("🔍 Looking for token in request...")

  // ลองหาจาก cookie ก่อน
  const cookieToken = request.cookies.get("auth-token")?.value
  if (cookieToken) {
    console.log("🍪 Token found in cookie:", cookieToken.substring(0, 20) + "...")
    return cookieToken
  }

  // ลองหาจาก Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const headerToken = authHeader.substring(7)
    console.log("🔑 Token found in Authorization header:", headerToken.substring(0, 20) + "...")
    return headerToken
  }

  // Debug: แสดง cookies ทั้งหมด
  const allCookies = request.cookies.getAll()
  console.log(
    "🍪 All available cookies:",
    allCookies.map((c) => ({ name: c.name, hasValue: !!c.value })),
  )

  // Debug: แสดง cookie header
  const cookieHeader = request.headers.get("cookie")
  console.log("📋 Cookie header:", cookieHeader)

  console.log("❌ No token found in request")
  return null
}

// Authenticate user from request
export async function authenticateRequest(request: NextRequest): Promise<User | null> {
  try {
    console.log("🔐 Starting authentication process...")

    const token = getTokenFromRequest(request)
    if (!token) {
      console.log("❌ No token provided")
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("❌ Invalid token")
      return null
    }

    console.log("🔍 Looking up user in database:", decoded.userId)

    const db = await getDatabase()
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
      isActive: true,
    })

    if (!user) {
      console.log("❌ User not found in database:", decoded.userId)
      return null
    }

    console.log("✅ User authenticated successfully:", user.username)
    return {
      ...user,
      _id: user._id.toString(),
    } as User
  } catch (error) {
    console.error("❌ Authentication error:", error)
    return null
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    console.log("🔍 Looking up user by username:", username)
    const db= await getDatabase()
    const user = await db.collection("users").findOne({
      username: username.toLowerCase(),
      isActive: true,
    })

    if (!user) {
      console.log("❌ User not found:", username)
      return null
    }

    console.log("✅ User found:", user.username)
    return {
      ...user,
      _id: user._id.toString(),
    } as User
  } catch (error) {
    console.error("❌ Error getting user by username:", error)
    return null
  }
}

// Get user by PIN
export async function getUserByPIN(pin: string): Promise<User | null> {
  try {
    console.log("🔍 Looking up user by PIN")
    const db = await getDatabase()
    const user = await db.collection("users").findOne({
      pin,
      isActive: true,
    })

    if (!user) {
      console.log("❌ User not found with PIN")
      return null
    }

    console.log("✅ User found with PIN:", user.username)
    return {
      ...user,
      _id: user._id.toString(),
    } as User
  } catch (error) {
    console.error("❌ Error getting user by PIN:", error)
    return null
  }
}

// Update user last login
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const db= await getDatabase()
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      },
    )
    console.log("✅ Last login updated for user:", userId)
  } catch (error) {
    console.error("❌ Error updating last login:", error)
  }
}

// Change password
export async function changePassword(userId: string, newPassword: string): Promise<boolean> {
  const db = await getDatabase()
  const hashedPassword = await hashPassword(newPassword)

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

// Update user PIN
export async function updateUserPIN(userId: string, pin: string): Promise<boolean> {
  const db = await getDatabase()

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        pin,
        updatedAt: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

