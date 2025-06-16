import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db  = await getDatabase()

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get today's sales
    const todaySalesResult = await db.collection("sales")
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]).toArray()

    // Get total sales
    const totalSalesResult = await db.collection("sales")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]).toArray()

    // Get total products
    const totalProducts = await db.collection("products").countDocuments()

    // Get low stock products (stock <= 10)
    const lowStockProducts = await db.collection("products").countDocuments({ stock: { $lte: 10 } })

    // Get total customers
    const totalCustomers = await db.collection("customers").countDocuments()

    const stats = {
      todaySales: todaySalesResult[0]?.total || 0,
      totalSales: totalSalesResult[0]?.total || 0,
      totalProducts,
      lowStockProducts,
      totalCustomers
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
