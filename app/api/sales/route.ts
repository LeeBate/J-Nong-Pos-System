import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const db  = await getDatabase()
    const saleData = await request.json()

    const saleResult = await db.collection("sales").insertOne({
      ...saleData,
      createdAt: new Date(),
    })

    for (const item of saleData.items) {
      await db.collection("products").updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } })
    }

    if (saleData.customerName && saleData.customerPhone) {
      await db.collection("customers").updateOne(
        { phone: saleData.customerPhone },
        {
          $set: {
            name: saleData.customerName,
            phone: saleData.customerPhone,
            lastPurchase: new Date(),
          },
          $inc: { totalPurchases: saleData.totalAmount },
        },
        { upsert: true },
      )
    }

    return NextResponse.json({ success: true, id: saleResult.insertedId })
  } catch (error) {
    console.error("Error processing sale:", error)
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db  = await getDatabase()
    const sales = await db.collection("sales").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}
