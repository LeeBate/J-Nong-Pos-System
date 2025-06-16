import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()

    const sales = await db.collection("sales").find({ customerId: params.id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching customer history:", error)
    return NextResponse.json({ error: "Failed to fetch customer history" }, { status: 500 })
  }
}
