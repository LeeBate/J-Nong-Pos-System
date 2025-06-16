import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, context: any) {
  const { id } = await context.params;
  try {
    const db = await getDatabase()
    if (!id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }
    const sales = await db.collection("sales").find({ customerId: id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching customer history:", error)
    return NextResponse.json({ error: "Failed to fetch customer history" }, { status: 500 })
  }
}
