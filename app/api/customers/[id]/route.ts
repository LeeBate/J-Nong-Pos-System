import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const customers = await db.collection("customers").find({}).toArray()

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

// Update the POST function to include points and membershipLevel
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const customerData = await request.json()

    const result = await db.collection("customers").insertOne({
      ...customerData,
      totalPurchases: 0,
      points: 0,
      membershipLevel: "Bronze",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newCustomer = await db.collection("customers").findOne({ _id: result.insertedId })

    return NextResponse.json({ success: true, id: result.insertedId, customer: newCustomer })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
