import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ message: "ออกจากระบบสำเร็จ" })

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการออกจากระบบ" }, { status: 500 })
  }
}
