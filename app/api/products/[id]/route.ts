import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest, context: any) {
  const { id } = await context.params;
  try {
    const db = await getDatabase();
    const body = await request.json();

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const { id } = await context.params;
  try {
    const db = await getDatabase();

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
