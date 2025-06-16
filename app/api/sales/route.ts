import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// Update the POST function to handle points and discounts
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const saleData = await request.json()

    const saleResult = await db.collection("sales").insertOne({
      ...saleData,
      createdAt: new Date(),
    })

    // Update product stock
    for (const item of saleData.items) {
      await db.collection("products").updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } })
    }

    // Update customer data
    if (saleData.customerId) {
      const updateData: any = {
        $set: {
          lastPurchase: new Date(),
        },
        $inc: {
          totalPurchases: saleData.totalAmount,
          points: saleData.pointsEarned - (saleData.pointsUsed || 0),
        },
      }

      const customer = await db.collection("customers").findOne({ _id: saleData.customerId })
      if (customer) {
        const newTotalPurchases = customer.totalPurchases + saleData.totalAmount

        // Update membership level based on total purchases
        let newMembershipLevel = "Bronze"
        if (newTotalPurchases >= 50000) {
          newMembershipLevel = "Platinum"
        } else if (newTotalPurchases >= 20000) {
          newMembershipLevel = "Gold"
        } else if (newTotalPurchases >= 5000) {
          newMembershipLevel = "Silver"
        }

        updateData.$set.membershipLevel = newMembershipLevel
      }

      await db.collection("customers").updateOne({ _id: saleData.customerId }, updateData)
    } else if (saleData.customerName && saleData.customerPhone) {
      // Create or update customer without ID
      await db.collection("customers").updateOne(
        { phone: saleData.customerPhone },
        {
          $set: {
            name: saleData.customerName,
            phone: saleData.customerPhone,
            lastPurchase: new Date(),
          },
          $inc: {
            totalPurchases: saleData.totalAmount,
          },
          $setOnInsert: {
            points: 0,
            membershipLevel: "Bronze",
            createdAt: new Date(),
          },
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
    const db = await getDatabase()
    const sales = await db.collection("sales").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}
