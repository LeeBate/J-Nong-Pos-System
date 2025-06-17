import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { convertToThaiTime } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    console.log("Drill-down API called")

    const db = await getDatabase()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get("type")
    const date = searchParams.get("date")
    const productName = searchParams.get("productName")

    console.log("Parameters:", { type, date, productName })

    if (type === "date" && date) {
      // แก้ไขการสร้าง date range ให้เป็นเวลาไทย
      const inputDate = new Date(date)

      // สร้าง date range แบบเดียวกับ reports API
      const startOfDay = new Date(inputDate.getTime() + 7 * 60 * 60 * 1000) // เพิ่ม 7 ชั่วโมงเพื่อให้เป็นเวลาไทย
      const endOfDay = new Date(inputDate.getTime() + 7 * 60 * 60 * 1000) // เพิ่ม 7 ชั่วโมงเพื่อให้เป็นเวลาไทย

      // ตั้งเวลาให้ครอบคลุมทั้งวัน โดยใช้ UTC methods
      startOfDay.setUTCHours(0, 0, 0, 0)
      endOfDay.setUTCHours(23, 59, 59, 999)

      console.log("=== DEBUG DRILL-DOWN DATE RANGE ===")
      console.log("Input date:", date)
      console.log("Input date object:", inputDate.toISOString())
      console.log("Start of day (Thai):", startOfDay.toISOString())
      console.log("End of day (Thai):", endOfDay.toISOString())
      console.log("=== END DEBUG DATE RANGE ===")

      const transactions = await db
        .collection("sales")
        .find({
          $or: [
            {
              // ถ้ามีฟิลด์ thaiCreatedAt ให้ใช้ฟิลด์นี้
              thaiCreatedAt: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
            },
            {
              // สำหรับข้อมูลเก่าที่ไม่มี thaiCreatedAt
              // แปลงช่วงเวลาไทยกลับเป็น UTC สำหรับการ query
              createdAt: {
                $gte: new Date(startOfDay.getTime() - 7 * 60 * 60 * 1000), // ลบ 7 ชั่วโมงเพื่อให้ตรงกับเวลาไทย
                $lte: new Date(endOfDay.getTime() - 7 * 60 * 60 * 1000),
              },
            },
          ],
        })
        .sort({ createdAt: 1 })
        .toArray()

      console.log("Found transactions:", transactions.length)

      // ดึงข้อมูล products เพื่อ join
      const allProducts = await db.collection("products").find({}).toArray()
      const productMap = new Map()
      allProducts.forEach((product) => {
        productMap.set(product._id.toString(), product)
      })

      console.log("=== DEBUG DRILL-DOWN TIME CONVERSION ===")
      const detailedTransactions = transactions.map((transaction, index) => {
        const items =
          transaction.items?.map((item) => {
            const product = productMap.get(item.productId)
            return {
              name: item.name || product?.name || `Product ${item.productId}`,
              quantity: item.quantity || 0,
              price: item.price || 0,
              cost: product?.cost || 0,
              category: product?.category || "ไม่ระบุหมวดหมู่",
            }
          }) || []

        const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0)
        const totalProfit = (transaction.totalAmount || 0) - totalCost

        // แก้ไขการแปลงเวลา - ไม่แปลงซ้ำ
        let thaiTime: Date
        let timeString: string

        if (transaction.thaiCreatedAt) {
          // ถ้ามี thaiCreatedAt แล้ว ใช้โดยตรง
          thaiTime = new Date(transaction.thaiCreatedAt)

          // ใช้ getUTCHours และ getUTCMinutes เพราะ thaiCreatedAt เก็บเวลาไทยในรูปแบบ UTC
          const hours = thaiTime.getUTCHours().toString().padStart(2, "0")
          const minutes = thaiTime.getUTCMinutes().toString().padStart(2, "0")
          timeString = `${hours}:${minutes}`

          if (index < 3) {
            console.log(`Transaction ${index + 1} (has thaiCreatedAt):`)
            console.log("- thaiCreatedAt:", transaction.thaiCreatedAt)
            console.log("- UTC Hours:", thaiTime.getUTCHours())
            console.log("- UTC Minutes:", thaiTime.getUTCMinutes())
            console.log("- timeString:", timeString)
          }
        } else {
          // ถ้าไม่มี thaiCreatedAt ให้แปลงจาก createdAt
          const utcDate = new Date(transaction.createdAt)
          thaiTime = convertToThaiTime(utcDate)

          // ใช้ getUTCHours และ getUTCMinutes เพราะ thaiTime เป็น Date object ที่ปรับเวลาแล้ว
          const hours = thaiTime.getUTCHours().toString().padStart(2, "0")
          const minutes = thaiTime.getUTCMinutes().toString().padStart(2, "0")
          timeString = `${hours}:${minutes}`

          if (index < 3) {
            console.log(`Transaction ${index + 1} (convert from createdAt):`)
            console.log("- createdAt:", transaction.createdAt)
            console.log("- converted thaiTime:", thaiTime.toISOString())
            console.log("- UTC Hours:", thaiTime.getUTCHours())
            console.log("- UTC Minutes:", thaiTime.getUTCMinutes())
            console.log("- timeString:", timeString)
          }
        }

        return {
          id: transaction._id.toString(),
          time: timeString,
          items: items.map((item) => `${item.name} (${item.quantity})`),
          itemDetails: items,
          amount: transaction.totalAmount || 0,
          cost: totalCost,
          profit: totalProfit,
          customer: transaction.customerName || "ลูกค้าทั่วไป",
          paymentMethod: transaction.paymentMethod || "เงินสด",
        }
      })
      console.log("=== END DEBUG DRILL-DOWN ===")

      const summary = {
        totalTransactions: detailedTransactions.length,
        totalSales: detailedTransactions.reduce((sum, t) => sum + t.amount, 0),
        totalCost: detailedTransactions.reduce((sum, t) => sum + t.cost, 0),
        totalProfit: detailedTransactions.reduce((sum, t) => sum + t.profit, 0),
        averageTransaction:
          detailedTransactions.length > 0
            ? detailedTransactions.reduce((sum, t) => sum + t.amount, 0) / detailedTransactions.length
            : 0,
      }

      return NextResponse.json({
        type: "date",
        date,
        summary,
        transactions: detailedTransactions,
      })
    } else if (type === "product" && productName) {
      // ดึงรายละเอียดการขายของสินค้าเฉพาะ
      console.log("Searching for product:", productName)

      const sales = await db
        .collection("sales")
        .find({
          "items.name": productName,
        })
        .sort({ createdAt: 1 })
        .toArray()

      console.log("Found sales for product:", sales.length)

      // ดึงข้อมูล product
      const product = await db.collection("products").findOne({ name: productName })
      console.log("Product info:", product)

      const dailySales = new Map()

      console.log("=== DEBUG PRODUCT DRILL-DOWN DATE CONVERSION ===")
      sales.forEach((sale, index) => {
        // แก้ไขการแปลงเวลา - ไม่แปลงซ้ำ
        let dateKey: string

        if (sale.thaiCreatedAt) {
          // ถ้ามี thaiCreatedAt แล้ว ใช้โดยตรง
          const thaiDate = new Date(sale.thaiCreatedAt)
          dateKey = thaiDate.toISOString().split("T")[0]

          if (index < 3) {
            console.log(`Sale ${index + 1} (has thaiCreatedAt):`)
            console.log("- thaiCreatedAt:", sale.thaiCreatedAt)
            console.log("- dateKey:", dateKey)
          }
        } else {
          // ถ้าไม่มี thaiCreatedAt ให้แปลงจาก createdAt
          const utcDate = new Date(sale.createdAt)
          const thaiDate = convertToThaiTime(utcDate)
          dateKey = thaiDate.toISOString().split("T")[0]

          if (index < 3) {
            console.log(`Sale ${index + 1} (convert from createdAt):`)
            console.log("- createdAt:", sale.createdAt)
            console.log("- converted thaiDate:", thaiDate.toISOString())
            console.log("- dateKey:", dateKey)
          }
        }

        sale.items?.forEach((item) => {
          if (item.name === productName) {
            const itemRevenue = (item.price || 0) * (item.quantity || 0)
            const itemCost = product ? (product.cost || 0) * (item.quantity || 0) : 0
            const itemProfit = itemRevenue - itemCost

            if (dailySales.has(dateKey)) {
              const existing = dailySales.get(dateKey)
              existing.quantity += item.quantity || 0
              existing.revenue += itemRevenue
              existing.cost += itemCost
              existing.profit += itemProfit
              existing.transactions += 1
            } else {
              dailySales.set(dateKey, {
                date: dateKey,
                quantity: item.quantity || 0,
                revenue: itemRevenue,
                cost: itemCost,
                profit: itemProfit,
                transactions: 1,
                avgPrice: item.price || 0,
              })
            }
          }
        })
      })
      console.log("=== END DEBUG PRODUCT DRILL-DOWN ===")

      const dailyData = Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date))

      const summary = {
        totalQuantity: dailyData.reduce((sum, d) => sum + d.quantity, 0),
        totalRevenue: dailyData.reduce((sum, d) => sum + d.revenue, 0),
        totalCost: dailyData.reduce((sum, d) => sum + d.cost, 0),
        totalProfit: dailyData.reduce((sum, d) => sum + d.profit, 0),
        totalTransactions: dailyData.reduce((sum, d) => sum + d.transactions, 0),
        avgPrice: dailyData.length > 0 ? dailyData[0].avgPrice : 0,
        category: product?.category || "ไม่ระบุหมวดหมู่",
        costPerUnit: product?.cost || 0,
      }

      return NextResponse.json({
        type: "product",
        productName,
        summary,
        dailyData,
        productInfo: {
          name: productName,
          category: product?.category || "ไม่ระบุหมวดหมู่",
          cost: product?.cost || 0,
        },
      })
    } else {
      return NextResponse.json(
        { error: "Invalid parameters. Required: type and (date or productName)" },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("Error in drill-down API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch drill-down data",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
