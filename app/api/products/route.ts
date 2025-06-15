import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/types";

export async function GET() {
  try {
    const db = await getDatabase();
    const products = await db
      .collection<Product>("products")
      .find({})
      .toArray();

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    const product: Omit<Product, "_id"> = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({ _id: result.insertedId, ...product });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
