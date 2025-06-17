import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import {
  convertToThaiTime,
  getThaiDateOnly,
  getCurrentThaiTime,
} from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "standard";

    // กำหนดช่วงเวลาเริ่มต้น (30 วันที่ผ่านมา) ตามเวลาไทย
    const currentThaiTime = getCurrentThaiTime();

    console.log("=== DEBUG DATE CALCULATION ===");
    console.log("Current Thai Time:", currentThaiTime.toISOString());
    console.log("Thai Time Breakdown:", {
      year: currentThaiTime.getUTCFullYear(),
      month: currentThaiTime.getUTCMonth() + 1,
      date: currentThaiTime.getUTCDate(),
      hours: currentThaiTime.getUTCHours(),
      minutes: currentThaiTime.getUTCMinutes(),
    });

    let startDate: Date;
    let endDate: Date;

    if (startDateParam) {
      // แปลง date string เป็น Date object และปรับเป็นเวลาไทย
      const inputDate = new Date(startDateParam);
      startDate = new Date(inputDate.getTime() + 7 * 60 * 60 * 1000); // เพิ่ม 7 ชั่วโมงเพื่อให้เป็นเวลาไทย
    } else {
      // สร้าง startDate จากวันที่ของ currentThaiTime ลบ 30 วัน
      const startThaiDate = new Date(
        currentThaiTime.getUTCFullYear(),
        currentThaiTime.getUTCMonth(),
        currentThaiTime.getUTCDate() - 30
      );
      startDate = new Date(startThaiDate.getTime() + 7 * 60 * 60 * 1000);
      console.log("Start Date Calculation:");
      console.log("- Base Date:", startThaiDate.toISOString());
      console.log("- After +7h:", startDate.toISOString());
    }

    if (endDateParam) {
      // แปลง date string เป็น Date object และปรับเป็นเวลาไทย
      const inputDate = new Date(endDateParam);
      endDate = new Date(inputDate.getTime() + 7 * 60 * 60 * 1000); // เพิ่ม 7 ชั่วโมงเพื่อให้เป็นเวลาไทย
    } else {
      // สร้าง endDate จากวันที่ของ currentThaiTime แต่ตั้งเวลาเป็น 00:00:00
      const endThaiDate = new Date(
        currentThaiTime.getUTCFullYear(),
        currentThaiTime.getUTCMonth(),
        currentThaiTime.getUTCDate()
      );
      endDate = new Date(endThaiDate.getTime() + 7 * 60 * 60 * 1000);
      console.log("End Date Calculation:");
      console.log("- Base Date:", endThaiDate.toISOString());
      console.log("- After +7h:", endDate.toISOString());
    }

    console.log("Before setting hours:");
    console.log("Start Date:", startDate.toISOString());
    console.log("End Date:", endDate.toISOString());

    // ปรับเวลาให้ครอบคลุมทั้งวัน โดยใช้ UTC methods
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log("After setting hours:");
    console.log("Start Date:", startDate.toISOString());
    console.log("End Date:", endDate.toISOString());
    console.log("=== END DEBUG ===");

    console.log("Report Query Range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reportType,
      currentThaiTime: currentThaiTime.toISOString(),
    });

    // ดึงข้อมูลการขายทั้งหมดในช่วงเวลาที่กำหนด
    // ใช้ thaiCreatedAt ถ้ามี หรือคำนวณจาก createdAt
    const allSales = await db
      .collection("sales")
      .find({
        $or: [
          {
            // ถ้ามีฟิลด์ thaiCreatedAt ให้ใช้ฟิลด์นี้
            thaiCreatedAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
          {
            // สำหรับข้อมูลเก่าที่ไม่มี thaiCreatedAt
            // แปลงช่วงเวลาไทยกลับเป็น UTC สำหรับการ query
            createdAt: {
              $gte: new Date(startDate.getTime() - 7 * 60 * 60 * 1000), // ลบ 7 ชั่วโมงเพื่อให้ตรงกับเวลาไทย
              $lte: new Date(endDate.getTime() - 7 * 60 * 60 * 1000),
            },
          },
        ],
      })
      .toArray();

    console.log("Found sales:", allSales.length);

    // ดึงข้อมูล products ทั้งหมดเพื่อ join
    const allProducts = await db.collection("products").find({}).toArray();
    const productMap = new Map();
    allProducts.forEach((product) => {
      productMap.set(product._id.toString(), product);
    });

    // คำนวณสรุปยอดขาย
    const totalSales = allSales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );
    const totalTransactions = allSales.length;
    const averageTransaction =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // คำนวณต้นทุนและกำไรรวม
    let totalCost = 0;
    let totalProfit = 0;

    // คำนวณสินค้าขายดีและข้อมูลหมวดหมู่
    const productSales = new Map();
    const categorySales = new Map();

    allSales.forEach((sale) => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item) => {
          const product = productMap.get(item.productId);
          const itemRevenue = (item.price || 0) * (item.quantity || 0);
          const itemCost = product
            ? (product.cost || 0) * (item.quantity || 0)
            : 0;
          const itemProfit = itemRevenue - itemCost;

          totalCost += itemCost;
          totalProfit += itemProfit;

          // สินค้าขายดี
          const productKey = item.name || item.productId;
          if (productSales.has(productKey)) {
            const existing = productSales.get(productKey);
            existing.quantity += item.quantity || 0;
            existing.revenue += itemRevenue;
            existing.cost += itemCost;
            existing.profit += itemProfit;
          } else {
            productSales.set(productKey, {
              name: item.name || `Product ${item.productId}`,
              quantity: item.quantity || 0,
              revenue: itemRevenue,
              cost: itemCost,
              profit: itemProfit,
              category: product?.category || "ไม่ระบุหมวดหมู่",
            });
          }

          // ยอดขายตามหมวดหมู่
          const category = product?.category || "ไม่ระบุหมวดหมู่";
          if (categorySales.has(category)) {
            const existing = categorySales.get(category);
            existing.quantity += item.quantity || 0;
            existing.revenue += itemRevenue;
            existing.cost += itemCost;
            existing.profit += itemProfit;
            existing.transactions += 1;
          } else {
            categorySales.set(category, {
              category,
              quantity: item.quantity || 0,
              revenue: itemRevenue,
              cost: itemCost,
              profit: itemProfit,
              transactions: 1,
            });
          }
        });
      }
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => {
        if (reportType === "standard") {
          return b.profit - a.profit; // เรียงตามกำไร
        }
        return b.revenue - a.revenue; // เรียงตามยอดขาย
      })
      .slice(0, 5);

    const categoryReport = Array.from(categorySales.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // คำนวณยอดขายรายวัน - แก้ไขการคำนวณ dateKey
    const dailySalesMap = new Map();

    console.log("=== DEBUG DAILY SALES CALCULATION ===");
    allSales.forEach((sale, index) => {
      let dateKey: string;

      const thaiDate = new Date(sale.thaiCreatedAt);
      dateKey = thaiDate.toISOString().split("T")[0];

      let dailyCost = 0;

      // คำนวณต้นทุนรายวัน
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item) => {
          const product = productMap.get(item.productId);
          dailyCost += product ? (product.cost || 0) * (item.quantity || 0) : 0;
        });
      }

      if (dailySalesMap.has(dateKey)) {
        const existing = dailySalesMap.get(dateKey);
        existing.sales += sale.totalAmount || 0;
        existing.cost += dailyCost;
        existing.profit += (sale.totalAmount || 0) - dailyCost;
        existing.transactions += 1;
      } else {
        dailySalesMap.set(dateKey, {
          date: dateKey,
          sales: sale.totalAmount || 0,
          cost: dailyCost,
          profit: (sale.totalAmount || 0) - dailyCost,
          transactions: 1,
        });
      }
    });
    console.log("=== END DEBUG DAILY SALES ===");

    const dailySales = Array.from(dailySalesMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const report = {
      totalSales: Math.round(totalSales * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitMargin:
        totalSales > 0
          ? Math.round((totalProfit / totalSales) * 10000) / 100
          : 0,
      totalTransactions,
      averageTransaction: Math.round(averageTransaction * 100) / 100,
      topProducts,
      categoryReport,
      dailySales,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      reportType,
      debug: {
        salesFound: allSales.length,
        productsFound: allProducts.length,
        queryRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
        currentThaiTime: currentThaiTime.toISOString(),
        calculations: {
          startDateCalculation: startDateParam
            ? `${startDateParam} + 7h`
            : `currentThai - 30d`,
          endDateCalculation: endDateParam
            ? `${endDateParam} + 7h`
            : `currentThai`,
        },
      },
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error generating sales report:", error);
    return NextResponse.json(
      {
        error: "Failed to generate report",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
