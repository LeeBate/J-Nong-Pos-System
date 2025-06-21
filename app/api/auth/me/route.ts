import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 /api/auth/me - Request received")

    // Debug: แสดง cookies ทั้งหมด
    const cookies = request.cookies.getAll()
    console.log(
      "🍪 All cookies:",
      cookies.map((c) => ({ name: c.name, hasValue: !!c.value })),
    )

    // Debug: แสดง headers ที่เกี่ยวข้อง
    console.log("📋 Headers:")
    console.log("  - User-Agent:", request.headers.get("user-agent")?.substring(0, 50) + "...")
    console.log("  - Authorization:", !!request.headers.get("authorization"))
    console.log("  - Cookie:", !!request.headers.get("cookie"))

    const user = await authenticateRequest(request)

    if (!user) {
      console.log("❌ Authentication failed - no user")
      return NextResponse.json({ success: false, error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    console.log("✅ User authenticated successfully:", user.username)

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("❌ /api/auth/me error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
