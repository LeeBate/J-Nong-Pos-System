import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { formatThaiDateTime, convertToThaiTime } from "@/lib/utils"

// แก้ไขฟังก์ชัน getThaiDateTime()
function getThaiDateTime() {
  const now = new Date()
  const thaiTime = convertToThaiTime(now) // ใช้ convertToThaiTime แทน getCurrentThaiTime

  return {
    utcDate: now,
    thaiDate: thaiTime,
    thaiDateString: formatThaiDateTime(now), // ส่ง UTC date เข้าไปให้ฟังก์ชันแปลงเอง
    thaiDay: thaiTime.getUTCDate(), // ใช้ getUTCDate เพราะ thaiTime เป็น Date object ที่ปรับเวลาแล้ว
    thaiMonth: thaiTime.getUTCMonth() + 1,
    thaiYear: thaiTime.getUTCFullYear(),
  }
}

// Update the POST function to handle points and discounts
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const saleData = await request.json()

    // ใช้ฟังก์ชันเพื่อรับเวลาไทย
    const dateTime = getThaiDateTime()

    console.log("DateTime debug:", {
      utc: dateTime.utcDate.toISOString(),
      thai: dateTime.thaiDate.toISOString(),
      thaiString: dateTime.thaiDateString,
      thaiDay: dateTime.thaiDay,
      thaiMonth: dateTime.thaiMonth,
      thaiYear: dateTime.thaiYear,
    })

    const saleResult = await db.collection("sales").insertOne({
      ...saleData,
      createdAt: dateTime.utcDate, // ยังคงเก็บเวลา UTC สำหรับการใช้งานทั่วไป
      thaiCreatedAt: dateTime.thaiDate, // เพิ่มเวลาไทย
      thaiDateString: dateTime.thaiDateString, // เพิ่มสตริงเวลาไทยที่อ่านง่าย
      thaiDay: dateTime.thaiDay, // วันที่ตามเวลาไทย
      thaiMonth: dateTime.thaiMonth, // เดือนตามเวลาไทย
      thaiYear: dateTime.thaiYear, // ปีตามเวลาไทย
    })

    // Update product stock
    for (const item of saleData.items) {
      await db.collection("products").updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } })
    }

    // Update customer data
    if (saleData.customerId) {
      const updateData: any = {
        $set: {
          lastPurchase: dateTime.utcDate,
          thaiLastPurchase: dateTime.thaiDate,
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
            lastPurchase: dateTime.utcDate,
            thaiLastPurchase: dateTime.thaiDate,
          },
          $inc: {
            totalPurchases: saleData.totalAmount,
          },
          $setOnInsert: {
            points: 0,
            membershipLevel: "Bronze",
            createdAt: dateTime.utcDate,
            thaiCreatedAt: dateTime.thaiDate,
          },
        },
        { upsert: true },
      )
    }

    return NextResponse.json({
      success: true,
      id: saleResult.insertedId,
      thaiDateTime: dateTime.thaiDateString, // ส่งกลับเวลาไทยเพื่อตรวจสอบ
      // debug: {
      //   utc: dateTime.utcDate.toISOString(),
      //   thai: dateTime.thaiDate.toISOString(),
      //   thaiString: dateTime.thaiDateString,
      // },
    })
  } catch (error) {
    console.error("Error processing sale:", error)
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const sales = await db.collection("sales").find({}).sort({ createdAt: -1 }).toArray()

    // แปลงข้อมูลเวลาให้เป็นเวลาไทยก่อนส่งกลับ
    const salesWithThaiTime = sales.map((sale) => {
      if (!sale.thaiDateString) {
        // ใช้ฟังก์ชันจาก thai-time.ts แทน
        const thaiTime = convertToThaiTime(new Date(sale.createdAt))
        sale.thaiCreatedAt = thaiTime
        sale.thaiDateString = formatThaiDateTime(new Date(sale.createdAt))
      }
      return sale
    })

    return NextResponse.json(salesWithThaiTime)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}
