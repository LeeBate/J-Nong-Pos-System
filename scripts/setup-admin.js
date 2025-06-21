// สร้าง Admin User เริ่มต้น
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const uri = "mongodb+srv://nattaphongdev:Skdilk001@cluster0.e4vs5ix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const dbName = 'pos-app'

async function setupAdmin() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)

    // ตรวจสอบว่ามี admin user อยู่แล้วหรือไม่
    const existingAdmin = await db.collection("users").findOne({
      username: "lee",
      role: "manager",
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    // สร้าง admin user
    const hashedPassword = await bcrypt.hash("skdilk001", 12)

    const adminUser = {
      username: "lee",
      password: hashedPassword,
      role: "manager",
      fullName: "ผู้จัดการ",
      email: "nattaphonglee@gmail.com",
      phone: null,
      pin: "123456",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").insertOne(adminUser)
    console.log("Admin user created successfully")
  } catch (error) {
    console.error("Error setting up admin:", error)
  } finally {
    await client.close()
  }
}

setupAdmin()
