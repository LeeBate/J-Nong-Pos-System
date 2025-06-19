// บริการจัดการลูกค้า
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { calculateMembershipLevel } from "./pointsSystem"
import { Customer, PointsTransaction } from "./types"



export class CustomerService {
  // สร้างลูกค้าใหม่
  static async createCustomer(
    customerData: Omit<
      Customer,
      "_id" | "createdAt" | "updatedAt" | "totalPurchases" | "points" | "membershipLevel" | "isActive"
    >,
  ): Promise<Customer> {
    const db = await getDatabase()

    const newCustomer: Omit<Customer, "_id"> = {
      ...customerData,
      totalPurchases: 0,
      points: 0,
      membershipLevel: "Bronze",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("customers").insertOne(newCustomer)

    return {
      ...newCustomer,
      _id: result.insertedId.toString(),
    }
  }

  // ค้นหาลูกค้าด้วยเบอร์โทร
  static async findByPhone(phone: string): Promise<Customer | null> {
    const db = await getDatabase()
    const customer = await db.collection("customers").findOne({ phone, isActive: true })

    if (!customer) return null

    return {
      ...customer,
      _id: customer._id.toString(),
    } as Customer
  }

  // อัปเดตข้อมูลลูกค้า
  static async updateCustomer(customerId: string, updateData: Partial<Customer>): Promise<boolean> {
    const db = await getDatabase()

    const result = await db.collection("customers").updateOne(
      { _id: new ObjectId(customerId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  // เพิ่มแต้มให้ลูกค้า
  static async addPoints(customerId: string, points: number, description: string, saleId?: string): Promise<void> {
    const db = await getDatabase()

    // เพิ่มแต้มให้ลูกค้า
    await db.collection("customers").updateOne(
      { _id: new ObjectId(customerId) },
      {
        $inc: { points: points },
        $set: { updatedAt: new Date() },
      },
    )

    // บันทึกประวัติการเพิ่มแต้ม
    const pointsTransaction: Omit<PointsTransaction, "_id"> = {
      customerId,
      type: "earn",
      points,
      description,
      saleId,
      createdAt: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // แต้มหมดอายุใน 1 ปี
    }

    await db.collection("pointsTransactions").insertOne(pointsTransaction)
  }

  // ใช้แต้ม
  static async redeemPoints(
    customerId: string,
    points: number,
    description: string,
    saleId?: string,
  ): Promise<boolean> {
    const db = await getDatabase()

    // ตรวจสอบแต้มคงเหลือ
    const customer = await db.collection("customers").findOne({ _id: new ObjectId(customerId) })
    if (!customer || customer.points < points) {
      return false
    }

    // หักแต้ม
    await db.collection("customers").updateOne(
      { _id: new ObjectId(customerId) },
      {
        $inc: { points: -points },
        $set: { updatedAt: new Date() },
      },
    )

    // บันทึกประวัติการใช้แต้ม
    const pointsTransaction: Omit<PointsTransaction, "_id"> = {
      customerId,
      type: "redeem",
      points: -points,
      description,
      saleId,
      createdAt: new Date(),
    }

    await db.collection("pointsTransactions").insertOne(pointsTransaction)

    return true
  }

  // อัปเดตยอดซื้อและระดับสมาชิก
  static async updatePurchaseAmount(customerId: string, amount: number): Promise<void> {
    const db = await getDatabase()

    // อัปเดตยอดซื้อรวม
    const result = await db.collection("customers").findOneAndUpdate(
      { _id: new ObjectId(customerId) },
      {
        $inc: { totalPurchases: amount },
        $set: {
          lastPurchase: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (result) {
      // คำนวณระดับสมาชิกใหม่
      const newLevel = calculateMembershipLevel(result.totalPurchases)

      // อัปเดตระดับสมาชิกถ้าเปลี่ยนแปลง
      if (result.membershipLevel !== newLevel) {
        await db
          .collection("customers")
          .updateOne({ _id: new ObjectId(customerId) }, { $set: { membershipLevel: newLevel } })
      }
    }
  }

  // ดึงประวัติแต้ม
  static async getPointsHistory(customerId: string, limit = 50): Promise<PointsTransaction[]> {
    const db = await getDatabase()

    const transactions = await db
      .collection("pointsTransactions")
      .find({ customerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return transactions.map((t) => ({
      ...t,
      _id: t._id.toString(),
    })) as PointsTransaction[]
  }

  // ดึงรายการลูกค้าทั้งหมด
  static async getAllCustomers(page = 1, limit = 50): Promise<{ customers: Customer[]; total: number }> {
    const db = await getDatabase()

    const skip = (page - 1) * limit

    const [customers, total] = await Promise.all([
      db.collection("customers").find({ isActive: true }).sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("customers").countDocuments({ isActive: true }),
    ])

    return {
      customers: customers.map((c) => ({
        ...c,
        _id: c._id.toString(),
      })) as Customer[],
      total,
    }
  }

  // ค้นหาลูกค้า
  static async searchCustomers(query: string): Promise<Customer[]> {
    const db = await getDatabase()

    const customers = await db
      .collection("customers")
      .find({
        isActive: true,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray()

    return customers.map((c) => ({
      ...c,
      _id: c._id.toString(),
    })) as Customer[]
  }

  // ลบลูกค้า (soft delete)
  static async deleteCustomer(customerId: string): Promise<boolean> {
    const db = await getDatabase()

    const result = await db.collection("customers").updateOne(
      { _id: new ObjectId(customerId) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  // ปรับแต้มด้วยตนเอง (สำหรับแอดมิน)
  static async adjustPoints(customerId: string, points: number, description: string): Promise<boolean> {
    const db = await getDatabase()

    // อัปเดตแต้ม
    await db.collection("customers").updateOne(
      { _id: new ObjectId(customerId) },
      {
        $inc: { points: points },
        $set: { updatedAt: new Date() },
      },
    )

    // บันทึกประวัติ
    const pointsTransaction: Omit<PointsTransaction, "_id"> = {
      customerId,
      type: "adjust",
      points,
      description,
      createdAt: new Date(),
    }

    await db.collection("pointsTransactions").insertOne(pointsTransaction)

    return true
  }
}
