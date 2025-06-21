import { type NextRequest, NextResponse } from "next/server"
import { getUserByUsername, generateToken, updateLastLogin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Username + PIN Login API called")

    const { username, pin } = await request.json()

    if (!username || !pin) {
      return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้และ PIN" }, { status: 400 })
    }

    if (pin.length !== 6) {
      return NextResponse.json({ error: "กรุณากรอก PIN 6 หลัก" }, { status: 400 })
    }

    // Get user by username
    const user = await getUserByUsername(username)
    if (!user) {
      console.log("❌ User not found:", username)
      return NextResponse.json({ error: "ชื่อผู้ใช้ไม่ถูกต้อง" }, { status: 401 })
    }

    // Check PIN
    if (!user.pin || user.pin !== pin) {
      console.log("❌ Invalid PIN for user:", username)
      return NextResponse.json({ error: "PIN ไม่ถูกต้อง" }, { status: 401 })
    }

    console.log("✅ Username + PIN login successful for user:", user.username)

    // Generate token
    const token = generateToken(user)

    // Update last login
    await updateLastLogin(user._id)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      token,
    })

    // Set cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    console.log("✅ Username + PIN login successful")
    return response
  } catch (error) {
    console.error("❌ Username + PIN login error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 })
  }
}
