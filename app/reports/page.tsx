"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  PieChart,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import DrillDownModal from "@/components/drillDownModal";
import { SalesData } from "@/lib/types";

type ReportType = "standard" | "category";

export default function ReportsPage() {
  const [report, setReport] = useState<SalesData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType>("standard");
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);

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
      if (selectedReportType) params.append("reportType", selectedReportType);

      const response = await fetch(`/api/reports/sales?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
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

  const handleDateClick = (date: string) => {
    setDrillDownData({
      type: "date",
      title: `รายละเอียดการขาย - ${new Date(date).toLocaleDateString("th-TH")}`,
      data: { date },
    });
    setShowDrillDown(true);
  };

  const handleProductClick = (productName: string) => {
    setDrillDownData({
      type: "product",
      title: `รายละเอียดสินค้า - ${productName}`,
      data: { productName },
    });
    setShowDrillDown(true);
  };

  const exportReport = () => {
    if (!report) return;

    const csvContent = [
      ["รายงานการขาย"],
      ["ช่วงเวลา", `${startDate} ถึง ${endDate}`],
      [
        "ประเภทรายงาน",
        selectedReportType === "standard"
          ? "กำไร/ขาดทุน"
          : selectedReportType === "category"
          ? "ตามหมวดหมู่"
          : "มาตรฐาน",
      ],
      [""],
      ["สรุปยอดขาย"],
      ["ยอดขายรวม", report.totalSales.toLocaleString()],
      ["จำนวนธุรกรรม", report.totalTransactions.toString()],
      ["ยอดเฉลี่ยต่อธุรกรรม", report.averageTransaction.toLocaleString()],
      ...(report.totalCost
        ? [["ต้นทุนรวม", report.totalCost.toLocaleString()]]
        : []),
      ...(report.totalProfit
        ? [["กำไรรวม", report.totalProfit.toLocaleString()]]
        : []),
      ...(report.profitMargin
        ? [["อัตรากำไร", `${report.profitMargin}%`]]
        : []),
      [""],
      ["สินค้าขายดี"],
      [
        "ชื่อสินค้า",
        "จำนวนขาย",
        "รายได้",
        ...(selectedReportType === "standard" ? ["ต้นทุน", "กำไร"] : []),
        ...(selectedReportType === "category" ? ["หมวดหมู่"] : []),
      ],
      ...report.topProducts.map((product) => [
        product.name,
        product.quantity.toString(),
        product.revenue.toLocaleString(),
        ...(selectedReportType === "standard" && product.cost
          ? [
              product.cost.toLocaleString(),
              product.profit?.toLocaleString() || "0",
            ]
          : []),
        ...(selectedReportType === "category" && product.category
          ? [product.category]
          : []),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales-report-${selectedReportType}-${startDate}-${endDate}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">รายงานการขาย</h1>
            </div>
            <Link href="/" className="btn btn-secondary">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </header>

      {/* Report Type Selection */}
      <div className="flex justify-between bg-white border-b border-gray-200">
        <div className="p-3 xl:p-6">
          <div className="flex  gap-3">
            <button
              onClick={() => setSelectedReportType("standard")}
              className={`flex items-center btn-report ${
                selectedReportType === "standard"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>รายงานมาตรฐาน</span>
            </button>

            <button
              onClick={() => setSelectedReportType("category")}
              className={`flex items-center btn-report ${
                selectedReportType === "category"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <PieChart className="h-4 w-4" />
              <span>รายงานตามหมวดหมู่</span>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </button>
          </div>
        </div>

        <div className="p-3 xl:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
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
            {report && (
              <button
                onClick={exportReport}
                className="xl:flex btn btn-secondary items-center hidden "
              >
                <Download className="w-4 h-4 mr-2" />
                ส่งออก CSV
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mx-auto py-3 sm:px-6 lg:px-3 gap-3">
        {/* Error Display */}
        {error && (
          <div className="card border-red-200 bg-red-50 lg:col-span-2">
            <div className="p-6">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="font-medium">เกิดข้อผิดพลาด:</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {report && (
          <>
            {/* Summary Cards */}
            <div
              className={`grid grid-cols-1 md:grid-cols-6 xl:grid-cols-6 gap-3 lg:col-span-2`}
            >
              <>
                <div className="card p-6 divResponsive">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        ยอดขายรวม
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        ฿{report.totalSales.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full hiddienIcon">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                </div>

                <div className="card p-6 divResponsive">

                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        ต้นทุนรวม
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        ฿{report.totalCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full hiddienIcon">
                      <DollarSign className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                <div className="card p-6 divResponsive">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        กำไรรวม
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          (report.totalProfit || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ฿{(report.totalProfit || 0).toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`hiddienIcon p-3 rounded-full ${
                        (report.totalProfit || 0) >= 0
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <TrendingUp
                        className={`h-6 w-6 ${
                          (report.totalProfit || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    </div>
                </div>

                <div className="card p-6 divResponsive">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        อัตรากำไร
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          (report.profitMargin || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(report.profitMargin || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div
                      className={`hiddienIcon p-3 rounded-full ${
                        (report.profitMargin || 0) >= 0
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <BarChart3
                        className={`h-6 w-6 ${
                          (report.profitMargin || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    </div>
                </div>

                <div className="card p-6 divResponsive">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        จำนวนธุรกรรม
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {report.totalTransactions}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full hiddienIcon">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                </div>

                <div className="card p-6 divResponsive">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        ยอดเฉลี่ยต่อธุรกรรม
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        ฿{report.averageTransaction.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full hiddienIcon">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
              </>
            </div>

            {/* Daily Sales Table */}
            <div className="card lg:col-span-1">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  ตารางยอดขายรายวัน
                </h2>
              </div>
              <div className="overFlowAuto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>วันที่</th>
                      <th className="text-right">ยอดขาย</th>

                      <th className="text-right">ต้นทุน</th>
                      <th className="text-right">กำไร</th>

                      <th className="text-right">จำนวนธุรกรรม</th>
                      <th className="text-center">ดูรายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailySales.length > 0 ? (
                      report.dailySales.map((day, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="font-medium text-gray-900">
                            {new Date(day.date).toLocaleDateString("th-TH")}
                          </td>
                          <td className="text-right text-gray-900">
                            ฿{day.sales.toLocaleString()}
                          </td>

                          <td className="text-right text-red-600">
                            ฿{(day.cost || 0).toLocaleString()}
                          </td>
                          <td
                            className={`text-right font-medium ${
                              (day.profit || 0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ฿{(day.profit || 0).toLocaleString()}
                          </td>
                          <td className="text-right text-gray-900">
                            {day.transactions}
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDateClick(day.date)}
                              className="btn btn-sm btn-secondary"
                            >
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-500"
                        >
                          ไม่มีข้อมูลการขายในช่วงเวลาที่เลือก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Report Table */}
            {selectedReportType === "category" && report.categoryReport && (
              <div className="card lg:col-span-1">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    รายงานยอดขายตามหมวดหมู่
                  </h2>
                </div>
                <div className="overFlowAuto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>หมวดหมู่</th>
                        <th className="text-right">จำนวนขาย</th>
                        <th className="text-right">ยอดขาย</th>
                        <th className="text-right">ต้นทุน</th>
                        <th className="text-right">กำไร</th>
                        <th className="text-right">อัตรากำไร</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.categoryReport.map((category, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="font-medium text-gray-900">
                            {category.category}
                          </td>
                          <td className="text-right text-gray-900">
                            {category.quantity}
                          </td>
                          <td className="text-right text-gray-900">
                            ฿{category.revenue.toLocaleString()}
                          </td>
                          <td className="text-right text-red-600">
                            ฿{category.cost.toLocaleString()}
                          </td>
                          <td
                            className={`text-right font-medium ${
                              category.profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ฿{category.profit.toLocaleString()}
                          </td>
                          <td
                            className={`text-right ${
                              category.profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {category.revenue > 0
                              ? (
                                  (category.profit / category.revenue) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Products Table */}
            <div className="card lg:col-span-1">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedReportType === "category"
                    ? "สินค้าขายดี (แยกตามหมวดหมู่)"
                    : "สินค้าขายดี (เรียงตามกำไร)"}
                </h2>
              </div>
              <div className="overFlowAuto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ชื่อสินค้า</th>
                      <th className="text-right">จำนวนขาย</th>
                      <th className="text-right">รายได้</th>

                      <th className="text-right">ต้นทุน</th>
                      <th className="text-right">กำไร</th>

                      {selectedReportType === "category" && (
                        <th className="text-center">หมวดหมู่</th>
                      )}
                      <th className="text-center">ดูรายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topProducts.length > 0 ? (
                      report.topProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="text-right text-gray-900">
                            {product.quantity}
                          </td>
                          <td className="text-right font-medium text-gray-900">
                            ฿{product.revenue.toLocaleString()}
                          </td>

                          <td className="text-right text-red-600">
                            ฿{(product.cost || 0).toLocaleString()}
                          </td>
                          <td
                            className={`text-right font-medium ${
                              (product.profit || 0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ฿{(product.profit || 0).toLocaleString()}
                          </td>

                          {selectedReportType === "category" && (
                            <td className="text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {product.category || "ไม่ระบุ"}
                              </span>
                            </td>
                          )}
                          <td className="text-center">
                            <button
                              onClick={() => handleProductClick(product.name)}
                              className="btn btn-sm btn-secondary"
                            >
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={selectedReportType === "category" ? 5 : 4}
                          className="text-center py-8 text-gray-500"
                        >
                          ไม่มีข้อมูลสินค้าในช่วงเวลาที่เลือก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!loading && !error && !report && (
          <div className="card lg:col-span-2">
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

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        drillDownData={drillDownData}
      />
    </div>
  );
}
