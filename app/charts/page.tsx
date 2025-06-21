"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  PieChart,
  LineChart,
} from "lucide-react";
import Link from "next/link";
import SalesChart from "@/components/charts/salesChart";
import ProductChart from "@/components/charts/productChart";
import { SalesReport } from "@/types/types";

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chart display states
  const [salesChartType, setSalesChartType] = useState<"line" | "bar">("line");
  const [productChartType, setProductChartType] = useState<"bar" | "pie">(
    "bar"
  );

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);

    fetchReport(
      thirtyDaysAgo.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
  }, []);

  const fetchReport = async (start?: string, end?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      console.log("Fetching report with params:", params.toString());

      const response = await fetch(`/api/reports/sales?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Report data received:", data);
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      setError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (startDate && endDate) {
      fetchReport(startDate, endDate);
    } else {
      setError("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">กราฟ</h1>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label> */}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label> */}
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="btn btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    กำลังโหลด...
                  </>
                ) : (
                  "สร้างรายงาน"
                )}
              </button>
            </div>

            <Link href="/" className="btn btn-secondary">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 mx-auto py-3 sm:px-6 lg:px-3 gap-3">
        {/* Error Display */}
        {error && (
          <div className="card border-red-200 bg-red-50">
            <div className="p-6">
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">เกิดข้อผิดพลาด:</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {report && (
          <>
            {/* Sales Chart */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    แนวโน้มยอดขาย
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSalesChartType("line")}
                      className={`btn btn-sm ${
                        salesChartType === "line"
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      <LineChart className="w-4 h-4 mr-1" />
                      เส้น
                    </button>
                    <button
                      onClick={() => setSalesChartType("bar")}
                      className={`btn btn-sm ${
                        salesChartType === "bar"
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      แท่ง
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {report.dailySales.length > 0 ? (
                  <SalesChart
                    data={report.dailySales}
                    type={salesChartType}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    ไม่มีข้อมูลการขายในช่วงเวลาที่เลือก
                  </div>
                )}
              </div>
            </div>

            {/* Product Chart */}
            <div className="card ">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    สินค้าขายดี
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setProductChartType("bar")}
                      className={`btn btn-sm ${
                        productChartType === "bar"
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      แท่ง
                    </button>
                    <button
                      onClick={() => setProductChartType("pie")}
                      className={`btn btn-sm ${
                        productChartType === "pie"
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      <PieChart className="w-4 h-4 mr-1" />
                      วงกลม
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {report.topProducts.length > 0 ? (
                  <ProductChart
                    data={report.topProducts}
                    type={productChartType}
          
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    ไม่มีข้อมูลสินค้าในช่วงเวลาที่เลือก
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!loading && !error && !report && (
          <div className="card">
            <div className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ไม่มีข้อมูลรายงาน
              </h3>
              <p className="text-gray-600 mb-4">
                กรุณาเลือกช่วงเวลาและกดสร้างรายงาน
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
