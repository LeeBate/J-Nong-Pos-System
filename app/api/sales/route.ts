import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { formatThaiDateTime, convertToThaiTime } from "@/lib/utils"
import { ObjectId } from "mongodb"
import { CustomerService } from "@/services/customerService"

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
      await db
        .collection("products")
        .updateOne({ _id: new ObjectId(item.productId) }, { $inc: { stock: -item.quantity } })
    }

    // Update customer data using CustomerService
    if (saleData.customerId) {
      // อัปเดตยอดซื้อและระดับสมาชิก
      await CustomerService.updatePurchaseAmount(saleData.customerId, saleData.totalAmount)

      // เพิ่มแต้มถ้ามี
      if (saleData.pointsEarned > 0) {
        await CustomerService.addPoints(
          saleData.customerId,
          saleData.pointsEarned,
          `ได้รับแต้มจากการซื้อสินค้า ฿${saleData.totalAmount.toLocaleString()}`,
          saleResult.insertedId.toString(),
        )
      }

      // หักแต้มถ้ามีการใช้
      if (saleData.pointsUsed > 0) {
        await CustomerService.redeemPoints(
          saleData.customerId,
          saleData.pointsUsed,
          `ใช้แต้มลดราคา ฿${saleData.pointsUsed.toLocaleString()}`,
          saleResult.insertedId.toString(),
        )
      }
    } else if (saleData.customerName && saleData.customerPhone) {
      // Create or update customer without ID
      try {
        const existingCustomer = await CustomerService.findByPhone(saleData.customerPhone)
        if (existingCustomer) {
          await CustomerService.updatePurchaseAmount(existingCustomer._id!, saleData.totalAmount)
          if (saleData.pointsEarned > 0) {
            await CustomerService.addPoints(
              existingCustomer._id!,
              saleData.pointsEarned,
              `ได้รับแต้มจากการซื้อสินค้า ฿${saleData.totalAmount.toLocaleString()}`,
              saleResult.insertedId.toString(),
            )
          }
        } else {
          // สร้างลูกค้าใหม่
          const newCustomer = await CustomerService.createCustomer({
            name: saleData.customerName,
            phone: saleData.customerPhone,
          })
          await CustomerService.updatePurchaseAmount(newCustomer._id!, saleData.totalAmount)
          if (saleData.pointsEarned > 0) {
            await CustomerService.addPoints(
              newCustomer._id!,
              saleData.pointsEarned,
              `ได้รับแต้มจากการซื้อสินค้า ฿${saleData.totalAmount.toLocaleString()}`,
              saleResult.insertedId.toString(),
            )
          }
        }
      } catch (error) {
        console.error("Error handling customer data:", error)
      }
    }

    return NextResponse.json({
      success: true,
      id: saleResult.insertedId,
      thaiDateTime: dateTime.thaiDateString, // ส่งกลับเวลาไทยเพื่อตรวจสอบ
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
