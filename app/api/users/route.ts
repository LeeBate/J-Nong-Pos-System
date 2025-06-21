import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // ดึงรายชื่อผู้ใช้ที่ active เท่านั้น
    const users = await db
      .collection("users")
      .find(
        { isActive: true },
        {
          projection: {
            username: 1,
            fullName: 1,
            role: 1,
            lastLogin: 1,
            _id: 0,
          },
        },
      )
      .toArray()

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        lastLogin: user.lastLogin,
      })),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 })
  }
}
