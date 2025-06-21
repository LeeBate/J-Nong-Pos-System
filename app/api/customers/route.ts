import { type NextRequest, NextResponse } from "next/server"
import { CustomerService } from "@/services/customerService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search")

    if (search) {
      const customers = await CustomerService.searchCustomers(search)
      return NextResponse.json(customers)
    }

    const result = await CustomerService.getAllCustomers(page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json()

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!customerData.name || !customerData.phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    // ตรวจสอบว่าเบอร์โทรซ้ำหรือไม่
    const existingCustomer = await CustomerService.findByPhone(customerData.phone)
    if (existingCustomer) {
      return NextResponse.json({ error: "Phone number already exists" }, { status: 409 })
    }

    const newCustomer = await CustomerService.createCustomer(customerData)

    return NextResponse.json({ success: true, customer: newCustomer })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
