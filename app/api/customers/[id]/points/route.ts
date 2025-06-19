import { type NextRequest, NextResponse } from "next/server"
import { CustomerService } from "@/lib/customerService"

// ดึงประวัติแต้ม
export async function GET(request: NextRequest, context: any) {
  const { id } = await context.params

  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const history = await CustomerService.getPointsHistory(id, limit)

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching points history:", error)
    return NextResponse.json({ error: "Failed to fetch points history" }, { status: 500 })
  }
}

// ปรับแต้มด้วยตนเอง
export async function POST(request: NextRequest, context: any) {
  const { id } = await context.params

  try {
    const { points, description } = await request.json()

    if (!points || !description) {
      return NextResponse.json({ error: "Points and description are required" }, { status: 400 })
    }

    const success = await CustomerService.adjustPoints(id, points, description)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to adjust points" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error adjusting points:", error)
    return NextResponse.json({ error: "Failed to adjust points" }, { status: 500 })
  }
}
