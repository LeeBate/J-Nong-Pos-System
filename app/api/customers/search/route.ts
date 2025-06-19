import { type NextRequest, NextResponse } from "next/server"
import { CustomerService } from "@/lib/customerService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const customer = await CustomerService.findByPhone(phone)

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error searching customer:", error)
    return NextResponse.json({ error: "Failed to search customer" }, { status: 500 })
  }
}
