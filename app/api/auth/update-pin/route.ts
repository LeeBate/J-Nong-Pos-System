import { type NextRequest, NextResponse } from "next/server";
import { authenticateRequest, updateUserPIN } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { pin } = await request.json();

    let newPin = pin;

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN ต้องเป็นตัวเลข 6 หลัก" },
        { status: 400 }
      );
    }

    const success = await updateUserPIN(user._id, newPin);

    if (!success) {
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการอัปเดต PIN" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pin: newPin,
    });
  } catch (error) {
    console.error("Update PIN error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
